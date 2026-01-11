# TODO

- Do not show pointr cursor on track pieces unless in edit mode
- Build a layout editor UI.
- Draw start position differently depending on the fact if it has pieces connected to it or not.
- Create API to delete a piece.
- Create UI to delete a piece.
- Make a place in the UI where it shows all the different pieces that we need and how many of each (add to end of layout api).
- Style the zoom control values. The font should be smaller.
- Add the world size to the layout json file.
- Add protection so you can't move the layout outside of the world size.
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements? We may have to change the connections model.
- Start working on an intersection piece (a cross).
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Is there a way to cache the background image in the UI so it always loads fast? Sometime it's just slow to load.
- Figure out which project can take commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well. --> I think they are all ESM except for the UI. How to swap? --> From AI: "You can force the entire project to be treated as ESM by adding "type": "module" to your package.json." --> Try it!
- Make the stroke width, indicator length, and start pos indicator radius dependant on the world size. Auto resize.
  Make it configurable as pixels per millimeter or something.
- Expand zoom functionality to take up the entire window. Add pan controls. Add zoom controls.

