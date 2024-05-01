const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const projectId = process.env.PROJECT_ID;
const keyFilename = process.env.KEYFILENAME; // The json file for the cloud keys

const storage = new Storage({ projectId, keyFilename });

// Upload a file to Google Cloud Storage
exports.googleCloudUploader = async (bucketName, file, fileOutputName) => {
  try {
    // Get a reference to the specified bucket
    const bucket = storage.bucket(bucketName);

    // Upload the specified file to the bucket with the given destination name
    const [fileUpload] = await bucket.upload(file, {
      destination: fileOutputName,
    });

    // Get the authenticated URL for the uploaded file
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // URL expires in 24 hour
    });

    return url;
  } catch (error) {
    console.error("Error:", error);
  }
};
