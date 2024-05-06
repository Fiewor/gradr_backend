const fs = require("fs");
const path = require("path");
const { readdir } = require("node:fs/promises");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fileToGenerativePart = require("./fileToGenerativePart");
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const getFilesInFolder = require("./getFilesInFolder");
const downloadFromCloudStorage = require("./downloadFromCloudStorage");

const bucketName = process.env.BUCKET_NAME || "abdulsalam";
const folderName = process.env.FOLDER_NAME || "Students_Answer_sheets";

async function readFolderContent() {
  const answerFolder = path.join(__dirname, "../answers");

  const filesInFolder = await getFilesInFolder(bucketName, folderName);

  if (filesInFolder?.length) {
    // {FOLDER_NAME}/student_answer_2.jpg
    filesInFolder?.map(({ url, signedUrl, fileName }) => {
      const strippedName = fileName.split("/").at(-1);
      const location = "answers";
      const dir = path.join(__dirname, `../${location}`);
      const filePath = `${dir}/${strippedName}`;

      downloadFromCloudStorage(bucketName, fileName, filePath);
    });
  }

  const files = await readdir(answerFolder);
  const data = files
    .filter((files) => files !== ".gitkeep")
    .map((files) => {
      const filePath = path.join(answerFolder, files);
      return fileToGenerativePart(filePath, "image", "image/jpeg");
    });

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
}

module.exports = readFolderContent;
