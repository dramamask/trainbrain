# TODO
- Fix the height of the error message display. It should not fill the entire screen vertically.
- Make a setting on the screen to turn on or off the start position indicator.
- Finish the layout calculation on the back-end to work with the pieces that "break the chain".
- Use strip-json-comments to strip comments from the JSON layout file. Then add comments to make it easier for me to read.
- Make a place in the UI where it shows all the different pieces that we need and how many of each.
  Probably need to make another API for that.
- Create API to show the trian position. How do we want to show it on the map (SVG I presume). What info do we need
  from the back-end for that (just coordinates?).
- Start working on an intersection piece (a cross). We need error calculations to see if it lines up.
- Use JSON Schema to validate the json piece-defintion and (most importantly) the layout json file.
- Build a layout editor. With snap functionality. Editing the JSON is cumborsom.
