const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const InviteDB = require('../../../../models/invite');
const testData= require('./../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
let nonVerifedInvitedUser=null;
let nonInvitedUser=null;
const fs = require('fs');

describe('Test the invite api', () => {
  beforeAll(async () => {
    await UserDB.create(testData.verified_user);
    await InviteDB.create(testData.invited_user);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return Promise.all([UserDB.db.dropCollection('users'), InviteDB.db.dropCollection('invites')]);
  });
  test('Non-registered invited user should successfully sign in via SSO and complete invite', async () => {
    nonVerifedInvitedUser = await helper.post('/auth/login', testData.invited_user_unverified, null).expect(200);
    expect(nonVerifedInvitedUser.body._token).toBeTruthy();
    expect(nonVerifedInvitedUser.body.data).toBeTruthy();
    const decodedToken= Tokenization.verifyToken(nonVerifedInvitedUser.body._token);
    expect(decodedToken.data.verified).toBeFalsy();
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
  test('Non-registered user should successfully sign in via SSO and complete invite', async () => {
    nonInvitedUser = await helper.post('/auth/login', testData.unverified_user, null).expect(200);
    expect(nonInvitedUser.body._token).toBeTruthy();
    expect(nonInvitedUser.body.data).toBeTruthy();
    const decodedToken= Tokenization.verifyToken(nonInvitedUser.body._token);
    expect(decodedToken.data.verified).toBeFalsy();
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    const inviteCompleted= await helper.postFormData('/users/invite/complete', formData.my_file, nonInvitedUser.body._token).expect(200);
    expect(inviteCompleted.body.data).toBeTruthy();
    expect(inviteCompleted.body.data.role).toBe('user');
    expect(inviteCompleted.body.data.signatures.length).toBeGreaterThan(0);
    expect(inviteCompleted.body.data.status).toBe('active');
  });
});
