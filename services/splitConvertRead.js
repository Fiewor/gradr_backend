const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fromBase64 } = require("pdf2pic");
const fileToGenerativePart = require("./fileToGenerativePart");
const { splitPdf } = require("./splitPdf");

const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function splitConvertRead(path) {
  // split PDF
  const base64stringArray = await splitPdf(path);

  // convert to base64
  const res = await Promise.all(
    base64stringArray.map(async (string) => {
      const options = {
        format: "png",
        savePath: "./",
      };
      const convert = fromBase64(string, options);
      const res = await convert(1, { responseType: "base64" });
      return res;
    })
  );

  // read using AI
  const read = await Promise.all(
    res?.map(async ({ base64 }) => {
      const prompt = "What is the text contained in this image?";
      const result = await visionModel.generateContent([
        prompt,
        fileToGenerativePart(base64, "pdf", "image/png"),
      ]);
      const response = result.response;
      return response.text();
    })
  );

  return read.join("\r\n");
}

module.exports = {
  splitConvertRead,
};
