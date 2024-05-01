const fs = require("fs");

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, type, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

module.exports = fileToGenerativePart;
