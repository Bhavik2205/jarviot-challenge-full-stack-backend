import { google } from "googleapis";
import express from "express";
import token from "./routes/token.route.js";
import "./node_modules/dotenv/config.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

app.use(cookieParser())

app.use("/", token);
// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
// );

// const drive = google.drive({
//     version: 'v2',
//     auth: oauth2Client
// });

// app.get("/auth/google", (req, res) => {
//     const url = oauth2Client.generateAuthUrl({
//         access_type: "offline",
//         scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/drive.metadata.readonly"],
//     });
//     res.redirect(url);
// });

// app.get("/google/redirect", async(req, res) => {
//     const {code}  = req.query;
//     const {tokens} = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     console.log(code);
//     const drive = google.drive({ version: 'v3', auth: oauth2Client });
// // Retrieve the list of files and folders

// let pageToken = null;
// let allFiles = [];

// do {
//   const response = await drive.files.list({
//     pageSize: 1000, // Set the page size as per your requirement
//     pageToken: pageToken,
//     fields: 'nextPageToken, files(id, name, owners, shared, webViewLink, permissions)',
//     includeItemsFromAllDrives: true,
//     supportsAllDrives: true, // Specify the fields you need
//   });

//   const files = response.data.files;
//   allFiles = allFiles.concat(files);

//   pageToken = response.data.nextPageToken;
// } while (pageToken);
// console.log(allFiles.length)
// let publicFiles = [];
//     let peopleWithAccess = new Set();
//     let externallyShared = [];

//     allFiles.forEach((file) => {
//       const shared = file.shared;
//       const permissions = file.permissions;

//       if (shared && shared.publiclyAccessible) {
//         publicFiles.push(file);
//       } else if (permissions && permissions.length > 0) {
//         permissions.forEach((permission) => {
//           if (permission.emailAddress) {
//             peopleWithAccess.add(permission.emailAddress);
//           }
//         });
//       } else {
//         externallyShared.push(file);
//       }
//     });

//     console.log('Public Files:', publicFiles);
//     console.log('People with Access:', peopleWithAccess);
//     console.log('Externally Shared:', externallyShared);
// })

const PORT = process.env.PORT || 4000;

app.listen(4000);
mongoose.connect(process.env.MONGO_DB).then(() => {
        console.log("Connected to Database");
        console.log(`Server is Running on ${PORT}`);
}).catch((err) => {
    console.log({Error: err});
})