# TODO

- Draw the track pieces as actual track pieces in normal mode. With proper colors and shapes.
- Auto connect two nodes if they are on the same coordinate (within x millimeters)
- Add the PieceDefId to the UI layout data.
- Show piece and node ID and other info somewhere when we hover over the piece or node.
- Remove category and attribtues from the LayoutUiData pieces data. We don't need it if we have the pieceDefId.
- Make a place in the UI where it shows all the different pieces that we need and how many of each (add to end of layout api).
- Add the world size to the layout json file.
- Add protection so you can't move the layout outside of the world size.
- Work on indicating track pieces that are close together but are not connected.
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements? We may have to change the connections model.
- Start working on an intersection piece (a cross).
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Use world size to set the aspect ration and size of the background image. "Reserve the space" so when we load the image container doesn't all of a sudden resize.
- Either delete by selecting a track piece or delete in between two nodes. if in between two nodes then we need to update the "daisy chain" method to accept an end-at-this-node type param. Rename the function to dais-chain something and make it flexible to be able to do different things. maybe take an object as input that contains params and a command name or something.
- add possibility to select multiple pieces and nodes.
- Can we do certain operations in an atomic way? If we are going to take in concurrent API requests we should be able to temporarily disable any new incoming requests while we update the layout. We should be able to request a lock, waiting till other operations are finished, make the changes, then release the lock.
- Is there a way to cache the background image in the UI so it always loads fast? Sometime it's just slow to load.
- Change the GET layout API response to be a record with string keys instead of an array. That makes looking up specific pieces and nodes a lot easier in the UI. The current format may slow things down if we have too many pieces or nodes.
- Figure out which project can take commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well. --> I think they are all ESM except for the UI. How to swap? --> From AI: "You can force the entire project to be treated as ESM by adding "type": "module" to your package.json." --> Try it!
- Make the stroke width, indicator length, and start pos indicator radius dependant on the world size. Auto resize.
  Make it configurable as pixels per millimeter or something.
- Remove scrollbars when zoomFactor is 1.
- Make the scroll bars more like oem, with arrows at the top and bottom
- Zoom on layout map when mouse scroll is used. Make mouse pointer position the zoom focal point.
- Expand zoom functionality to take up the entire window. Add pan controls. Add zoom controls.
- Add layout map inside a MUI Card
- combine layout-nodes and layout-piece.json so we can have more atomic saves.
- Make cards collapsable where there's only a title bar visible.
- Add react grid (or whatever it is called) for the cards in right side "controls section"
- Add OTEL Collector to sit in between server and Jaeger.
- Create a pieceFactory class.
- Reorganizie "shared" project folder section with different files to organize it better.