import { google } from "googleapis";
import Token from "../models/token.model.js";
import "../node_modules/dotenv/config.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const drive = google.drive({
  version: "v2",
  auth: oauth2Client,
});

export const Auth = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "email"
      ],
    });
    // console.log(url.code)
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const Redirect = async (req, res) => {
  try {
    const { code } = req.query;
    // console.log(code)
    const { tokens } = await oauth2Client.getToken(code);
    
    // oauth2Client.setCredentials(tokens);
    console.log(tokens);
    const OAUTH = new google.auth.OAuth2(tokens);
    OAUTH.setCredentials(tokens)
    const { data } = await OAUTH.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        method: 'GET',
    });
    const email = data.email;
    let token = await Token.findOne({email: email, status: "Active"});
    if(token){
        await Token.findByIdAndUpdate(token._id, {token: tokens.access_token, updated_at: Date.now()});
    } else if(!token) {
        await Token.create({email: email, token: tokens.access_token, status: "Active"});
    }
    console.log(data)
    res.cookie(`access_token_${email}`, tokens.access_token, { httpOnly: true });
    console.log("Cookie created Successfully")
    console.log("Loading...")

    // res.redirect(`http://localhost:4000/analytics?code=${code}`)
    const drive = google.drive({ version: "v3", auth: OAUTH });
    // Retrieve the list of files and folders

    let pageToken = null;
    let allFiles = [];

    do {
      const response = await drive.files.list({
        pageSize: 500, // Set the page size as per your requirement
        pageToken: pageToken,
        fields:
          "nextPageToken, files(id, name, owners, shared, webViewLink, permissions)",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true, // Specify the fields you need
      });

      const files = response.data.files;
      allFiles = allFiles.concat(files);

      pageToken = response.data.nextPageToken;
    } while (pageToken);
    console.log(allFiles.length);
    let publicFiles = [];
    let peopleWithAccess = new Set();
    let externallyShared = [];

    
  
    let riskScore = 0;
    allFiles.forEach((file) => {
        
      const shared = file.shared;
      const permissions = file.permissions;
      const owners = file.owners;

      console.log(typeof(owners))
      console.log(typeof(permissions))
      
      let creators = [];
      if(typeof(owners) === "object"){
          owners.forEach((owner) => {

                const owners = {
                    name: owner.displayName,
                    email: owner.emailAddress
                }
                creators.push(owners)
              // console.log(owner.emailAddress)
            // console.log("owners")
            // console.log(owners)
          })  
      }

      let sharedWith = [];
      if(typeof(permissions) === 'object'){
          permissions.forEach((permission) => {

            if(permission.displayName && permission.emailAddress){
                const share = {
                    name: permission.displayName,
                    email: permission.emailAddress
                }
                sharedWith.push(share);
            }
  
            //   console.log("share")
            //   console.log(share)
          })
      }
        // owners.forEach((owner) => {
        //     const owners = {
        //         name: owner.displayName,
        //         email: owner.emailAddress
        //     }
        //     creators.push(owners);
        // })
       if (permissions && permissions.length > 0) {
        permissions.forEach((permission) => {
            if(permission.type === 'anyone' && permission.role === 'reader'){
                const newFile = {
                    type: "Public File",
                    fileName: file.name,
                    webViewLink: file.webViewLink,
                    accessSetting: "Anyone with Link",
                    sharedWith: sharedWith,
                    createdBy: creators,    
                }
                console.log(newFile)
                publicFiles.push(newFile);
                riskScore += 20;
            }else if(permission.type === 'domain' || (permission.type === 'user' && permission.emailAddress != email && permission.role === 'writer')){
                const newFile = {
                    type: "Externally Shared",
                    fileName: file.name,
                    webViewLink: file.webViewLink,
                    accessSetting: "Files shared Externally",
                    sharedWith: sharedWith,
                    createdBy: creators,    
                }
                console.log(newFile)
                externallyShared.push(newFile);
                peopleWithAccess.add(permission.emailAddress);
                riskScore += 10;
            }
        //   if (permission.emailAddress) {
        //     peopleWithAccess.add(permission.emailAddress);
        //     riskScore += 5;
        //   }
        });
      }
    //    else {
    //     externallyShared.push(file);
    //   }
    });
    let finalData = []
    finalData.push({externallyShared: externallyShared.length});
    finalData.push({publicFiles: publicFiles.length});
    finalData.push({peopleWithAccess: peopleWithAccess.size});

    const maxPossibleRiskScore = allFiles.length * 10;
    const cs = (riskScore / maxPossibleRiskScore) * 100;
    const correctScore = (Math.min(Math.max(cs, 0), 100)).toFixed(0);
    // const aggregateRiskScore = calculateAggregateRiskScore(allFiles);
    finalData.push({RiskScore: correctScore});
    finalData.push({PublicFiles: publicFiles});
    finalData.push({ExternallyShared: externallyShared});
    // console.log("Public Files:", publicFiles.length);
    // console.log("People with Access:", peopleWithAccess.size);
    // console.log("Externally Shared:", externallyShared.length);
    res
      .status(200)
      .json(
        finalData
      );
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

// export const Analytics = async(req, res) => {
//     try {
//         const {code} = req.query;
//         const { tokens } = await oauth2Client.getToken(code);
        
//         // oauth2Client.setCredentials(tokens);
//         console.log(tokens);
//         const OAUTH = new google.auth.OAuth2(tokens);
//         OAUTH.setCredentials(tokens)
//         const drive = google.drive({ version: "v3", auth: OAUTH });
//     // Retrieve the list of files and folders

//     let pageToken = null;
//     let allFiles = [];

//     do {
//       const response = await drive.files.list({
//         pageSize: 1000, // Set the page size as per your requirement
//         pageToken: pageToken,
//         fields:
//           "nextPageToken, files(id, name, owners, shared, webViewLink, permissions)",
//         includeItemsFromAllDrives: true,
//         supportsAllDrives: true, // Specify the fields you need
//       });

//       const files = response.data.files;
//       allFiles = allFiles.concat(files);

//       pageToken = response.data.nextPageToken;
//     } while (pageToken);
//     console.log(allFiles.length);
//     let publicFiles = [];
//     let peopleWithAccess = new Set();
//     let externallyShared = [];

//     // allFiles.forEach((file) => {
//     //   const shared = file.shared;
//     //   const permissions = file.permissions;

//     //   if (shared && shared.publiclyAccessible) {
//     //     publicFiles.push(file);
//     //   } else if (permissions && permissions.length > 0) {
//     //     permissions.forEach((permission) => {
//     //       if (permission.emailAddress) {
//     //         peopleWithAccess.add(permission.emailAddress);
//     //       }
//     //     });
//     //   } else {
//     //     externallyShared.push(file);
//     //   }
//     // });

//     console.log("Public Files:", publicFiles.length);
//     console.log("People with Access:", peopleWithAccess.size);
//     console.log("Externally Shared:", externallyShared.length);
//     res
//       .status(200)
//       .json(
//         allFiles.length
//       );
//     } catch (error) {
//         res.status(500).json({error: error.message})
//     }
// }

export const RevokeAccess = async(req, res) => {
    try {
        var email = req.params.email;
        var accessToken = req.cookies[`access_token_${email}`];
        console.log(accessToken)
        if(accessToken) {
            await oauth2Client.revokeToken(accessToken).then(async() => {
                res.clearCookie(`access_token_${email}`);
                let token = await Token.findOne({email: email, status: "Active"});
            if(!token) {
                res.status(404).json({message: "Access already revoked"});
            } else if(token){
                    Token.findByIdAndUpdate(token._id, {status: "Inactive", updated_at: Date.now()}).then((result) => {
                        res.status(200).json("Access Revoked Successfully")
                    }).catch((err) => {
                        res.status(500).json({error: "Something went wrong"})
                    })
                
            }
                // res.send("Access Revoked Successfully")
            })
        } else {
            let token = await Token.findOne({email: email, status: "Active"});
            if(!token) {
                res.status(404).json({message: "Access already revoked"});
            } else if(token){
                await oauth2Client.revokeToken(token).then(() => {
                    Token.findByIdAndUpdate(token._id, {status: "Inactive", updated_at: Date.now()}).then((result) => {
                        res.status(200).json("Access Revoked Successfully")
                    }).catch((err) => {
                        res.status(500).json({error: "Something went wrong"})
                    })
                })
            }
            // res.send("No account found")
        }
    } catch (error) {
        if(error.message === "invalid_token"){
            let email = req.params.email;
            let tokenSet = await Token.findOneAndUpdate({email: email, status: "Inactive", updated_at: Date.now()});
        }
        res.status(500).json({error: error.message});
    }
}