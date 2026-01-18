import { body } from 'express-validator';

// Validation schema for routes that take a coordiante as a JSON body parameter
export const UpdateNodeSchema = [
  body('x')
  .notEmpty().withMessage("JSON paramter 'x' is required")
  .isNumeric().withMessage("JSON paramter 'x' should be a number"),

  body('y')
  .notEmpty().withMessage("JSON paramter 'y' is required")
  .isNumeric().withMessage("JSON paramter 'y' should be a number"),

  body('headingIncrement')
  .notEmpty().withMessage("JSON paramter 'headingIncrement' is required")
  .isNumeric().withMessage("JSON paramter 'headingIncrement' should be a number"),
];
