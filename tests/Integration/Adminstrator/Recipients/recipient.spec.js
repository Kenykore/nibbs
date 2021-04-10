
/* istanbul ignore file */
const helper = require('../../../helpers');
const RecipientDB = require('../../../../models/recipients');
const UserDB = require('../../../../models/user');
const TagDB = require('../../../../models/tags');
const nock=require('nock');
let scope=null;
const testData= require('../../test_data/auth_data/admin_data');
const Tokenization= require('../../../../utilities/tokeniztion');
const nonVerifedInvitedUser=null;
let createdRecipient=null;
let createdTag=null;
let verifedAdmin=null;
const fs = require('fs');
describe('Test the recipients api', () => {
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
    await UserDB.create(testData.verified_admin);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    scope.persist(false);
    return await Promise.all([UserDB.db.dropCollection('users'), RecipientDB.db.dropCollection('receipients'), TagDB.db.dropCollection('tags')]);
  });
  test('Admin user should fetch all tags as empty when no tag is created', async () => {
    const tags= await helper.get('/admin/recipient/tag', null, verifedAdmin.body._token).expect(404);
  });
  test('Admin should NOT get all recipients when no recipients is created', async () => {
    await helper.get('/admin/recipient', null, verifedAdmin.body._token).expect(404);
  });
  test('Admin user should create single recipient', async () => {
    createdRecipient= await helper.post('/admin/recipient', testData.single_recipient, verifedAdmin.body._token).expect(200);
    expect(createdRecipient.body.data).toBeTruthy();
    expect(createdRecipient.body.data.email).toBe(testData.single_recipient.email);
  });
  test('Admin user should NOT create repeat recipient', async () => {
    await helper.post('/admin/recipient', testData.single_recipient, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should  NOT create single recipient with missing values', async () => {
    await helper.post('/admin/recipient', {}, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should create multiple recipients', async () => {
    const Users= await helper.post('/admin/recipient/multiple', testData.recipient_list, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
    expect(Users.body.data.length).toBe(2);
  });
  test('Admin user should NOT create multiple recipients with a data array', async () => {
    await helper.post('/admin/recipient/multiple', {}, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should NOT create multiple recipients twice', async () => {
    await helper.post('/admin/recipient/multiple', testData.recipient_list, verifedAdmin.body._token).expect(400);
  });
  test('Admin should get all recipients', async () => {
    const Users= await helper.get('/admin/recipient', null, verifedAdmin.body._token).expect(200);
    expect(Users.body.total_recipients).toBe(3);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(3);
  });
  test('Admin should search all recipients', async () => {
    const Users= await helper.get('/admin/recipient/search', {search: 'Oluwakorede 2'}, verifedAdmin.body._token).expect(200);
    expect(Users.body.total_recipients).toBe(1);
    expect(Users.body.pagination).toBeTruthy();
    expect(Users.body.data.length).toBe(1);
  });
  test('Admin should get a single recipient', async () => {
    const Users= await helper.get(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
  });
  test('Admin should NOT get a single recipient with invalid mongo id', async () => {
    await helper.get(`/admin/recipient/tttttt`, null, verifedAdmin.body._token).expect(400);
  });
  test('Admin should update a recipient', async () => {
    const Users= await helper.put(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, {
      'name': 'Oluwaseun'
    }, verifedAdmin.body._token).expect(200);
    expect(Users.body.data).toBeTruthy();
    expect(Users.body.data.name).toBe('Oluwaseun');
  });
  test('Admin should NOT update a recipient email to an existing email', async () => {
    await helper.put(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, {
      'email': 'pr.young@gmail.com'
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin should NOT update a recipient', async () => {
    await helper.put(`/admin/recipient/hththhttt`, {
      'name': 'Oluwaseun'
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should create single tag', async () => {
    createdTag= await helper.post('/admin/recipient/tag', {
      'name': 'CEO'
    }, verifedAdmin.body._token).expect(200);
    expect(createdTag.body.data).toBeTruthy();
    expect(createdTag.body.data.name).toBe('CEO');
  });
  test('Admin user should  NOT create single tag without name', async () => {
    const createdTag= await helper.post('/admin/recipient/tag', {
      'name': ''
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should NOT create duplicate single tag', async () => {
    const createdTag= await helper.post('/admin/recipient/tag', {
      'name': 'CEO'
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should create multiple tag', async () => {
    const createdTagMuliple= await helper.post('/admin/recipient/tag/multiple', {
      'data': ['CTO', 'CMO', 'COO']
    }, verifedAdmin.body._token).expect(200);
    expect(createdTagMuliple.body.data).toBeTruthy();
    expect(createdTagMuliple.body.data.length).toBe(3);
  });
  test('Admin user should NOT create multiple tag with empty data array', async () => {
    const createdTagMuliple= await helper.post('/admin/recipient/tag/multiple', {
      'data': []
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should NOT create multiple tags with the same name twice', async () => {
    const createdTagMuliple= await helper.post('/admin/recipient/tag/multiple', {
      'data': ['CTO', 'CMO', 'COO']
    }, verifedAdmin.body._token).expect(400);
  });
  test('Admin user should fetch all tags', async () => {
    const tags= await helper.get('/admin/recipient/tag', null, verifedAdmin.body._token).expect(200);
    expect(tags.body.data).toBeTruthy();
    expect(tags.body.data.length).toBe(4);
  });
  test('Admin should NOT delete a recipient with invalid mongo id', async () => {
    await helper.delete(`/admin/recipient/urrururur`, null, verifedAdmin.body._token).expect(400);
  });
  test('Admin should delete a recipient', async () => {
    await helper.delete(`/admin/recipient/${createdRecipient.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
  });
  test('Admin should delete a tag', async () => {
    await helper.delete(`/admin/recipient/tag/${createdTag.body.data._id.toString()}`, null, verifedAdmin.body._token).expect(200);
  });
  test('Admin should NOT delete a tag with invalid mongo id', async () => {
    await helper.delete(`/admin/recipient/tag/hhghghghh`, null, verifedAdmin.body._token).expect(400);
  });
});
