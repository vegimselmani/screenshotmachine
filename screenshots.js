var screenshotMachine = require("screenshotmachine");
var websiteInfos = require("./links.json");
const { google } = require("googleapis");
const path = require("path");
var fs = require("fs");

var costumerKey = "66d08c";
const CLIENT_ID = "64478677424-ojphh5n8ukpqqm178afn3jmqs1njvomc.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = "1//04GqbupYwEnEXCgYIARAAGAQSNwF-L9IrFBK7GFxT1K4J5vxbs2YyN8Bb-_ToD3vZXylX_R8c2124x81sBqVsoberNz8Yn7HQr1c";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

for (let i = 0; i < websiteInfos.length; i++) {
  secretPhrase = "";
  options = {
    url: websiteInfos[i].website,
    height: "1080",
    width: "1920",
    device: "desktop",
    format: "jpg",
  };

  var apiUrl = screenshotMachine.generateScreenshotApiUrl(
    costumerKey,
    secretPhrase,
    options
  );
  var output = `outputs/${websiteInfos[i].id}_${websiteInfos[i].name}.jpg`;
  screenshotMachine.readScreenshot(apiUrl).pipe(
    fs.createWriteStream(output).on("close", function () {
      uploadFile();
    }),
  );

  const filePath = path.join(__dirname, `outputs/${websiteInfos[i].id}_${websiteInfos[i].name}.jpg`);
  async function uploadFile() {
    try {
      //Upload file to Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: `${websiteInfos[i].id}_${websiteInfos[i].name}.jpg`,
          mimeType: "image/jpg",
        },
        media: {
          mimeType: "image/jpg",
          body: fs.createReadStream(filePath),
        },
      });
      //Give Permission to read everyone 
          const id = response.data.id;
          await drive.permissions.create({
            fileId: id,
            requestBody: {
              role: 'reader',
              type:'anyone'
            }
          })
        }catch(err){
          console.log(err)
        }
  }
}
