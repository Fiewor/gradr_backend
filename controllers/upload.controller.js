const Uploader = require("../services/upload2Cloud");
const { grade } = require("../services/grade");

const bucketName = process.env.BUCKET_NAME || "abdulsalam";
const folderName = process.env.FOLDER_NAME || "Students_Answer_sheets";

// Upload single file
exports.uploadAndGrade = async (req, res) => {
  try {
    const { marks, dependencyLevel, extraPrompt } = req.body;
    // Check if a file was uploaded
    if (!req.files) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    let urls = new Map();

    const files = Object.values(req.files); // Convert to array

    const re = await Promise.all(
      files.map(async (element) => {
        const filePath = element[0].path;
        const filename = element[0].fieldname;
        const url = await Uploader.googleCloudUploader(
          bucketName,
          filePath,
          `testupload-${filename + Date.now()}.txt`
        );
        urls.set(filename, url);
        return { filename, url };
      })
    );

    console.log("call to cloudUploader: ", re);

    const questionUrl = urls.get("file1");
    const guideUrl = urls.get("file2");

    if (questionUrl && guideUrl) {
      const studentAnswersUrl = `https://storage.googleapis.com/${bucketName}/${folderName}/`;
      console.log("studentAnswersUrl: ", studentAnswersUrl);

      const result = await grade(
        questionUrl,
        guideUrl,
        studentAnswersUrl,
        marks,
        dependencyLevel,
        extraPrompt
      );

      if (result?.status === "success") {
        const { data } = result;
        res.status(200).json({
          status: "success",
          message: "Grading successful.",
          data,
        });
      }
    } else {
      console.log("questionUrl: ", questionUrl);
      console.log("guideUrl: ", guideUrl);
      res.status(500).json({
        error: "Unable to get urls",
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
