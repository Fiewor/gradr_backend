// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, type, mimeType = "image/png") {
  return {
    inlineData: {
      // was using `Buffer.from(fs.readFileSync(path)).toString("base64")` when passing file path of images, but since i'm passing base64 for pdf, decided to pass base64 for images too
      data: path, //cause i'm passing the base64string directly.
      mimeType,
    },
  };
}

module.exports = fileToGenerativePart;
