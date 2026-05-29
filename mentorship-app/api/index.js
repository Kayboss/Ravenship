import app from "../src/server.js";

app.use((req, res, next) => {
  if (req.url !== "/" && !req.url.startsWith("/api") && !req.path.startsWith("/api")) {
    req.url = "/api" + req.url;
  }
  next();
});

export default app;
