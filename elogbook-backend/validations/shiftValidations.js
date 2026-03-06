import Joi from "joi";

export const createShiftSchema = Joi.object({
  date: Joi.date().required(),
  shiftType: Joi.string().valid("A", "B", "C").required(),
  plant: Joi.string().required(),
  unit: Joi.string().required(),
  shiftInCharge: Joi.string().required(),
  engineers: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required(),
    })
  ),
});