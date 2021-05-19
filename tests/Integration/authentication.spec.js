/* istanbul ignore file */
const helper = require('../helpers');
const UserDB = require('../../models/user');
const ApplicationDB = require('../../models/apps');
const RoleDB = require('../../models/roles');
const testData= require('./test_data/auth_data/admin_data');
const Tokenization= require('../../utilities/tokeniztion');
let nonVerifedUser=null;
const nock=require('nock');
let scope=null;
let verifedUser=null;
let verifedAdmin=null;
let createdRole=null;
let appAdded=null;
const fs = require('fs');
const app = require('../../app');
describe('Test the authentication api', () => {
  beforeAll(async () => {
    scope = nock(`${process.env.SINGLE_AUTH_SERVICE_LOGIN_URL}`).persist()
      .get('/login/auth-only')
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
    await UserDB.insertMany([testData.verified_admin, testData.verified_user]);
    appAdded=await ApplicationDB.create({
      name: 'AWS',
      key: 'AAAAA',
      enabled: true,
    });
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    scope.persist(false);
    return await Promise.all([UserDB.db.dropCollection('users'), RoleDB.db.dropCollection('roles'), ApplicationDB.db.dropCollection('apps')]);
  });
  test('user should not call protected user route without token', async () => {
    await helper.get('/users', null, null).expect(401);
  });
  test('Non-registered user should NOT successfully sign in via SSO with missing details', async () => {
    await helper.post('/auth/login', testData.missing_user_data, null).expect(400);
  });
  test('Non-registered user should successfully sign in via SSO', async () => {
    try {
      nonVerifedUser = await helper.post('/auth/login', testData.unverified_user, null).expect(200);
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
  test('user should not call protected route without bearer before token', async () => {
    await helper.fakeget('/users', null, verifedUser.body._token).expect(401);
  });
  test('user should not call protected admin route  token', async () => {
    await helper.post('/admin/recipient/tag', {name: 'keny'}, verifedUser.body._token).expect(401);
  });
  test('Registered admin should successfully sign in via SSO', async () => {
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    expect(verifedAdmin.body._token).toBeTruthy();
    expect(verifedAdmin.body.data).toBeTruthy();
    expect(verifedAdmin.body.data.role).toBe('administrator');
    const decodedToken= Tokenization.verifyToken( verifedAdmin.body._token);
    expect(decodedToken.data.verified).toBeTruthy();
  });
  test('Registered user should authenticate using API key', async () => {
    await helper.getUsingKey(`/users`, {userId: verifedUser.body.data._id}, appAdded.key).expect(200);
  });
  test('Registered user should NOT authenticate using invalid API key', async () => {
    await helper.getUsingKey(`/users`, {userId: verifedUser.body.data._id}, '5667').expect(401);
  });
  test('Registered Admin should authenticate using API key', async () => {
    await helper.putUsingKey(`/admin/users/${verifedUser.body.data._id.toString()}?userId=${ verifedAdmin.body.data._id.toString()}`, {
      'name': 'seun'
    }, appAdded.key).expect(200);
  });
  test('Registered Admin should NOT authenticate using invalid API key', async () => {
    await helper.putUsingKey(`/admin/users/${verifedUser.body.data._id.toString()}?userId=${ verifedAdmin.body.data._id.toString()}`, {
      'name': 'seun'
    }, '5504').expect(401);
  });
  test('Registered user should NOT call Admin route using API key', async () => {
    await helper.putUsingKey(`/admin/users/${verifedUser.body.data._id.toString()}?userId=${ verifedUser.body.data._id.toString()}`, {
      'name': 'seun'
    }, appAdded.key).expect(401);
  });
  test('Registered admin should not fetch any role when not created', async () => {
    const Role=await helper.get('/auth/role', null, verifedAdmin.body._token).expect(404);
  });
  test('Registered admin should successfully create role', async () => {
    createdRole=await helper.post('/auth/role', {
      'name': 'user'
    }, verifedAdmin.body._token).expect(200);
    expect(createdRole.body.data).toBeTruthy();
    expect(createdRole.body.data.name).toBe('user');
  });
  test('Registered admin should NOT create role with empty data', async () => {
    const createdRole=await helper.post('/auth/role', {

    }, verifedAdmin.body._token).expect(400);
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
