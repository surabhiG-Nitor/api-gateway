import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import proxy from "express-http-proxy";
import http from "http";
import morgan from "morgan";
import config from "./utils/config";

const app = express();

// logger
app.use(morgan("dev"));

// 3rd party middleware
// app.use(cors({
// 	exposedHeaders: config.corsHeaders
// }));

app.use(bodyParser.json({
    limit: "100kb"
}));

app.use("/api", proxy("http://localhost:3000")); // this will proxy all incoming requests to /api route to back end

app.listen(config.port, () => {
    // console.log("server started on port ", config.port);
});
