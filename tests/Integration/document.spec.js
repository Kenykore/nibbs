const helper = require('../helpers');
const UserDB = require('../../models/user');
const DocumentDB= require('../../models/document');
const DocumentLogs= require('../../models/document_log');

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
  test('Signatory should sign document with image url', async () => {
    const documentSigned= await helper.post('/documents/sign',
      {'signature':
    'https://res.cloudinary.com/comestibles/image/upload/v1598303725/signatures/spe%40mailinator.com/create.png.png',
      'documentId': documentPrepared.body.data._id},
      verifedAdmin.body._token).expect(200);
    expect(documentSigned.body.data).toBeTruthy();
    expect(documentSigned.body.data.signed).toBeTruthy();
  });
});
