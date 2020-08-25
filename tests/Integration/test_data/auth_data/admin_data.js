const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
module.exports = {
  verified_admin: {
    'name': 'Oluwakorede',
    'username': 'kenykore',
    'password': 'boluwatife',
    'email': 'kenykore@gmail.com',
    'signatures': [
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
    ],
    'role': 'adminstrator',
    'mobile': '+2348133699506',
  },
  verified_user: {
    'name': 'OluwakoredeMVX',
    'username': 'kenymvx',
    'password': 'boluwatife',
    'email': 'korede.moshood@mvxchange.com',
    'signatures': [
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
    ],
    'role': 'user',
    'mobile': '+2348133699509',
  },
  unverified_user: {
    'name': 'OluwakoredeCOMES',
    'username': 'kenykoko',
    'password': 'boluwatife',
    'email': 'comestibles.com.ng@gmail.com',
  },
  invited_user: {
    'name': 'OluwakoredeInvited',
    'email': 'pr.youngworld@gmail.com',
    'role': 'user'
  },
  invited_user_unverified: {
    'name': 'OluwakoredeInvited',
    'email': 'pr.youngworld@gmail.com',
    'username': 'kenykoko',
    'password': 'boluwatife',
  },
  missing_user_data: {
    'name': 'OluwakoredeCOMES',
    'username': 'kenykoko',
  },
};
