import passport from "passport";
import bcrypt from "bcryptjs";

import User from "../models/user.model";
import { GraphQLLocalStrategy } from "graphql-passport";

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) throw new Error("Invalid User Credentials");
        const isValidPassword = await bcrypt.compare(
          password as string,
          user.password
        );
        if (!isValidPassword) throw new Error("Invalid User Credentials");
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
