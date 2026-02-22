import { body } from 'express-validator';
import { layouts } from '../services/init.js';

export const mergeNodesSchema = [
  body('nodeThatWillMoveId')
    .isString().withMessage("Parameter 'nodeThatWillMoveId' must be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("Parameter 'nodeThatWillMoveId' must be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("Parameter 'nodeThatWillMoveId' must be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .custom((id: string) => {
      const piece = layouts.getActiveLayout().getNode(id);
      if (!piece) {
        throw new Error("Parameter 'nodeThatWillMoveId' does not match a Node in the layout")
      }
      return true;
    }),

  body('nodeThatWillNotMoveId')
    .isString().withMessage("Parameter 'nodeThatWillNotMoveId' must be a string")
    .custom((id: string) => {
      if(isNaN(Number(id))) {
        throw new Error("Parameter 'nodeThatWillNotMoveId' must be a string representation of a numeric value");
      }
      if(Number(id) < 0) {
        throw new Error("Parameter 'nodeThatWillNotMoveId' must be a string representation of a numeric value greater than or equal to zero")
      }
      return true;
    })
    .custom((id: string) => {
      const piece = layouts.getActiveLayout().getNode(id);
      if (!piece) {
        throw new Error("Parameter 'nodeThatWillNotMoveId' does not match a Node in the layout")
      }
      return true;
    }),
];
