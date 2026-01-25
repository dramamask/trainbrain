import { body } from 'express-validator';
import { layout } from '../services/init.js';

export const addLayoutPieceSchema = [
  body('nodeId')
    .exists().withMessage("JSON parameter 'nodeId' is required")
    .notEmpty().withMessage("Please select the node you want to add the track piece to")
    .isString().withMessage("JSON parameter 'nodeId' should be a string")
    .custom((id: string) => {
      const node = layout.getNode(id);
      if (!node) {
        throw new Error("JSON parameter 'nodeId' does not match a node in the layout");
      }
      return true;
    }),

  body('pieceDefId')
    .exists().withMessage("JSON parameter 'pieceDefId' is required")
    .notEmpty().withMessage("JSON parameter 'pieceDefId' should not be empty")
    .isString().withMessage("JSON parameter 'pieceDefId' should be a string")
    .custom((id: string) => {
      const pieceDef = layout.getPieceDef(id);
      if (!pieceDef) {
        throw new Error("JSON parameter 'pieceDefId' does not match a known piece definition");
      }
      return true;
    }),
];
