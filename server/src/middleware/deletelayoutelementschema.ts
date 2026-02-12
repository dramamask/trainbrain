import { body } from 'express-validator';
import { layout } from '../services/init.js';

// Validation schema for routes that take a coordiante as a JSON body parameter
export const deleteLayoutElementSchema = [
  body('pieceId')
    .if(id => id != "") // Stop validation here if the string is an empty string
    .isString().withMessage("Parameter 'pieceId' must be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("Parameter 'pieceId' must be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("Parameter 'pieceId' must be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .isString().withMessage("Parameter 'pieceId' must be a string")
    .custom((id: string) => {
      const piece = layout.getLayoutPiece(id);
      if (!piece) {
        throw new Error("Parameter 'pieceId' does not match a Piece in the layout")
      }
      return true;
    }),

  body('nodeId')
    .custom((id: string, { req }) => {
      if (!req.body.pieceId && !id) {
        throw new Error("Please select a layout node and/or a layout piece to delete");
      }
      return true;
    })
    .if(id => id != "") // Stop validation here if the string is an empty string
    .isString().withMessage("Parameter 'nodeId' must be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("Parameter 'nodeId' must be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("Parameter 'nodeId' must be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .custom((id: string) => {
      const node = layout.getNode(id);
      if (!node) {
        throw new Error("Parameter 'nodeId' does not match a Node in the layout")
      }
      return true;
    }),
];
