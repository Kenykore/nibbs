const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    data: Joi.array().required().label('Enter a valid data array'),
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
