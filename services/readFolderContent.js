const fs = require("fs");
const path = require("path");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fileToGenerativePart = require("./fileToGenerativePart");
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

const options = {
  // withFileTypes: true,
};

async function readFolderContent(folder) {
  const expectedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

  if (fs.existsSync(folder)) {
    const data = fs
      .readdirSync(folder, options, (err, files) => files)
      .map((files) => {
        const filePath = path.join(folder, files);
        return fileToGenerativePart(filePath, "image", "image/jpeg");
      });

    const prompt = "What is the text contained in this image?";
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
