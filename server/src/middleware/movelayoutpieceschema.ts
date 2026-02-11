import { body } from 'express-validator';

export const moveLayoutPieceSchema = [
  body('xIncrement')
  .notEmpty().withMessage("JSON parameter 'x' is required")
  .isNumeric().withMessage("JSON parameter 'x' should be a number"),

  body('yIncrement')
  .notEmpty().withMessage("JSON parameter 'y' is required")
  .isNumeric().withMessage("JSON parameter 'y' should be a number"),
];
