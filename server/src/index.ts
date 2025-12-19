import express from "express";
import cors from "cors";
import { Coordinate, UiLayout } from "trainbrain-shared";
import { getLayout } from "./track/layout.js";

const port = 3001;
const app = express();

// Enable CORS headers. Allow our front-end UI.
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE" ],
    credentials: true,
  })
);

// Endpoint to GET the track layout
app.get("/layout", (_req, res) => {
  res.header("Content-Type", "application/json");

  try {
    const layout = getLayout();
    const status = getHttpStatusCode(layout);
    res.status(status).send(JSON.stringify(layout));
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(500).send("Unknown error at the edge. Check server logs.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function getHttpStatusCode(layout: UiLayout): number {
  if (layout.messages.error != "") {
    return 500;
  }

  return 200;
}
