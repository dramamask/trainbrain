import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import { initProcessHandlers } from './services/processhandlers.js';
import apiRoutes from "./routes/index.js";

initProcessHandlers();

const PORT = 3001;
const app = express();

// Automatically parse request data to json if the content type header says it's json
app.use(express.json());

// Enable CORS headers. Allow our front-end UI to call us.
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE" ],
    credentials: true,
  })
);

// Load routes
app.use("/", apiRoutes);

// Global exception handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ messages: { error: "Unknown error at the edge. Check server logs." } })
});

// Test route for debugging purposes
app.get("/health", (_req: Request, res: Response) => {
  res.send("up and running");
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
