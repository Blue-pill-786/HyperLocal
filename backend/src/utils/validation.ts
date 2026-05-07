import Joi from 'joi';

export const userValidationSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string(),
    }),
  }),
};

export const productValidationSchema = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    originalPrice: Joi.number().positive(),
    category: Joi.string().required(),
    stock: Joi.number().integer().min(0).required(),
    tags: Joi.array().items(Joi.string()),
  }),
  update: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number().positive(),
    stock: Joi.number().integer().min(0),
    tags: Joi.array().items(Joi.string()),
  }),
};

export const validate = (schema: Joi.Schema, data: any) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
