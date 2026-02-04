import { body } from 'express-validator';

// Validation schema for routes that take a coordiante as a JSON body parameter
export const addNodeSchema = [
  body('x')
  .notEmpty().withMessage("JSON parameter 'x' is required")
  .isNumeric().withMessage("JSON parameter 'x' should be a number"),

  body('y')
  .notEmpty().withMessage("JSON parameter 'y' is required")
  .isNumeric().withMessage("JSON parameter 'y' should be a number"),
];
