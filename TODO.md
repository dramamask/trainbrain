# TODO

- Continue working on zoom functionality. This will be used when adding new piece.
- Build a layout editor. Keep it simple. Make a "add next track piece" function, default to a straight? Have an
  easy way to change the piece. Maybe with mouse clicks or keyboard shortcuts.
- Make a place in the UI where it shows all the different pieces that we need and how many of each.
  Probably need to make another API for that.
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements?
- Start working on an intersection piece (a cross).
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Is there a way to cache the background image in the UI so it always loads fast? Sometime it's just slow to load.
- Figure out which project can take commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well. --> I think they are all ESM except for the UI. How to swap? --> From AI: "You can force the entire project to be treated as ESM by adding "type": "module" to your package.json." --> Try it!
- Make the world size configurable. Decribe in the readme that the world size is the size of the visible area in millimeters.
- Make the stroke width, indicator length, and start pos indicator radius dependant on the world size. Auto resize.
  Make it configurable as pixels per millimeter or something.

