// RPC Context - Available in all procedures
import { db } from "../db/db";
import { broadcast } from "../ws/manager";

export const createContext = () => ({
  db,
  broadcast,
  // Future: Add user authentication
  // user: getUserFromToken(req.headers.authorization)
});

export type Context = ReturnType<typeof createContext>;
