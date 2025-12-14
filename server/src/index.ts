import express from "express";
import * as track from "./tracklayout.js";

const app = express();
const port = 3000;

// Endpoint to GET the track layout
app.get("/track", (_req, res) => {
    res.header("Content-Type", "application/json");

    try {
      res.send(JSON.stringify({ layout: track.getLayout() }));
    } catch (error) {
      res.status(500).send({ error: (error as Error).message });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

