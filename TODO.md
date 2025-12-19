# TODO
- Have each event handler register themselves with another funciton, a Factory of sorts. Then use that factory function in the keyboardEventHandler.tsc component.
- Rewrite the tracklayout stores to work the same was as the errorStore.
- Make a layout delivery mechanism where we get the layout from other API calls as well, not just the one on the tracklayout component. E.g. also from the keyboard handler API call to set piece1position.
- piece 1 api call should be a PUT, not POST.
- Store layout in database? May be easier to save the layout in a database than having to write to a json file?
- In edit mode, ability to move track with arrow keys (need to create server part. Need to have the Ui update when new layout arrives).
- In edit mode, ability to move track with mouse.
- Make a setting on the screen to turn on or off the start position indicator.
- Ask AI to make my background look better. Maybe use Photoshop AI to change each peace by piece with specific prompts?
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
