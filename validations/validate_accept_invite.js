const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    'name': Joi.string().required(),
    'email': Joi.string().email().label('User has an invalid email address').required(),
    'role': Joi.string().required(),
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
