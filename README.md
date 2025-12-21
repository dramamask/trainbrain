# Train Brain

Personal project to run G gauge model trains in my back yard.

## Project Components

The project contains the following components:
- server: nodejs server project with express (port 3001)
- web-ui: next.js browser based UI with material-ui (port 3000)
- on-train: TBD

## React Data Stores
This project implements DIY stores powered by React's useSyncExternalStore hook. Unlike standard useState or Context, this approach provides a high-performance, synchronous way to subscribe to (custom) data stores. It prevents "tearing"—visual inconsistencies where different components read different versions of the same state during a single render—while ensuring full compatibility with React 18+ concurrent rendering features. Our stores are stored in the app/services/stores folder.

## Databases
This project uses the lowdb npm library to treat json files as a database.
A database is initialized once in the db.ts file. DBs are exported from the same file.
After that reading data from a DB can be done synchronosly. Writing to a DB needs to be done asynchronously. This means that a function needs to be an "async function" for it to be able to write to a DB.

## Notes
If I want to add text to the SVG layout, I need to mirror it in the component, so it
gets mirrored back the right way by the main transform component.