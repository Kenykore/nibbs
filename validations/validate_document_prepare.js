const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    'documentTitle': Joi.string().required(),
    'documentProperty': Joi.array().optional(),
    'documentBody': Joi.string().required(),
    'recipients': Joi.array().required(),
    'signatories': Joi.array().required(),
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
