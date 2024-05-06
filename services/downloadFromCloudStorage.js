const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const downloadFromCloudStorage = async (bucketName, fileName, destPath) => {
  const storage = new Storage();
  const options = {
    destination: destPath,
  };

  // Downloads the file to the destination file path
  await storage.bucket(bucketName).file(fileName).download(options);

  console.log(`gs://${bucketName}/${fileName} downloaded to ${destPath}.`);
};

module.exports = downloadFromCloudStorage;
