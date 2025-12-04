import "./config/env.js";
import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import operatoreRouter from "./routes/operatore.route.js";
import cittadinoAuth from "./routes/cittadino.route.js";
import votazioneRouter from "./routes/votazione.route.js";
import iniziativaRouter from "./routes/iniziativa.route.js";
import categoriaRouter from "./routes/categoria.route.js";
const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// give to the app the ability to parse json request
app.use(express.json());

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes declaration
app.use("/operatore", operatoreRouter);
app.use("/auth", cittadinoAuth);
app.use("/votazioni", votazioneRouter);
app.use("/iniziative", iniziativaRouter);
app.use("/categorie", categoriaRouter);

export default app;