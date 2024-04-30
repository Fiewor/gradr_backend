const fs = require("fs");
const https = require("https");
const dir = "C:/Users/JFiewor/Downloads/gradr/files"; // Change this to more generic location

const downloadFilesToLocal = (url, localFileName) => {
  return new Promise((resolve, reject) => {
    console.log(`--- Downloading file to local directory from: ${url}`);
    const request = https.request(url, (res) => {
      if (res.statusCode !== 200) {
        console.log(
          `Download sample file failed. Status code: ${res.statusCode}, Message: ${res.statusMessage}`
        );
        reject();
      }
      var data = [];
      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        console.log("   ... Downloaded successfully");
        fs.writeFileSync(`${dir}/${localFileName}.docx`, Buffer.concat(data));
        resolve({
          status: "success",
          message: "Download successful.",
          path: `${dir}/${localFileName}.docx`,
        });
      });
    });
    request.on("error", function (e) {
      console.log(e.message);
      reject({ status: "error", message: e.message });
    });
    request.end();
  });
};

module.exports = downloadFilesToLocal;
