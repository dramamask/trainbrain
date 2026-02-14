import { param } from 'express-validator';
import { layout } from '../services/init.js';

export const flipLayoutPieceSchema = [
  param('index')
  .custom((id: string) => {
    const numConnectedPieces = layout.getLayoutPiece(id)?.getNumberOfConnectedPieces();
    if (numConnectedPieces != 1) {
      let msg = "Only pieces that are connected to exactly one other piece can be flipped. ";
      msg += `This layout piece is connected to ${numConnectedPieces} pieces.`;
      throw new Error(msg);
    }
    return true;
  }),
];
