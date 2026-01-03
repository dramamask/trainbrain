# Train-brain Server

## Piece definitions
Piece definitions are stored in `db/piece-definitions.json`.
Each piece has a name (the key), a category and attributes. The attributes as different from each piece type. The class associated with the piece type knows the meaning of the attributes object. The piece type classes are in the `src/layout` folder.

# Layout definition
The layout is stored in `db/track-layout.json`.
Each layout piece has a type, attributes and connections. The type is a name (key) from the piece definitions file. The class associated with the piece type knows the meaning of the attributes and connections objects. The piece type classes are in the `src/layout` folder.

The connections object defines the other layout pieces that the piece is connected to. Each connections object has at least a "start" and "end" piece, and may have other connections defined as well (for example a switch has a third connection in addition to the start and end).