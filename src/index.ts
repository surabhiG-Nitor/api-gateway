import bodyParser from "body-parser";
import { NextFunction } from "connect";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import proxy from "express-http-proxy";
import expressSession from "express-session";
import { access } from "fs";
import http from "http";
import morgan from "morgan";
import passport from "passport";
import {
  BearerStrategy,
  IBearerStrategyOption,
  IBearerStrategyOptionWithRequest,
  IOIDCStrategyOption,
  IOIDCStrategyOptionWithRequest,
  ITokenPayload,
  OIDCStrategy,
  VerifyBearerFunctionWithReq,
  VerifyCallback
} from "passport-azure-ad";
import config from "./utils/config";

const app = express();
// middleware set up start
// logger
const log = morgan("dev");
app.use(log);
app.use(cookieParser());

// session
app.use(
  expressSession({
    resave: true,
    saveUninitialized: false,
    secret: "keyboard cat"
  })
);

// 3rd party middleware
// app.use(cors({
// 	exposedHeaders: config.corsHeaders
// }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// middleware set up end

const oIDCStrategyOptions: IOIDCStrategyOptionWithRequest = {
  allowHttpForRedirectUrl: true,
  responseType: "code",
  // tslint:disable-next-line: object-literal-sort-keys
  responseMode: "query",
  redirectUrl: "http://localhost:60761/signin-oidc1",
  identityMetadata: config.creds.identityMetadata,
  clientID: config.creds.clientID,
  passReqToCallback: true,
  clientSecret: config.creds.clientSecret
};

interface IUser {
  oid: string;
}
const users: IUser[] = [];
const findByOid = (oid: string): IUser => users.find((user) => user.oid === oid);

passport.use(
  new OIDCStrategy(
    oIDCStrategyOptions,

    (req: Request, profile: IUser, done: any) => {
      if (!profile.oid) {
        return done(new Error("No oid found"), null);
      } else {
        const existingUser = findByOid(profile.oid);
        if (existingUser) {
          return done(null, existingUser);
        } else {
          users.push(profile);
          return done(null, profile);
        }
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

app.get(
  "/login",
  passport.authenticate("azuread-openidconnect", { failureRedirect: "/" }),
  (req, res) => {
    // log.info('Login was called in the Sample');
    res.redirect("/");
  }
);

// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
// tslint:disable-next-line: quotemark
app.get(
  "/signin-oidc1",
  (req, res: Response, next) => {
    passport.authenticate("azuread-openidconnect", {
      failureRedirect: "/login-failure"
    })(req, res, next);
  },
  (req, res) => {
    console.log("We received a get return from AzureAD.");
    res.redirect("/ui/home");
  }
);

// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
// tslint:disable-next-line: quotemark
app.post(
  "/signin-oidc1",
  (req, res: Response, next) => {
    passport.authenticate("azuread-openidconnect", {
      failureRedirect: "/login-failure"
    })(req, res, next);
  },
  (req, res) => {
    console.log("We received a post return from AzureAD.");
    res.redirect("/ui/home");
  }
);

const getProxyPathResolverFunction = (prefix: string) => (req: any) => {
  const prefixIndex = req.baseUrl.indexOf(prefix);
  const nextPathIndex = prefixIndex + prefix.length;
  let nextPath = "";
  if (nextPathIndex < req.baseUrl.length) {
    nextPath = req.baseUrl.substring(nextPathIndex);
  }
  const toReturn = req.baseUrl.substring(0, prefixIndex) + nextPath;
  console.log("forwarding to", toReturn);
  return toReturn;
};

const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.use(
  "/ui/*",
  ensureAuthenticated,
  proxy("http://localhost:5000", {
    preserveHostHdr: true,
    proxyReqPathResolver: getProxyPathResolverFunction("/ui")
  })
);

// app.use("/ui/*", proxy("http://localhost:5000"));

app.use(
  "/api/*",
  proxy("http://localhost:3000", {
    proxyReqPathResolver: getProxyPathResolverFunction("/api")
  })
); // this will proxy all incoming requests to /api route to back end

app.listen(config.port, () => {
  console.log("server started on por t ", config.port);
});
