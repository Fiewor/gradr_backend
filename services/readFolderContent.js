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
// this function is meant to do 4 things:
// 1. download files from a folder in a google cloud bucket (working)
// 2. store those files in the "answers" folder on the server (working)
// 3. read the files in the folder immediately they are available (not working as expected)
// 4. use gemini vision to read the text in each file (working)

async function readFolderContent() {
  const answerFolder = path.join(__dirname, "../answers");

  const filesInFolder = await getFilesInFolder(bucketName, folderName);

  if (filesInFolder?.length) {
    // {FOLDER_NAME}/{FILE_NAME}
    filesInFolder?.map(({ url, signedUrl, fileName }) => {
      const strippedName = fileName.split("/").at(-1);
      const location = "answers";
      const dir = path.join(__dirname, `../${location}`);
      const filePath = `${dir}/${strippedName}`;

      downloadFromCloudStorage(bucketName, fileName, filePath);
    });
  }

  let files = [];

  try {
    files = await readdir(answerFolder);
  } catch (error) {
    console.error(error);
  }

  if (!files?.length) {
    return { error: true, message: "No files" };
  }

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

  // [
  //    {
  //      url: 'https://storage.cloud.google.com/grdr/answer_sheets/student_answer_1.jpg',
  //      readContent: ' A hypothesis is a prediction that can be tested like "if I drop this ball, it will fall."\n' +
  //                   'A theory, on the other hand, is a well-substantiated explanation for a set of phenomena, like the theory of gravity. A hypothesis is like a guess, while a theory is a conclusion based on evidence. For example, the theory of evolution explains how species change over time, while a hypothesis might predict how a specific species will adapt to its environment.'
  //    },
  // ]
  const res = [];

  if (!filesInFolder.error) {
    // assuming each file in filesInFolder get read by the ai, this should work:
    for (let i = 0; i < filesInFolder.length; i++) {
      const text = readContent[i];
      const { url } = filesInFolder[i];
      res.push({ url, text });
    }
  }

  console.log("res: ", res);
  return res;
}

module.exports = readFolderContent;
