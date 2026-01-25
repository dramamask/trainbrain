# Train Brain

Personal project to run G gauge model trains in my back yard.
I am currently only developing the components that I need.

## Project Components

The project contains the following components:
- server: nodejs server project with express (port 3001)
- ui: next.js browser based UI with material-ui (port 3000)
- shared: Interface and type definitions that are used in multiple components
- on-train: TBD
- devices: TBD (switches, lights, signals, position detectors)
- mocks: TBD (train and device mocks for testing)

## React Data Stores
This project implements DIY stores powered by React's useSyncExternalStore hook. Unlike standard useState or Context, this approach provides a high-performance, synchronous way to subscribe to (custom) data stores. It prevents "tearing"—visual inconsistencies where different components read different versions of the same state during a single render—while ensuring full compatibility with React 18+ concurrent rendering features. Our stores are stored in the app/services/stores folder.

## Databases
This project uses the lowdb npm library to treat json files as a database.
A database is initialized once in the db.ts file. DBs are exported from the same file.
After that reading data from a DB can be done synchronosly. Writing to a DB needs to be done asynchronously. This means that a function needs to be an "async function" for it to be able to write to a DB.

## Logging/Tracing
This app uses OTEL. We use Jaeger to visualize the spans.<br/>
Start Jaeger on the command line from `C:\Users\m\code\jaeger` with command `./jaeger.exe`.<br/>
Then go to [http://localhost:16686](http://localhost:16686) to open the Jaeger UI.

## Background Map Image
The size of the background map image and the world width and height have to match. The world width and height is in millimeters. The aspect ratio of the world width and height has to match the aspect ratio of the map image.

At the time of writing:
Map image (height x width) = 1500 x 1313 (aspect ratio 1.14)
World size (height x width) = 15240 x 13335 (aspect ratio 1.14)

The map image should always be displayed in the correct aspect ratio. The CSS, or any other code, should never change the aspect ration at which the background image is displayed.

## Notes
If I want to add text to the SVG layout, I need to mirror it in the component, so it
gets mirrored back the right way by the main transform component.