const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    username: Joi.string().optional().label('Enter a valid username'),
    email: Joi.string().required().label('Enter a valid username'),
    password: Joi.string().required()
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
