import express from "express";

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// give to the app the ability to parse json request 
app.use(express.json());
// Routes import
import userRouter from './routes/user.route.js';
// import postRouter from './routes/post.route.js';


// Routes declaration
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/posts", postRouter);
// example route: http://localhost:3000/api/v1/users/register


export default app;