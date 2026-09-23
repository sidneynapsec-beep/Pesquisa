import app, { startServer, authenticateUser, requireAdmin } from "./api/index";

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}

export { app, authenticateUser, requireAdmin };
export default app;
