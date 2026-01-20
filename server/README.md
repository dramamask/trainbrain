# Train-brain Server

## Piece definitions
Piece definitions are stored in `db/piece-definitions.json`.
Each piece has a name (the key), a category and attributes. The attributes as different from each piece type. The class associated with the piece type knows the meaning of the attributes object. The piece type classes are in the `src/layout` folder.

# Layout definition
The layout is stored in `db/track-layout.json`.
Layout pieces have a node on each side of the piece. Nodes know their location. Pieces know their heading. This is a graph type situation.

## Layout pieces, connectors and nodes
Definitions:
- The Layout represent zero to infinity physical track pieces that may or may not be connected to each other.
- A layout piece object represent a physical track piece (straight, curve, switch, etc) in a layout.
- A layout piece object has two or more connector objects. One connector object on each side of the piece.
- Connector objects are part of a layout piece object. They cannot live independently of a layout piece object.
- A node object is a separate independent object.
- A connector object is always connected to a node object. A connector object cannot be disconnected from a node. (Nodes can be swapped out though.)
- A node object can only be connected to a connector, never to a layout pieceobject directly.
- A node object may be connected to zero, one, or two connector objects.

```
    N   N
    C   C
    |  /
    | /
    |/
    C
    N
    C
    |
    |
    |
    C
    N

C = Connector
N = Node
| = Used to draw layout pieces
```

## Connector names
Each connector has names. Each piece must at least have a connector named "start" and another connector named "end". Pieces with more than two connectors have different names, as defined in the piece's class in the server project.

## Default piece placement
When a new piece is added to the end of the layout it will always be placed with the "start" connector connected to the existing node. Pieces may be rotated, or flipped after they are added to the layout.

## Heading
Each connector object has a heading. The heading is always defined as moving in the direction of the track going into the piece. In other words, it is the direction that a train would go in if they were to come from a connected piece and move onto our piece.

```
    N
    C ↓ (heading is 180 degrees)
    |
    |
    |
    C ↑ (heading = 0 degrees)
    N

```

# Updating coordinates
Coordinates need to be recalculated when a new layout piece is added, or an existing node is moved or rotated.
Recalculation always starts at the Layout class object with its `updateAllConnectedCoordinatesAndHeadings()` method. This method kicks off a chain call, that starts at the node(s) that were affected in the update, and goes from node to piece until all connected nodes and pieces have been updated.

In case of a loop we need to know when to stop. So a variable called `loopProtector` gets passed along with each of these function calls. Each node will store the `loopProtector` value. The call chain will stop once a node get's passed a `loopProtector` value that they already know.
