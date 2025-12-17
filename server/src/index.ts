import express from "express";
import { Coordinate } from "trainbrain-shared";
import { getLayout } from "./track/layout.js";

const app = express();
const port = 3001;

// Endpoint to GET the track layout
app.get("/layout", (_req, res) => {
  const trackStart : Coordinate = {
    x: Number(_req.query.x ?? "0"),
    y: Number(_req.query.y ?? "0"),
    heading:Number (_req.query.heading ?? "0"),
  };

  res.header("Content-Type", "application/json");

  try {
    res.send(JSON.stringify({ layout: getLayout(trackStart) }));
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
