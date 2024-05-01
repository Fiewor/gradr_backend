const Uploader = require("../services/upload2Cloud");
const { grade } = require("../services/grade");

const bucketName = process.env.BUCKET_NAME || "abdulsalam";

// Upload single file
exports.uploadAndGrade = async (req, res) => {
  try {
    const { marks } = req.body;
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
    const studentAnswersUrl = "C:/Users/JFiewor/Downloads/gradr/answer_sheets";

    const result = await grade(questionUrl, guideUrl, studentAnswersUrl, marks);

    console.log("result: ", result);
    res.status(200).json({
      status: "success",
      message: "Grading successful.",
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred.",
    });
  }
};
