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


async function downloadFolder(folderId, destination) {
  const drive = google.drive({ version: 'v3', auth });
  const files = await drive.files.list({
    pageSize: 100, // adjust page size as needed
    q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
  });

  for (const file of files.data.files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // Recursively download subfolders
      await downloadFolder(file.id, `${destination}/${file.name}`);
    } else {
      // Download individual files
      await downloadFile(drive, file.id, `${destination}/${file.name}`);
    }
  }
}

async function downloadFile(drive, fileId, destinationPath) {
  const dest = fs.createWriteStream(destinationPath);
  await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
    .then((res) => res.data.pipe(dest))
    .catch((err) => console.error('Error downloading file:', err));
  console.log(`Downloaded: ${destinationPath}`);
}


(async () => {
  await downloadFolder("1-W7XtLNU3BNrdCZW70dPfhQ79taXfuV2", )
})()