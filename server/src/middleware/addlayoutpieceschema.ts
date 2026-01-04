import { body } from 'express-validator';
import { trackLayoutDb } from '../services/db.js';
import { pieceDefintionsDb } from '../services/db.js';

export const addLayoutPieceSchema = [
  body('beforeOrAfter')
    .notEmpty().isString().isIn(["before", "after"])
    .withMessage("JSON parameter 'beforeOrAfter' is required and should either have the value 'before' or 'after'"),

  body('beforeOrAfterId')
    .notEmpty().isNumeric().toInt().isInt({ min: 0 })
    .withMessage("JSON parameter 'beforeOrAfterId' is required and should be a numeric value greater than or equal to 0")
    .custom((id: number) => {
      const highestIdAllowed = trackLayoutDb.data.pieces.length - 1;
      if (id > highestIdAllowed) {
        throw Error("The value of JSON parameter `beforeOrAfterId` does not match an ID in the layout DB")
      }
      return true;
    }),

  body('pieceDefId')
    .notEmpty().isString()
    .withMessage("JSON parameter 'pieceDefId' is required and should be a string")
    .custom((id: string) => {
      if (id in pieceDefintionsDb.data.definitions) {
        return true;
      }
      throw new Error("The value of JSON parameter `pieceDefId` does not match an ID in the piece definitions DB")
    }),

  body('layoutAttributes')
    .exists()
    .withMessage("JSON parameter 'layoutAttributes' is required (but may  be empty)"),
    // TODO: add validation to check if attributes are necessary for this particular pieceDefId
];
