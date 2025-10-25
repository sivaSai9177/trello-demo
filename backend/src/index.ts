import { Hono } from 'hono'

import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { projectsRoute } from "./routes/projects";
import { tasksRoute } from "./routes/tasks";
import { commentsRoute } from './routes/comments';
import { cors } from "hono/cors";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Your React app URLs
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.route("/projects", projectsRoute);
app.route("/tasks", tasksRoute);
app.route("/comments", commentsRoute);

// app.get("/", (c) => c.json({ message: "API is running 🚀" }));

export default app
