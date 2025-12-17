import express from "express";
import { getLayout } from "./track/layout.js";

const app = express();
const port = 3001;

// Endpoint to GET the track layout
app.get("/layout", (_req, res) => {
    res.header("Content-Type", "application/json");

    try {
      res.send(JSON.stringify({ layout: getLayout() }));
    } catch (error) {
      res.status(500).send({ error: (error as Error).message });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

