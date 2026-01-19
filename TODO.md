# TODO

- Test adding a piece.
- Refactor connectors to use Set instead of array.
- Work on adding a piece on the UI side after the server side is done.
- Work on inserting a piece.
- Work on rotating a piece. Do need separate logic afterall?
- Work on deleting a piece.
- Reorganizie "shared" project folder section with different files to organize it better.
- Send the PieceDefId to the UI so the UI can show it with a tooltip of something
- Can i do the piece delete, piece update and piece rotate logic inside the LayoutPiece itself? Seems cleaner.
- Make a place in the UI where it shows all the different pieces that we need and how many of each (add to end of layout api).
- Do not allow start position move when a piece is selected. Info message.
- Add the world size to the layout json file.
- Add protection so you can't move the layout outside of the world size.
- Ability to move a track layout piece.
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements? We may have to change the connections model.
- When deleting a switch the side that is connected to the "diverge" connector may become orphaned. We need to
  test for that and refuse to delete if that's the case. We need to walk the layout to find if that track sections ends in a deadend or not.
- Start working on an intersection piece (a cross).
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Is there a way to cache the background image in the UI so it always loads fast? Sometime it's just slow to load.
- Figure out which project can take commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well. --> I think they are all ESM except for the UI. How to swap? --> From AI: "You can force the entire project to be treated as ESM by adding "type": "module" to your package.json." --> Try it!
- Make the stroke width, indicator length, and start pos indicator radius dependant on the world size. Auto resize.
  Make it configurable as pixels per millimeter or something.
- Remove scrollbars when zoomFactor is 1.
- Make the scroll bars more like oem, with arrows at the top and bottom
- Zoom on layout map when mouse scroll is used. Make mouse pointer position the zoom focal point.
- Expand zoom functionality to take up the entire window. Add pan controls. Add zoom controls.
- Add layout map inside a MUI Card

