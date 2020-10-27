/* istanbul ignore file */
const helper = require('../helpers');
const UserDB = require('../../models/user');
const RoleDB = require('../../models/roles');
const testData= require('./test_data/auth_data/admin_data');
const Tokenization= require('../../utilities/tokeniztion');
let nonVerifedUser=null;
let verifedUser=null;
let verifedAdmin=null;
let createdRole=null;
const fs = require('fs');
describe('Test the authentication api', () => {
  beforeAll(async () => {
    await UserDB.insertMany([testData.verified_admin, testData.verified_user]);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return Promise.all([UserDB.db.dropCollection('users'), RoleDB.db.dropCollection('roles')]);
  });
  test('Non-registered user should NOT successfully sign in via SSO with missing details', async () => {
    await helper.post('/auth/login', testData.missing_user_data, null).expect(400);
  });
  test('Non-registered user should successfully sign in via SSO', async () => {
    try {
      nonVerifedUser = await helper.post('/auth/login', testData.unverified_user, null).expect(200);
      console.log(nonVerifedUser, 'VERIFIED USER');
      expect(nonVerifedUser.body._token).toBeTruthy();
      expect(nonVerifedUser.body.data).toBeTruthy();
      const decodedToken= Tokenization.verifyToken(nonVerifedUser.body._token);
      expect(decodedToken.data.verified).toBeFalsy();
    } catch (error) {
      console.log(error);
    }
  });

  test('Registered user should successfully sign in via SSO', async () => {
    verifedUser=await helper.post('/auth/login', testData.verified_user, null).expect(200);
    expect(verifedUser.body._token).toBeTruthy();
    expect(verifedUser.body.data).toBeTruthy();
    expect(verifedUser.body.data.role).toBe('user');
    const decodedToken= Tokenization.verifyToken(verifedUser.body._token);
    expect(decodedToken.data.verified).toBeTruthy();
  });
  test('Registered admin should successfully sign in via SSO', async () => {
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    expect(verifedAdmin.body._token).toBeTruthy();
    expect(verifedAdmin.body.data).toBeTruthy();
    expect(verifedAdmin.body.data.role).toBe('administrator');
    const decodedToken= Tokenization.verifyToken( verifedAdmin.body._token);
    expect(decodedToken.data.verified).toBeTruthy();
  });
  test('Registered admin should successfully create role', async () => {
    createdRole=await helper.post('/auth/role', {
      'name': 'user'
    }, verifedAdmin.body._token).expect(200);
    expect(createdRole.body.data).toBeTruthy();
    expect(createdRole.body.data.name).toBe('user');
  });
  test('Registered admin should successfully fetch role', async () => {
    const Role=await helper.get('/auth/role', null, verifedAdmin.body._token).expect(200);
    expect(Role.body.data).toBeTruthy();
    expect(Role.body.data.length).toBe(1);
  });
  test('Registered admin should successfully delete role', async () => {
    await helper.delete(`/auth/role/${createdRole.body.data._id}`, null, verifedAdmin.body._token).expect(200);
  });
});
