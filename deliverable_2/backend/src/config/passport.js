import "../config/env.js";
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Cittadino } from "../models/cittadino.js";

const sanitize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const ensureLength = (value) => {
  if (value.length >= 4 && value.length <= 40) return value;
  const padded = value.padEnd(4, "0");
  return padded.slice(0, 40);
};


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Cittadino.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials are missing. Google login is disabled.");
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          let user =
            (await Cittadino.findOne({ ID_univoco_esterno: profile.id })) ||
            (email ? await Cittadino.findOne({ email }) : null);

          if (!user) {
            user = await Cittadino.create({
              email: email || `${profile.id}@google.local`,
              ID_univoco_esterno: profile.id,
              loggedIn : true,
              profiloCompleto : false
            });
          } else {
            user.ID_univoco_esterno = profile.id;
            user.loggedIn = true;
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

export default passport;

