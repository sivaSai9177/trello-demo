import { Hono } from 'hono'
import { RPCHandler } from "@orpc/server/fetch";

import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { projectsRoute } from "./routes/projects";
import { tasksRoute } from "./routes/tasks";
import { commentsRoute } from './routes/comments';
import { cors } from "hono/cors";
import { appRouter, createContext } from "./rpc";

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

// oRPC Handler
const rpcHandler = new RPCHandler(appRouter);

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: createContext(),
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// REST Routes (keep for gradual migration)
app.route("/projects", projectsRoute);
app.route("/tasks", tasksRoute);
app.route("/comments", commentsRoute);

// app.get("/", (c) => c.json({ message: "API is running 🚀" }));

export default app
