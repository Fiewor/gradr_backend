const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");
const apikeys = require("../apikeys.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// A Function that can provide access to google drive api
async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}

const testFile = path.resolve(__dirname, "../gradr.txt");

// A Function that will upload the desired file to google drive folder
async function googleDriveUploader(authClient) {
  return new Promise((resolve, rejected) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetaData = {
      name: "gradr.txt",
      parents: ["1-W7XtLNU3BNrdCZW70dPfhQ79taXfuV2"], // A folder ID to which file will get uploaded
    };

    drive.files.create(
      {
        resource: fileMetaData,
        media: {
          body: fs.createReadStream(testFile), // files that will get uploaded
          mimeType: "text/plain",
        },
        fields: "id",
      },
      function (error, file) {
        if (error) {
          return rejected(error);
        }
        resolve(file);
      }
    );
  });
}

// authorize().then(googleDriveUploader).catch("error", console.error()); // function call
