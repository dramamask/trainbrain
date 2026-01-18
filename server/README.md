# Train-brain Server

## Piece definitions
Piece definitions are stored in `db/piece-definitions.json`.
Each piece has a name (the key), a category and attributes. The attributes as different from each piece type. The class associated with the piece type knows the meaning of the attributes object. The piece type classes are in the `src/layout` folder.

# Layout definition
The layout is stored in `db/track-layout.json`.
Layout pieces have a node on each side of the piece. Nodes know their location. Pieces know their heading. This is a graph type situation.

# Updating coordinates
Coordinates need to be recalculated when a new layout piece is added, or an existing node is moved or rotated.
Recalculation always starts at a node. A node will call `calculateCoordinatesAndContinue()` for each of its connected layout pieces. Those layout pieces will calcalculate the coordinate for all their other nodes, and call `setCoordinateAndContinue()` on those other nodes. Those other nodes will then call `calculateCoordinatesAndContinue()` on the other layout piece they are connected to, etc, etc, until we reach a node that is not connected to a layout piece.

In case of a loop we need to know when to stop. So a variable called `loopProtector` gets passed along with each of these function calls. Each node will store the `loopProtector` value. The call chain will stop once a node get's passed a `loopProtector` value that they already know.
