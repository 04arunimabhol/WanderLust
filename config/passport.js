const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");

passport.use(new LocalStrategy(User.authenticate()));

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.NODE_ENV === "production"
                    ? "https://wanderlust-zebh.onrender.com/auth/google/callback"
                    : "http://localhost:8080/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {

                let user = await User.findOne({
                    googleId: profile.id,
                });

                if (user) {
                    return done(null, user);
                }

                user = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (user) {

                    user.googleId = profile.id;
                    user.provider = "google";

                    if (profile.photos && profile.photos.length > 0) {
                        user.profilePicture = profile.photos[0].value;
                    }

                    await user.save();

                    return done(null, user);
                }

                const email = profile.emails[0].value;

                // Generate username from email
                let username = email.split("@")[0];

                // Check if username already exists
                const existingUsername = await User.findOne({ username });

                if (existingUsername) {
                    username = `${username}_${Math.floor(Math.random() * 10000)}`;
                }

                const newUser = new User({
                    username,
                    email,
                    googleId: profile.id,
                    provider: "google",
                    profilePicture: profile.photos?.[0]?.value || "",
                });

                await newUser.save();

                done(null, newUser);

            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());