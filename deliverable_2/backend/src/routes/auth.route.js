import { Router } from "express";
import passport from "../config/passport.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    const user = req.user
      ? {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          authProvider: req.user.authProvider,
        }
      : null;

    res.status(200).json({
      message: "Google login successful",
      user,
    });
  }
);

router.get("/failure", (_req, res) => {
  res.status(401).json({
    message: "Google authentication failed",
  });
});

router.get("/status", (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({
      authenticated: false,
      user: null,
    });
  }

  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      authProvider: req.user.authProvider,
    },
  });
});

router.post("/logout", async (req, res, next) => {
  try {
    if (!req.isAuthenticated?.()) {
      return res.status(200).json({
        message: "No active session",
      });
    }

    if (req.user) {
      req.user.loggedIn = false;
      await req.user.save();
    }

    req.logout((error) => {
      if (error) return next(error);

      req.session?.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(200).json({
          message: "Logged out from Google session",
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

export default router;

