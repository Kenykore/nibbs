const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nonVerifedInvitedUser=null;
const nonInvitedUser=null;
let verifedAdmin=null;
const fs = require('fs');
describe('Test the user invite api', () => {
  beforeAll(async () => {
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return await UserDB.db.dropCollection('users');
  });
  test('Admin user should invite user', async () => {
    const invitedUsers= await helper.post('/admin/invite', {data: testData.invite_list}, verifedAdmin.body._token).expect(200);
    expect(invitedUsers.body.data).toBeTruthy();
    expect(invitedUsers.body.data.length).toBe(2);
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
