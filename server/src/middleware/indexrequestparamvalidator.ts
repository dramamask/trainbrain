import { body, param } from 'express-validator';

export const indexRequestParamSchema = [
  param('index')
    .exists().withMessage("Index parameter is required")
    .isInt().withMessage("Index must be an interger")
    .toInt() // Convert to integer when used in the controller
    .isInt({ min: 0 }).withMessage("Index must be greater than or equal to zero"),
];
