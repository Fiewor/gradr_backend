const fs = require("fs");
const path = require("path");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fileToGenerativePart = require("./fileToGenerativePart");
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const downloadFilesToLocal = require("./downloadFilesToLocal");
const getFilesInFolder = require("./getFilesInFolder");
const downloadFromCloudStorage = require("./downloadFromCloudStorage");

const options = {
  // withFileTypes: true,
};

const bucketName = process.env.BUCKET_NAME || "abdulsalam";
const folderName = process.env.FOLDER_NAME || "Students_Answer_sheets";

async function readFolderContent(folder) {
  const answerFolder = path.join(__dirname, "../answers");

  const filesInFolder = await getFilesInFolder(bucketName, folderName);

  if (filesInFolder?.length) {
    // {FOLDER_NAME}/student_answer_2.jpg
    filesInFolder?.map(({ url, signedUrl, fileName }) => {
      console.log("fileName: ", fileName);
      // const uri = `gs://${bucketName}/${fileName}`;
      const strippedName = fileName.split("/").at(-1);
      // console.log("strippedName: ", strippedName);
      const location = "answers";
      const dir = path.join(__dirname, `../${location}`);
      const filePath = `${dir}/${strippedName}`;

      downloadFromCloudStorage(bucketName, fileName, filePath);
    });

    const data = fs
      .readdirSync(answerFolder, options, (err, files) => {
        console.log("files: ", files);
        return files;
      })
      .filter((files) => files !== ".gitkeep")
      .map((files) => {
        const filePath = path.join(answerFolder, files);
        console.log("filePath: ", filePath);
        return fileToGenerativePart(filePath, "image", "image/jpeg");
      });

    console.log("data: ", data);

    const prompt = "What is the text contained in this image?";

    if (!data?.length) {
      return { error: true, message: "No data for vision model to use." };
    }
    const readContent = await Promise.all(
      data.map(async (singleData) => {
        const result = await visionModel.generateContent([prompt, singleData]);
        const response = result.response;
        return response.text();
      })
    );
    console.log("readContent: ", readContent);
    return readContent;
  } else {
    return { error: true, message: "Folder doesn't exist" };
  }
}

module.exports = readFolderContent;
