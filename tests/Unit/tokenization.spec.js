const Tokenization= require('../../utilities/tokeniztion');
const verifyAuth= require('../../middlewares/verify_auth');
const moment=require('moment');
describe('Test the token creation and validation utility', () => {
  test('It should sign a user data', async () => {
    const userData={
      'email': 'kenykore@gmail.com',
      'mobile': '+2348133699506',
      'name': 'Oluwakorede',
      'role': 'Adminstrator',
      'verified': true,
    };
    const accessToken= Tokenization.signToken(userData);
    expect(accessToken).toBeTruthy();
    const tokenDecode = Tokenization.verifyToken(accessToken);
    expect(tokenDecode.expiresIn).toMatch('5 days');
  });
});
