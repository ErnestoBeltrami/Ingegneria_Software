import express from "express";
const app = express()

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// give to the app the ability to parse json request 
app.use(express.json());
// Routes import
import userRouter from './routes/user.route.js';
// import postRouter from './routes/post.route.js';


// Routes declaration
app.use("/users", userRouter);


export default app;