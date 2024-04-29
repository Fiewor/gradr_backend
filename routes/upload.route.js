const express = require("express");
const uploadRouter = express.Router();

const uploadController = require("../controllers/upload.controller");
const uploadMiddleware = require("../middlewares/upload.middleware");

uploadRouter.post(
  "/file",
  uploadMiddleware.handleUpload,
  uploadController.upload
);

module.exports = uploadRouter;
