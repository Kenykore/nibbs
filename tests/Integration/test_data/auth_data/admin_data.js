/* istanbul ignore file */
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
    'role': 'administrator',
    'mobile': '+2348133699506',
    'status': 'active'
  },
  verified_user: {
    'name': 'OluwakoredeMVX',
    'username': 'kenymvx',
    'email': 'korede.moshood@mvxchange.com',
    'signatures': [
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
      'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
    ],
    'role': 'user',
    'status': 'active',
    'mobile': '+2348133699509',
    'password': 'boluwatife',
  },
  unverified_user: {
    'name': 'OluwakoredeCOMES',
    'username': 'kenykoko',
    'email': 'comestibles.com.ng@gmail.com',
    'role': 'user',
    'password': 'boluwatife',
  },
  invited_user: {
    'name': 'OluwakoredeInvited',
    'email': 'pr.youngworld@gmail.com',
    'username': 'pr.youngworld',
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
  single_recipient: {
    'email': 'pr.youngworld@gmail.com',
    'name': 'Oluwakorede'
  },
  recipient_list: {
    'data': [{
      'email': 'pr.youngworld2@gmail.com',
      'name': 'Oluwakorede'
    }, {
      'email': 'pr.young@gmail.com',
      'name': 'Oluwakorede 2'
    }
    ]
  },
  invite_list: [
    {
      'name': 'OluwakoredeInvited',
      'email': 'pr.youngworld@gmail.com',
      'username': 'pr.youngworld',
      'role': 'user'
    },
    {
      'name': 'OluwakoredeInvited2',
      'email': 'prtwo.youngworld@gmail.com',
      'username': 'pr2.youngworld',
      'role': 'user'
    },
  ]
};
