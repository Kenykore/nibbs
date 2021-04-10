const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nock=require('nock');
let scope=null;
let invitescope=null;
const nonVerifedInvitedUser=null;
const nonInvitedUser=null;
let verifedAdmin=null;
const fs = require('fs');
describe('Test the user invite api', () => {
  beforeAll(async () => {
    scope = nock('http://vi-singleauth-dev.nibsstest.com/singleauth').persist()
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
    invitescope=nock('http://vi-singleauth-dev.nibsstest.com/singleauth').persist()
      .post('/search').query((actualQueryObject)=>{
        if (actualQueryObject.staffEmail) {
          return true;
        }
        return false;
      }).reply(200, {
        ok: true,
      });
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    scope.persist(false);
    invitescope.persist(false);
    return await UserDB.db.dropCollection('users');
  });
  test('Admin user should invite user', async () => {
    const invitedUsers= await helper.post('/admin/invite', {data: testData.invite_list}, verifedAdmin.body._token).expect(200);
    expect(invitedUsers.body.data).toBeTruthy();
    expect(invitedUsers.body.data.length).toBe(2);
  });
  test('Admin user should  NOT invite user with missing details', async () => {
    await helper.post('/admin/invite', {}, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should NOT invite user twice', async () => {
    const invitedUsers= await helper.post('/admin/invite', {data: testData.invite_list}, verifedAdmin.body._token).expect(200);
    expect(invitedUsers.body.data).toBeTruthy();
    expect(invitedUsers.body.data.length).toBe(0);
  });
  test('Admin should get all invites', async () => {
    const invitedUsers= await helper.get('/admin/invite', {data: testData.invite_list}, verifedAdmin.body._token).expect(200);
    expect(invitedUsers.body.total_users).toBe(2);
    expect(invitedUsers.body.pagination).toBeTruthy();
    expect(invitedUsers.body.data.length).toBe(2);
  });
});
