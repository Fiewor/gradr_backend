const multer = require("multer");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer middleware with the defined storage settings
const upload = multer({ storage: storage }).single("file");

// Middleware to handle file upload
exports.handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(500).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading
      return res
        .status(500)
        .json({ error: "An error occurred while uploading the file." });
    }
    // No errors, proceed to the next middleware or route handler
    next();
  });
};
