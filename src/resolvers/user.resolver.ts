import bcrypt from "bcryptjs";
import { users } from "../dummyData/data";
import User from "../models/user.model";
import { LogInInputType, SignUpUserType } from "../types";

const userResolver = {
  Query: {
    user: async (_: any, { userId }: { userId: string }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error in user query:", error);
        throw new Error("Error while getting user");
      }
    },
    authUser: async (_: any, __: any, context: any) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.log("Error in authUser:", error);
        throw new Error("Internal server error");
      }
    },
    // TODO: Add user/transaction relation
  },
  Mutation: {
    signUp: async (
      _: any,
      { input }: { input: SignUpUserType },
      context: any
    ) => {
      try {
        const { username, name, password, gender } = input;
        if (!username || !name || !password || !gender) {
          throw new Error("Please provide all fields");
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const maleProfilePicture = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePicture = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
          username,
          name,
          password: hashedPassword,
          gender,
          profilePicture:
            gender === "male" ? maleProfilePicture : femaleProfilePicture,
        });

        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (error) {
        console.log("Error in signUp:", error);
        throw new Error("Internal server error");
      }
    },
    logIn: async (
      _: any,
      { input }: { input: LogInInputType },
      context: any
    ) => {
      try {
        const { username, password } = input;
        if (!username || !password) throw new Error("All fields are required");
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (err) {
        console.error("Error in login:", err);
        throw new Error("Internal server error");
      }
    },
    logOut: async (_: any, __: any, context: any) => {
      try {
        await context.logout();
        context.req.session.destroy((err: Error) => {
          if (err) throw new Error("Error while loggin out");
        });
        context.res.clearCookie("connect.sid");

        return { message: "Logged out successfully" };
      } catch (error) {
        console.log("Error while loggin out:", error);
        throw new Error("Internal server error");
      }
    },
  },
};

export default userResolver;
