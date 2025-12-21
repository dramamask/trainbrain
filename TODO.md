# TODO
Mark D is free to move any of the todo items around, either up or down the order.

- Also convert current code to interface with piece-definitions.json to lowdb.
- Is there a way to cache the background image in the UI so it always loads fast? Sometime it's just slow to load.
- I don't like the tracklayout.json element called "piece-1". We need a better name for that. Maybe just go with "startposition"?
- In edit mode, ability to move track with arrow keys (need to create server part. Need to have the Ui update when new layout arrives).
- In edit mode, ability to move track with mouse.
- Make a setting on the screen to turn on or off the start position indicator.
- Ask AI to make my background look better. Maybe use Photoshop AI to change each peace by piece with specific prompts?
- Make the world size configurable. Decribe in the readme that the world size is the size of the visible area in millimeters.
- Make the stroke width, indicator length, and start pos indicator radius dependant on the world size. Auto resize.
  Make it configurable as pixels per millimeter or something.
- Finish the layout calculation on the back-end to work with the pieces that "break the chain".
- Use strip-json-comments to strip comments from the JSON layout file. Then add comments to make it easier for me to read.
- Make a place in the UI where it shows all the different pieces that we need and how many of each.
  Probably need to make another API for that.
- Make the background image configurable.
- Build a layout editor. Keep it simple. Make a "add next track piece" function, default to a straight? Have an
  easy way to change the piece. Maybe with mouse clicks or keyboard shortcuts.
- Start working on an intersection piece (a cross).
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements?
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Use JSON Schema to validate the json piece-defintion and (most importantly) the layout json file.
- Add option to manually enter the world size.
- Figure out which project can take commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well. --> I think they are all ESM except for the UI. How to swap? --> From AI: "You can force the entire project to be treated as ESM by adding "type": "module" to your package.json." --> Try it!

