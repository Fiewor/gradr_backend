const { Storage, TransferManager } = require("@google-cloud/storage");

// Creates a client
const storage = new Storage({
  projectId: "gradr-421618",
  keyFilename: "gradrkeys.json",
});

async function downloadFolderFromCloudStorage(bucketName, folderName) {
  // Creates a transfer manager client
  const transferManager = new TransferManager(storage.bucket(bucketName));
  // Downloads the folder
  await transferManager.downloadManyFiles(folderName);

  console.log(`gs://${bucketName}/${folderName} downloaded to ${folderName}.`);
}

module.exports = downloadFolderFromCloudStorage;
