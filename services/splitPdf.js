const fs = require("node:fs/promises");
const { PDFDocument } = require("pdf-lib");

async function splitPdf(pathToPdf) {
  const docmentAsBytes = await fs.readFile(pathToPdf);

  // Load your PDFDocument
  const pdfDoc = await PDFDocument.load(docmentAsBytes);

  const numberOfPages = pdfDoc.getPages().length;
  console.log(`This PDF has ${numberOfPages} pages`);
  res = [];
  for (let i = 0; i < numberOfPages; i++) {
    // Create a new "sub" document
    const subDocument = await PDFDocument.create();
    // copy the page at current index
    const [copiedPage] = await subDocument.copyPages(pdfDoc, [i]);
    subDocument.addPage(copiedPage);
    const pdfBytes = await subDocument.saveAsBase64();
    console.log("part of pdfBytes: ", pdfBytes.substring(0, 20));
    res.push(pdfBytes);
    // await writePdfBytesToFile(`file-${i + 1}.pdf`, pdfBytes);
  }
  // should be an array of base64 encoded string
  return res;
}

module.exports = {
  splitPdf,
};
