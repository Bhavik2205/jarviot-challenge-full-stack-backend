import express from "express";
import token from "./routes/token.route.js";
import "./node_modules/dotenv/config.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

app.use(cookieParser())

app.use("/", token);

const PORT = process.env.PORT || 4000;

app.listen(4000);
mongoose.connect(process.env.MONGO_DB).then(() => {
        console.log("Connected to Database");
        console.log(`Server is Running on ${PORT}`);
}).catch((err) => {
    console.log({Error: err});
})