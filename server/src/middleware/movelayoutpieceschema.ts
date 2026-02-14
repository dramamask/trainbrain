import { body } from 'express-validator';

export const moveLayoutPieceSchema = [
  body('xIncrement')
  .notEmpty().withMessage("JSON parameter 'xIncrement' is required")
  .isNumeric().withMessage("JSON parameter 'xIncrement' should be a number"),

  body('yIncrement')
  .notEmpty().withMessage("JSON parameter 'yIncrement' is required")
  .isNumeric().withMessage("JSON parameter 'yIncrement' should be a number"),
];
