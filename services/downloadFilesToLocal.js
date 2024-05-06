const fs = require("fs");
const https = require("https");
const path = require("path");

const downloadFilesToLocal = async (url, location, localFileName, type) => {
  const dir = path.join(__dirname, `../${location}`);
  // const filePath = `${dir}/${localFileName}`;
  return new Promise((resolve, reject) => {
    const request = https.request(url, (res) => {
      if (res.statusCode !== 200) {
        console.log(
          `Download sample file failed. Status code: ${res.statusCode}, Message: ${res.statusMessage}`
        );
        reject();
      }
      let data = [];
      res.on("data", (chunk) => {
        // if (type === "image") data.push(Buffer.from(chunk, "binary"));
        // else
        data.push(chunk);
      });

      res.on("end", () => {
        console.log("   ... Downloaded successfully");
        fs.writeFileSync(`${dir}/${localFileName}`, Buffer.concat(data));
        resolve({
          status: "success",
          message: "Download successful.",
          path: `${dir}/${localFileName}`,
        });
      });
    });
    request.on("error", function (e) {
      console.log("error(download): ", e);
      reject({ status: "error", message: e?.message });
    });
    request.end();
  });
};

module.exports = downloadFilesToLocal;
