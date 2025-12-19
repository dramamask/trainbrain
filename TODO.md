# TODO
- In edit mode, ability to move track with arrow keys.
- In edit mode, ability to move track with mouse.
- Make a setting on the screen to turn on or off the start position indicator.
- Finish the layout calculation on the back-end to work with the pieces that "break the chain".
- Read the world size from the background image size. If no image then default to 5000 by 5000.
- Use strip-json-comments to strip comments from the JSON layout file. Then add comments to make it easier for me to read.
- Make a place in the UI where it shows all the different pieces that we need and how many of each.
  Probably need to make another API for that.
- Build a layout editor. Keep it simple. Make a "add next track piece" function, default to a straight? Have an
  easy way to change the piece. Maybe with mouse clicks or keyboard shortcuts.
- Start working on an intersection piece (a cross).
- Start working on a switch. Lookup the specs online. Are there different angles? What are the measurements?
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Use JSON Schema to validate the json piece-defintion and (most importantly) the layout json file.
- Add option to manually enter the world size.
- Figure out which project can ake commonjs and which can take esm. How can I switch them all to esm? How to have the shared library be esm as well.
