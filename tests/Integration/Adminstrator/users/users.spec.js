
/* istanbul ignore file */
const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nonVerifedInvitedUser=null;
let createdUser=null;
let verifedAdmin=null;
const fs = require('fs');
const nock=require('nock');
let scope=null;
describe('Test the user invite api', () => {
  beforeAll(async () => {
    const baseSplit=process.env.SINGLE_AUTH_SERVICE_LOGIN_URL.split('/');
    const baseUrlArray=baseSplit.slice(baseSplit.length-2);
    const mainUrl=baseSplit.slice(0, baseSplit.length-2);
    const url=mainUrl.join('/');
    const path=baseUrlArray.join('/');
    scope = nock(`${url}`).persist()
      .get(`/${path}`)
      .reply(200, {
        meta: {status: 'okay', message: 'Login successful', info: 'success'},
        data: {
          dn: 'CN=Idris Kelani,OU=AzureSync,DC=nibsstest,DC=com',
          cn: 'Idris Kelani',
          sn: 'Kelani',
          givenName: 'Idris',
          displayName: 'Idris Kelani',
          memberOf: [
            'CN=ABC Team,OU=Groups,DC=nibsstest,DC=com',
            'CN=Devops Team,OU=Groups,DC=nibsstest,DC=com',
            'CN=All Staff,OU=Groups,DC=nibsstest,DC=com'
          ],
          name: 'Idris Kelani',
          sAMAccountName: 'ikelani',
          userPrincipalName: 'ikelani@nibsstest.com',
          lastLogonTimestamp: '132505361245464469',
          mail: 'ikelani@nibss-plc.com.ng'
        }
      });
    createdUser= await (await UserDB.create(testData.verified_user)).toObject();
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    scope.persist(false);
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
  test('Admin user should search and filter all users then download pdf', async () => {
    const Users= await helper.get('/admin/users/download/pdf', {search: 'k', filter: 'administrator'}, verifedAdmin.body._token).expect(200);
  });
  test('Admin user should search and filter all users then download csv', async () => {
    const Users= await helper.get('/admin/users/download/csv', {search: 'k', filter: 'administrator'}, verifedAdmin.body._token).expect(200);
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
  test('Admin should NOT update a user profile with invalid mongoid', async () => {
    const Users= await helper.put(`/admin/users/jggjgjg`, {
      'name': 'seun'
    }, verifedAdmin.body._token).expect(400);
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
