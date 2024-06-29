const fs = require("node:fs/promises");

function writePdfBytesToFile(fileName, pdfBytes) {
  return fs.writeFile(fileName, pdfBytes);
}
