
/* istanbul ignore file */
const helper = require('../../../helpers');
const RecipientDB = require('../../../../models/recipients');
const UserDB = require('../../../../models/user');
const TagDB = require('../../../../models/tags');

const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nonVerifedInvitedUser=null;
let createdRecipient=null;
let createdTag=null;
let verifedAdmin=null;
const fs = require('fs');
describe('Test the recipients api', () => {
  beforeAll(async () => {
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return Promise.all([UserDB.db.dropCollection('users'), RecipientDB.db.dropCollection('receipients'), TagDB.db.dropCollection('tags')]);
  });
  test('Admin user should create single recipient', async () => {
    createdRecipient= await helper.post('/admin/recipient', testData.single_recipient, verifedAdmin.body._token).expect(200);
    expect(createdRecipient.body.data).toBeTruthy();
    expect(createdRecipient.body.data.email).toBe(testData.single_recipient.email);
  });
  test('Admin user should create multiple recipients', async () => {
    const Users= await helper.post('/admin/recipient/multiple', testData.recipient_list, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
    expect(Users.body.data.length).toBe(2);
  });
  test('Admin should get all recipients', async () => {
    const Users= await helper.get('/admin/recipient', null, verifedAdmin.body._token).expect(200);
    expect(Users.body.total_recipients).toBe(3);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(3);
  });
  test('Admin should search all recipients', async () => {
    const Users= await helper.get('/admin/recipient/search', {search: 'Oluwakorede 2'}, verifedAdmin.body._token).expect(200);
    console.log(Users.body, 'reci search');
    expect(Users.body.total_recipients).toBe(1);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(1);
  });
  test('Admin should get a single recipient', async () => {
    const Users= await helper.get(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
  });
  test('Admin should update a recipient', async () => {
    const Users= await helper.put(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, {
      'name': 'Oluwaseun'
    }, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
    expect(Users.body.data.name).toBe('Oluwaseun');
  });
  test('Admin user should create single tag', async () => {
    createdTag= await helper.post('/admin/recipient/tag', {
      'name': 'CEO'
    }, verifedAdmin.body._token).expect(200);
    expect(createdTag.body.data).toBeTruthy();
    expect(createdTag.body.data.name).toBe('CEO');
  });
  test('Admin user should create multiple tag', async () => {
    const createdTagMuliple= await helper.post('/admin/recipient/tag/multiple', {
      'data': ['CTO', 'CMO', 'COO']
    }, verifedAdmin.body._token).expect(200);
    expect(createdTagMuliple.body.data).toBeTruthy();
    expect(createdTagMuliple.body.data.length).toBe(3);
  });
  test('Admin user should fetch all tags', async () => {
    const tags= await helper.get('/admin/recipient/tag', null, verifedAdmin.body._token).expect(200);
    expect(tags.body.data).toBeTruthy();
    expect(tags.body.data.length).toBe(4);
  });
  test('Admin should delete a recipient', async () => {
    await helper.delete(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
  });
  test('Admin should delete a tag', async () => {
    await helper.delete(`/admin/recipient/tag/${createdTag.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
  });
});
