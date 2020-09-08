const Joi = require('@hapi/joi');

const Validate = (params) => {
  const schema = Joi.object({
    signature: Joi.string().required(),
    documentId: Joi.string().required()
  });
  return schema.validate(params, {
    allowUnknown: true
  });
};

module.exports = Validate;
