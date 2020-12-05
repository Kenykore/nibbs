/* istanbul ignore file */
const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const InviteDB = require('../../../../models/invite');
const testData= require('./../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
let nonVerifedInvitedUser=null;
let nonInvitedUser=null;
const fs = require('fs');
const nock=require('nock');
let scope=null;
let invitescope=null;
describe('Test the user invite api', () => {
  beforeAll(async () => {
    scope = nock('http://vi-singleauth-dev.nibsstest.com/singleauth').persist()
      .get('/login')
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
    await UserDB.create(testData.invited_user);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    scope.persist(false);
    invitescope.persist(false);
    return UserDB.db.dropCollection('users');
  });
  test('Non-registered invited user should successfully sign in via SSO and complete invite', async () => {
    nonVerifedInvitedUser = await helper.post('/auth/login', testData.invited_user_unverified, null).expect(200);
    expect(nonVerifedInvitedUser.body._token).toBeTruthy();
    expect(nonVerifedInvitedUser.body.data).toBeTruthy();
    const decodedToken= Tokenization.verifyToken(nonVerifedInvitedUser.body._token);
    expect(decodedToken.data.verified).toBeTruthy();
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    const inviteCompleted= await helper.postFormData('/users/invite/complete', formData.my_file, nonVerifedInvitedUser.body._token).expect(200);
    expect(inviteCompleted.body.data).toBeTruthy();
    expect(inviteCompleted.body.data.role).toBe('user');
    expect(inviteCompleted.body.data.signatures.length).toBeGreaterThan(0);
    expect(inviteCompleted.body.data.status).toBe('active');
  });
  test('User shouldnt complete invite twice', async ()=>{
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    await helper.postFormData('/users/invite/complete', formData.my_file, nonVerifedInvitedUser.body._token).expect(400);
  });
  test('Non-registered and non-invited user should successfully sign in via SSO and complete invite', async () => {
    nonInvitedUser = await helper.post('/auth/login', testData.unverified_user, null).expect(200);
    expect(nonInvitedUser.body._token).toBeTruthy();
    expect(nonInvitedUser.body.data).toBeTruthy();
    const decodedToken= Tokenization.verifyToken(nonInvitedUser.body._token);
    expect(decodedToken.data.verified).toBeFalsy();
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    await helper.post('/users/invite/complete', {}, nonInvitedUser.body._token).expect(400);
    const inviteCompleted= await helper.postFormData('/users/invite/complete', formData.my_file, nonInvitedUser.body._token).expect(200);
    expect(inviteCompleted.body.data).toBeTruthy();
    expect(inviteCompleted.body.data.role).toBe('user');
    expect(inviteCompleted.body.data.signatures.length).toBeGreaterThan(0);
    expect(inviteCompleted.body.data.status).toBe('active');
  });
});
