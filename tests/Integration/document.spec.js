const helper = require('../helpers');
const sinon=require('sinon');
const UserDB = require('../../models/user');
const DocumentDB= require('../../models/document');
const DocumentLogs= require('../../models/document_log');
const documentCtrl=require('../../api/v1/controllers/document');
const RoleDB = require('../../models/roles');
const testData= require('./test_data/auth_data/admin_data');
const Tokenization= require('../../utilities/tokeniztion');
const fs = require('fs');
let verifedUser=null;
let verifedAdmin=null;
let documentPrepared=null;
describe('Test the documents api', () => {
  beforeAll(async () => {
    await UserDB.insertMany([testData.verified_admin, testData.verified_user]);
    verifedAdmin=await helper.post('/auth/login', testData.verified_admin, null).expect(200);
    verifedUser=await helper.post('/auth/login', testData.verified_user, null).expect(200);
  });
  afterAll(async (done) => {
    return await Promise.all([UserDB.db.dropCollection('users'),
      DocumentDB.db.dropCollection('documents'),
      DocumentLogs.db.dropCollection('documentlogs')]);
  });
  test('Registered user should have empty document list if no document is available', async () => {
    const documentFound= await helper.get('/documents', null,
      verifedUser.body._token).expect(404);
  });
  test('Registered user should NOT prepare document with empty file', async () => {
    await helper.post('/documents/prepare',
      testData.document_preparation, verifedUser.body._token).expect(400);
  });

  test('Registered user should prepare document', async () => {
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./testdoc.pdf')
    };
    documentPrepared= await helper.postFormData('/documents/prepare',
      formData.my_file, verifedUser.body._token, testData.document_preparation).expect(200);
    expect(documentPrepared.body.data).toBeTruthy();
    expect(documentPrepared.body.data.file).toBeTruthy();
  });

  test('Registered user should fetch document list', async () => {
    const documentFound= await helper.get('/documents', null,
      verifedUser.body._token).expect(200);
    expect(documentFound.body.total_documents).toBe(1);
    expect(documentFound.body.data).toBeTruthy();
  });
  test('Registered user should fetch single document ', async () => {
    const documentFound= await helper.get(`/documents/${documentPrepared.body.data._id}`, null,
      verifedUser.body._token).expect(200);
    expect(documentFound.body.document).toBeTruthy();
  });
  test('Registered user should NOT fetch single document with non existing document ', async () => {
    const documentFound= await helper.get(`/documents/5e5c1ea3b8dded465a338e80`, null,
      verifedUser.body._token).expect(400);
  });

  test('Registered user should NOT fetch single with incorrect mongo id ', async () => {
    const documentFound= await helper.get(`/documents/hihihihihi`, null,
      verifedUser.body._token).expect(400);
  });

  test('Signatory should sign document with image url', async () => {
    const documentSigned= await helper.post('/documents/sign',
      {'signature':
    'https://res.cloudinary.com/comestibles/image/upload/v1598303725/signatures/spe%40mailinator.com/create.png.png',
      'documentId': documentPrepared.body.data._id},
      verifedAdmin.body._token).expect(200);
    expect(documentSigned.body.data).toBeTruthy();
    expect(documentSigned.body.data.signed).toBeFalsy();
  });
  test('Test mailjet hook', async ()=>{
    await helper.post('/mailjet',
      [{
        event: 'open',
        customcampaign: documentPrepared.body.data._id,
        email: 'kenykore@gmail.com'
      },
      {
        event: 'click',
        customcampaign: documentPrepared.body.data._id,
        email: 'kenykore@gmail.com'
      },
      {
        event: 'spam',
        customcampaign: documentPrepared.body.data._id,
        email: 'kenykore@gmail.com'
      },
      {
        event: 'bounce',
        customcampaign: documentPrepared.body.data._id,
        email: 'kenykore@gmail.com'
      },
      {
        event: 'blocked',
        customcampaign: documentPrepared.body.data._id,
        email: 'kenykore@gmail.com'
      }
      ]
      , null).expect(200);
  });
  test('Signatory should NOT sign document twice', async () => {
    const documentSigned= await helper.post('/documents/sign',
      {'signature':
    'https://res.cloudinary.com/comestibles/image/upload/v1598303725/signatures/spe%40mailinator.com/create.png.png',
      'documentId': documentPrepared.body.data._id},
      verifedAdmin.body._token).expect(400);
  });
  test('Signatory should NOT sign document with incomplete data', async () => {
    await helper.post('/documents/sign',
      {'signature':
    'https://res.cloudinary.com/comestibles/image/upload/v1598303725/signatures/spe%40mailinator.com/create.png.png'},
      verifedAdmin.body._token).expect(400);
  });
  test('Signatory should sign document with image file', async () => {
    const imageData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    const documentSigned= await helper.postFormData('/documents/sign', imageData.my_file,
      verifedUser.body._token, {
        'documentId': documentPrepared.body.data._id}).expect(200);
    expect(documentSigned.body.data).toBeTruthy();
  });
  test('Registered user should sign image document', async () => {
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./doc.jpeg')
    };
    const documentPrepared= await helper.postFormData('/documents/prepare',
      formData.my_file, verifedUser.body._token, testData.document_preparation_two).expect(200);
    expect(documentPrepared.body.data).toBeTruthy();
    expect(documentPrepared.body.data.file).toBeTruthy();
    const documentSigned= await helper.post('/documents/sign',
      {'signature':
  'https://res.cloudinary.com/comestibles/image/upload/v1598303725/signatures/spe%40mailinator.com/create.png.png',
      'documentId': documentPrepared.body.data._id},
      verifedUser.body._token).expect(200);
  });
});
