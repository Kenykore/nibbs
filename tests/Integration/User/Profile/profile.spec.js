/* istanbul ignore file */
const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const Tokenization= require('../../../../utilities/tokeniztion');
let nonVerifedUser=null;
let verifedUser=null;
const fs = require('fs');
const testData= require('./../../test_data/auth_data/admin_data');
describe('Test the profile api', () => {
  beforeAll(async () => {
    await UserDB.insertMany([testData.verified_user, {
      'name': 'OluwakoredeMVX2',
      'username': 'kenymvx2',
      'email': 'korede.moshood2@mvxchange.com',
      'signatures': [
        'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
        'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
      ],
      'role': 'user',
      'status': 'active',
      'mobile': '+2348133699507',
      'password': 'boluwatife',
    }]);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return await UserDB.db.dropCollection('users');
  });
  test('Non-registered user should successfully sign in via SSO but not be able to update profile', async () => {
    nonVerifedUser = await helper.post('/auth/login', testData.unverified_user, null).expect(200);
    expect(nonVerifedUser.body._token).toBeTruthy();
    expect(nonVerifedUser.body.data).toBeTruthy();
    const decodedToken= Tokenization.verifyToken(nonVerifedUser.body._token);
    expect(decodedToken.data.verified).toBeFalsy();

    await helper.put('/users', {name: 'martha'}, nonVerifedUser.body._token).expect(401);
  });
  test('Registered user should successfully sign in via SSO and update profile', async () => {
    try {
      verifedUser = await helper.post('/auth/login', testData.verified_user, null).expect(200);
      expect(verifedUser.body._token).toBeTruthy();
      expect(verifedUser.body.data).toBeTruthy();
      const decodedToken= Tokenization.verifyToken(verifedUser.body._token);
      expect(decodedToken.data.verified).toBeTruthy();
      const userFound= await helper.put('/users', {'name': 'martha'}, verifedUser.body._token).expect(200);
      expect(userFound.body.user).toBeTruthy();
      expect(userFound.body.user.role).toBe('user');
      expect(userFound.body.user.name).toBe('martha');
    } catch (error) {
      console.log(error);
    }
  });
  test('Registered user should successfully sign in via SSO and NOT update profile email to an existing email', async () => {
    try {
      verifedUser = await helper.post('/auth/login', testData.verified_user, null).expect(200);
      expect(verifedUser.body._token).toBeTruthy();
      expect(verifedUser.body.data).toBeTruthy();
      const decodedToken= Tokenization.verifyToken(verifedUser.body._token);
      expect(decodedToken.data.verified).toBeTruthy();
      const userFound= await helper.put('/users', {'email': 'korede.moshood2@mvxchange.com'}, verifedUser.body._token).expect(400);
    } catch (error) {
      console.log(error);
    }
  });
  test('Registered user should successfully add new Signature to profile', async () => {
    const formData = {
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    };
    await helper.post('/users/add/signature', {}, verifedUser.body._token).expect(400);
    const signatureAdded= await helper.postFormData('/users/add/signature', formData.my_file, verifedUser.body._token).expect(200);
    expect(signatureAdded.body.data).toBeTruthy();
    expect(signatureAdded.body.data.signatures.length).toBeGreaterThan(0);
  });
  test('Registered user should successfully add new multiple Signature to profile', async () => {
    const formData = [{
      my_field: 'file',
      my_file: fs.createReadStream('./create.png')
    }, {
      my_field: 'file',
      my_file: fs.createReadStream('./price-tag.png')
    }];
    await helper.post('/users/add/signature', {}, verifedUser.body._token).expect(400);
    const signatureAdded= await helper.postFormDataMultiple('/users/add/signature', formData, verifedUser.body._token).expect(200);
    expect(signatureAdded.body.data).toBeTruthy();
    expect(signatureAdded.body.data.signatures.length).toBeGreaterThan(0);
  });
  test('Registered user should successfully fetch his profile', async () => {
    const user= await helper.get('/users', null, verifedUser.body._token).expect(200);
    expect(user.body.user).toBeTruthy();
  });
  test('Registered user NOT should successfully delete Signature with missing data', async () => {
    await helper.post('/users/remove/signature',
      {},
      verifedUser.body._token).expect(400);
  });
  test('Registered user should successfully delete Signature', async () => {
    await helper.post('/users/remove/signature',
      {signature: 'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png'},
      verifedUser.body._token).expect(200);
  });
});
