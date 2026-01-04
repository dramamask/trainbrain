import { body } from 'express-validator';
import { layout } from '../services/init.js';
import { pieceDefintionsDb } from '../services/db.js';

export const addLayoutPieceSchema = [
  body('connectionName')
    .notEmpty().isString().isIn(["start", "end", "diverge"])
    .withMessage("JSON parameter 'connectionName' is required and should either have one of the following values: 'start', 'end', 'diverge'"),

  body('connectToPiece')
    .notEmpty().isString().toInt().isInt({ min: 0 })
    .withMessage("JSON parameter 'connectToPiece' is required and should be a string representation of a numeric value greater than or equal to 0")
    .custom((id: number) => {
      const highestIdAllowed = layout.getHighestPieceId();
      if (id > highestIdAllowed) {
        throw Error("The value of JSON parameter `connectToPiece` does not match an ID in the layout DB")
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
    //       use track-layout-definitions.json
];
