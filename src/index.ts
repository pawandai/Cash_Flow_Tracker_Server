import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { ApolloServer, BaseContext } from "@apollo/server";
import mergedTypes from "./types";
import mergedResolvers from "./resolvers";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { buildContext } from "graphql-passport";
import { configurePassport } from "./config/passport.config";

export async function GraphQL() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  const SESSION_SECRET = process.env.SESSION_SECRET || "";
  const app = express();
  const httpServer = http.createServer(app);
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("uploads"));

  const MongoDBStore = connectMongo(session);

  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
  });

  store.on("error", (error) => console.log(error));

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
      },
      store: store,
    })
  );

  configurePassport();

  app.use(passport.initialize());
  app.use(passport.session());

  const graphQLServer = new ApolloServer<BaseContext>({
    typeDefs: mergedTypes,
    resolvers: mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await graphQLServer.start();

  app.use(
    "/api",
    expressMiddleware(graphQLServer, {
      context: async ({ req, res }) => buildContext({ req, res }),
    })
  );

  return app;
}
