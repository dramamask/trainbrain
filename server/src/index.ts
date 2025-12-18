import express from "express";
import cors from "cors";
import { Coordinate } from "trainbrain-shared";
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
  const trackStart : Coordinate = {
    x: Number(_req.query.x ?? "0"),
    y: Number(_req.query.y ?? "0"),
    heading:Number (_req.query.heading ?? "0"),
  };

  res.header("Content-Type", "application/json");

  try {
    res.send(JSON.stringify(getLayout(trackStart)));
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
