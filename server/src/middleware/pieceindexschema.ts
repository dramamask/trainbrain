import { param } from 'express-validator';
import { layout } from '../services/init.js';

// Validation for routes that have an index in the URL
export const pieceIndexSchema = [
  param('index').exists({checkFalsy: true})
  .withMessage('Index is required')
  .isString()
  .withMessage('Index must be a string')
  .custom((id: string) => {
    if(isNaN(Number(id))) {
      throw new Error("Index should be a string representation of a numeric value");
    }
    if(Number(id) < 0) {
      throw new Error("Index should be a string representation of a numeric value greater than or equal to zero")
    }
    return true;
  })
  .custom((id: string) => {
    const highestIdAllowed = layout.getHighestPieceId();
    if (Number(id) > highestIdAllowed) {
      throw new Error("Index does not match a Piece ID in the layout")
    }
    return true;
  }),
];
