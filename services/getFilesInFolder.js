const { Storage } = require("@google-cloud/storage");
const storage = new Storage();

async function getFilesInFolder(bucket, folder) {
  try {
    // Get a list of files in the specified folder
    const [files] = await storage.bucket(bucket).getFiles({
      prefix: folder + "/", // Include the folder path as prefix
    });

    if (!files.length) {
      return { error: true, message: "No file in folder(bucket)" };
    } else {
      // Extract URLs of all files
      const fileUrls = Promise.all(
        files?.map(async (file) => {
          const signedUrl = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 2 * 30 * 24 * 60 * 60 * 1000, // URL expires in 2 months
          });

          return {
            url: `https://storage.cloud.google.com/${bucket}/${file.name}`,
            signedUrl,
            fileName: file.name,
          };
        })
      );

      const res = await fileUrls;

      // Return the array of file URLs (except the first which is the folder)
      return res?.slice(1);
    }
  } catch (err) {
    console.error("Error getting files:", err);
    return [];
  }
}

module.exports = getFilesInFolder;
