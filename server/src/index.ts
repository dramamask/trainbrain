import express from "express";
import { body, validationResult } from "express-validator";
import cors from "cors";
import { Coordinate, UiLayout } from "trainbrain-shared";
import { getLayout } from "./track/getlayout.js";
import { setStartPosition } from "./track/setlayout.js";
import { layout } from "./services/init.js";

const port = 3001;
const app = express();

// Automatically parse request data to json of the conten type header says it's json
app.use(express.json());

// Enable CORS headers. Allow our front-end UI.
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE" ],
    credentials: true,
  })
);

// Endpoint to GET the track layout
app.get("/layout", (req, res) => {
  try {
    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(500).send("Unknown error at the edge. Check server logs.");
  }
});

// Endpoint to PUT the track layout start position
app.put("/layout/start-position",
  // Validation middleware chain
  body('x').notEmpty().isNumeric().withMessage("JSON paramter 'x' is required and should be a number"),
  body('y').notEmpty().isNumeric().withMessage("JSON paramter 'y' is required and should be a number"),
  body('heading').notEmpty().isNumeric().withMessage("JSON paramter 'heading' is required and should be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newStartPos: Coordinate = {
      x: Number(req.body.x),
      y: Number(req.body.y),
      heading: Number(req.body.heading)
    };

    try {
      await layout.updateStartPosition(newStartPos);
      const uiLayout = layout.getUiLayout();
      const status = getHttpStatusCode(uiLayout);

      res.header("Content-Type", "application/json");
      res.status(status).send(JSON.stringify(uiLayout));
    } catch (error) {
      console.error("Unknown error at the edge", error);
      res.status(500).send("Unknown error at the edge. Check server logs.");
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Returns the status code that we should use when returning the UI Layout,
// based on the fact if there's an error message in the UI Layout message struct.
function getHttpStatusCode(layout: UiLayout): number {
  if (layout.messages.error != "") {
    return 500;
  }
  return 200;
}
