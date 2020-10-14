const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
