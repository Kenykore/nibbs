const helper = require('../../../helpers');
const UserDB = require('../../../../models/user');
const Tokenization= require('../../../../utilities/tokeniztion');
let nonVerifedUser=null;
let verifedUser=null;
const testData= require('./../../test_data/auth_data/admin_data');
describe('Test the profile api', () => {
  beforeAll(async () => {
    await UserDB.insertMany([testData.verified_user]);
    //   return mysqlDB.connect();
    // return AdminDB.destroy({ truncate: true, restartIdentity: true });
  });
  afterAll(async (done) => {
    return UserDB.db.dropCollection('users');
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
});
