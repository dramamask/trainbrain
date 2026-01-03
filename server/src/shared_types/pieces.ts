import { TrackPieceCategory } from 'trainbrain-shared';

// The structure of a track piece definition
export interface TrackPieceDef {
    category: TrackPieceCategory;
    attributes: object;
}

// A list of TrackPieceDef records
export type TrackPieceDefList = Record<string, TrackPieceDef>;

// The structure of the piece-defintions json db
export interface PieceDefinitions {
    definitions: TrackPieceDefList;
}