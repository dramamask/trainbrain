import { body } from 'express-validator';
import { layout } from '../services/init.js';
import { pieceDefintionsDb } from '../services/db.js';

export const addLayoutPieceSchema = [
  body('pieceId')
    .exists().withMessage("JSON parameter 'pieceId' is required")
    .notEmpty()
    .isString().withMessage("JSON parameter 'pieceId' should be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("JSON parameter 'pieceId' should be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("JSON parameter 'pieceId' should be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .custom((id: string) => {
      const highestIdAllowed = layout.getHighestPieceId();
      if (Number(id) > highestIdAllowed) {
        throw new Error("The value of JSON parameter `pieceId` does not match a piece in the layout")
      }
      return true;
    }),

  body('nodeId')
    .exists().withMessage("JSON parameter 'nodeId' is required")
    .notEmpty().isString().withMessage("JSON parameter 'nodeId' should be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("JSON parameter 'nodeId' should be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("JSON parameter 'nodeId' should be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .custom((id: string) => {
      const highestIdAllowed = layout.getHighestNodeId();
      if (Number(id) > highestIdAllowed) {
        throw new Error("The value of JSON parameter `nodeId` does not match a node in the layout")
      }
      return true;
    }),

  body('pieceDefId')
    .exists().withMessage("JSON parameter 'pieceDefId' is required")
    .notEmpty().isString()
    .withMessage("JSON parameter 'pieceDefId' should be a string")
    .custom((id: string) => {
      if (id in pieceDefintionsDb.data.definitions) {
        return true;
      }
      throw new Error("The value of JSON parameter `pieceDefId` does not match a known piece definition")
    }),
];
