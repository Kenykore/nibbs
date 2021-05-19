/* istanbul ignore file */
const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const InviteDB = require('../../../../models/invite');
const testData= require('./../../test_data/auth_data/admin_data');
const utils=require('../../../../utilities/utils');
let upload=null;
let fetchFile=null;
const Tokenization= require('../../../../utilities/tokeniztion');
let nonVerifedInvitedUser=null;
let nonInvitedUser=null;
const fs = require('fs');
const nock=require('nock');
let scope=null;
let invitescope=null;
describe('Test the user invite api', () => {
  beforeEach(async ()=>{
    const signature=await utils.getFileUrl('signature');
    upload=utils.uploadFileMino;
    fetchFile=utils.getFileUrl;
    utils.uploadFileMino=jest.fn();
    utils.getFileUrl=jest.fn();
    utils.uploadFileMino.mockResolvedValue('cc83c3f2fb5db6561ef4945f6eee031c');
    utils.getFileUrl.mockResolvedValue(signature);
  });
  beforeAll(async () => {
    scope = nock(`${process.env.SINGLE_AUTH_SERVICE_LOGIN_URL}`).persist()
      .get()
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
    invitescope=nock(`${process.env.SINGLE_AUTH_SERVICE_LOGIN_URL}`).persist()
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
  afterEach(async ()=>{
    utils.uploadFileMino=upload;
    utils.getFileUrl=fetchFile;
  });
  afterAll(async (done) => {
    scope.persist(false);
    invitescope.persist(false);
    utils.uploadFileMino=upload;
    utils.getFileUrl=fetchFile;
    return UserDB.db.dropCollection('users');
  });
  test('Non-registered invited user should successfully sign in via SSO and complete invite', async () => {
    const signature=await utils.getFileUrl('signature');
    upload=utils.uploadFileMino;
    fetchFile=utils.getFileUrl;
    utils.uploadFileMino=jest.fn();
    utils.getFileUrl=jest.fn();
    utils.uploadFileMino.mockResolvedValue('cc83c3f2fb5db6561ef4945f6eee031c');
    utils.getFileUrl.mockResolvedValue(signature);
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
    utils.uploadFileMino=upload;
    utils.getFileUrl=fetchFile;
  });
  test('User shouldnt complete invite twice', async ()=>{
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    await helper.postFormData('/users/invite/complete', formData.my_file, nonVerifedInvitedUser.body._token).expect(400);
  });
  test('Non-registered and non-invited user should successfully sign in via SSO and complete invite', async () => {
    const signature=await utils.getFileUrl('signature');
    upload=utils.uploadFileMino;
    fetchFile=utils.getFileUrl;
    utils.uploadFileMino=jest.fn();
    utils.getFileUrl=jest.fn();
    utils.uploadFileMino.mockResolvedValue('cc83c3f2fb5db6561ef4945f6eee031c');
    utils.getFileUrl.mockResolvedValue(signature);
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
    utils.uploadFileMino=upload;
    utils.getFileUrl=fetchFile;
  });
});
