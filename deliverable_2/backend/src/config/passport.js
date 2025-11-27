import "./env.js";
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/users.js";

const sanitize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const ensureLength = (value) => {
  if (value.length >= 4 && value.length <= 40) return value;
  const padded = value.padEnd(4, "0");
  return padded.slice(0, 40);
};

const buildBaseUsername = (profile) => {
  const displayName = profile.displayName ?? "";
  const emailHandle = profile.emails?.[0]?.value?.split("@")[0] ?? "";
  const fallback = `google${profile.id}`;
  const raw = sanitize(displayName) || sanitize(emailHandle) || fallback;
  return ensureLength(raw);
};

const generateUniqueUsername = async (profile) => {
  const base = buildBaseUsername(profile);
  let candidate = base;
  let suffix = 1;

  while (await User.exists({ username: candidate })) {
    const suffixStr = `${suffix}`;
    const trimmedBase = base.slice(0, Math.max(4, 40 - suffixStr.length));
    candidate = `${trimmedBase}${suffixStr}`;
    suffix += 1;
  }

  return candidate;
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
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
            (await User.findOne({ googleId: profile.id })) ||
            (email ? await User.findOne({ email }) : null);

          if (!user) {
            const username = await generateUniqueUsername(profile);
            const randomPassword = crypto.randomBytes(24).toString("hex");
            user = await User.create({
              username,
              email: email || `${profile.id}@google.local`,
              password: randomPassword,
              googleId: profile.id,
              authProvider: "google",
              loggedIn: true,
            });
          } else {
            user.googleId = profile.id;
            user.authProvider = "google";
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

