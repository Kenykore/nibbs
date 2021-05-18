/* istanbul ignore file */
const bcrypt = require('bcryptjs');
module.exports = {
  verified_admin: {
    'name': 'Oluwakorede',
    'username': 'kenykore',
    'password': 'boluwatife',
    'email': 'kenykore@gmail.com',
    'signatures': [
      {
        url: 'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
      },
      {
        url: 'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
      }


    ],
    'role': 'administrator',
    'mobile': '+2348133699506',
    'status': 'active'
  },
  document_preparation: {
    documentBody: '<p>This is a demo document 2</p>',
    recipients: JSON.stringify( [{'name': 'Oluwakorede', 'email': 'kenykore@gmail.com'}]),
    signatories: JSON.stringify(
      [
        {'name': 'Oluwakorede', 'email': 'kenykore@gmail.com',
          'coordinates': [{'x_coordinate': 4, 'y_coordinate': 60, 'page': 0}, {'x_coordinate': 10, 'y_coordinate': 90, 'page': 1}]},
        {'name': 'OluwakoredeMVX', 'email': 'korede.moshood@mvxchange.com',
          'coordinates': [{'x_coordinate': 4, 'y_coordinate': 60, 'page': 0}, {'x_coordinate': 10, 'y_coordinate': 90, 'page': 1}]
        },
      ]),
    documentTitle: 'Test'
  },
  document_preparation_two: {
    documentBody: '<p>This is a demo document 2</p>',
    recipients: JSON.stringify( [{'name': 'Oluwakorede', 'email': 'kenykore@gmail.com'}]),
    signatories: JSON.stringify([
      {'name': 'OluwakoredeMVX', 'email': 'korede.moshood@mvxchange.com',
        'coordinates': [{'x_coordinate': 4, 'y_coordinate': 60, 'page': 0}, {'x_coordinate': 10, 'y_coordinate': 90, 'page': 1}]},
    ]),
    documentTitle: 'Test'
  },
  verified_user: {
    'name': 'OluwakoredeMVX',
    'username': 'kenymvx',
    'email': 'korede.moshood@mvxchange.com',
    'signatures': [
      {
        url: 'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png ',
      },
      {
        url: 'https://res.cloudinary.com/comestibles/image/upload/v1598179341/signatures/pr.youngworld2%40gmail.com/create.png.png '
      }
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
