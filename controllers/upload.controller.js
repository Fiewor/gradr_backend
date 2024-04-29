const Uploader = require("../services/upload2Cloud");

const bucketName = process.env.BUCKET_NAME || "abdulsalam";

// Upload single file
exports.upload = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path

    // Upload the file to Google Cloud Storage
    await Uploader.googleCloudUploader(bucketName, filePath, "testupload3.txt");

    res
      .status(200)
      .json({ message: "File uploaded to Google Cloud Storage successfully." });
  } catch (error) {
    console.error("Error uploading file to Google Cloud Storage:", error);
    res
      .status(500)
      .json({
        error:
          "An error occurred while uploading the file to Google Cloud Storage.",
      });
  }
};
