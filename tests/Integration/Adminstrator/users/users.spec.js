
/* istanbul ignore file */
const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nonVerifedInvitedUser=null;
let createdUser=null;
let verifedAdmin=null;
const fs = require('fs');
describe('Test the user invite api', () => {
  beforeAll(async () => {
    createdUser= await (await UserDB.create(testData.verified_user)).toObject();
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return await UserDB.db.dropCollection('users');
  });
  test('Admin user should filter all users', async () => {
    const Users= await helper.get('/admin/users/filter', {email: 'korede.moshood@mvxchange.com'}, verifedAdmin.body._token).expect(200);
    expect(Users.body.total_users).toBe(1);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(1);
  });
  test('Admin user should search and filter all users', async () => {
    const Users= await helper.get('/admin/users/search', {search: 'k', filter: 'administrator'}, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
    expect(Users.body.data.length).toBe(1);
  });
  test('Admin should get all users', async () => {
    const Users= await helper.get('/admin/users', {data: testData.invite_list}, verifedAdmin.body._token).expect(200);
    expect(Users.body.total_users).toBe(2);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(2);
  });
  test('Admin should get a single user', async () => {
    const Users= await helper.get(`/admin/users/${createdUser._id.toString()}`, null, verifedAdmin.body._token).expect(200);
    expect(Users.body.user).toBeTruthy();
  });
  test('Admin should update a user role', async () => {
    const Users= await helper.put(`/admin/users/role/${createdUser._id.toString()}`, {
      'role': 'administrator'
    }, verifedAdmin.body._token).expect(200);
    expect(Users.body.user).toBeTruthy();
    expect(Users.body.user.role).toBe('administrator');
  });
  test('Admin should NOT update a user role with missing data', async () => {
    const Users= await helper.put(`/admin/users/role/${createdUser._id.toString()}`, {
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin should update a user profile', async () => {
    const Users= await helper.put(`/admin/users/${createdUser._id.toString()}`, {
      'name': 'seun'
    }, verifedAdmin.body._token).expect(200);
    expect(Users.body.user).toBeTruthy();
    expect(Users.body.user.name).toBe('seun');
  });
  test('Admin should NOT update a user profile to an existing email', async () => {
    const Users= await helper.put(`/admin/users/${createdUser._id.toString()}`, {
      'email': 'kenykore@gmail.com'
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin should delete a user with wrong mongo id', async () => {
    await helper.delete(`/admin/users/jgjgjjg`, null, verifedAdmin.body._token).expect(400);
  });
  test('Admin should delete a user', async () => {
    await helper.delete(`/admin/users/${createdUser._id.toString()}`, null, verifedAdmin.body._token).expect(200);
  });
  test('Admin should not get any user after all users has been deleted', async ()=>{
    await UserDB.db.dropCollection('users');
    await helper.get('/admin/users', null, verifedAdmin.body._token).expect(404);
    await helper.get('/admin/users/filter', {email: 'korede.moshood@mvxchange.com'}, verifedAdmin.body._token).expect(404);
    await UserDB.create(testData.verified_admin);
  });
});
