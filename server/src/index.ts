import express from 'express';
import cors from "cors";
import apiRoutes from "./routes/index.js";

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

// Test route for debugging purposes
app.get("/test", (req, res) => {
  res.send("nothing here");
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
