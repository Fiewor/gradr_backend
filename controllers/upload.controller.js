const Uploader = require("../services/upload2Cloud");
const { grade } = require("./grade.controller");

const bucketName = process.env.BUCKET_NAME || "abdulsalam";

// Upload single file
exports.uploadAndGrade = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.files) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    let urls = new Map();

    const files = Object.values(req.files); // Convert to array
    await Promise.all(
      files.map(async (element) => {
        const filePath = element[0].path;
        const filename = element[0].fieldname;
        console.log("filePath", filePath);
        const url = await Uploader.googleCloudUploader(
          bucketName,
          filePath,
          `testupload-${filename + Date.now()}.txt`
        );
        urls.set(filename, url);
      })
    );

    const questionUrl = urls.get("file1");
    const guideUrl = urls.get("file2");

    //Issue here
    console.log(questionUrl);
    const result = await grade(questionUrl, guideUrl);

    console.log(result);
    res
      .status(200)
      .json({ message: "File uploaded to Google Cloud Storage successfully." });
  } catch (error) {
    console.error("Error uploading file to Google Cloud Storage:", error);
    res.status(500).json({
      error:
        "An error occurred while uploading the file to Google Cloud Storage.",
    });
  }
};
