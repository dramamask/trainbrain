import { body } from 'express-validator';

export const coordinateSchema = [
  body('x').notEmpty().isNumeric().withMessage("JSON paramter 'x' is required and should be a number"),
  body('y').notEmpty().isNumeric().withMessage("JSON paramter 'y' is required and should be a number"),
  body('heading').notEmpty().isNumeric().withMessage("JSON paramter 'heading' is required and should be a number"),
];
