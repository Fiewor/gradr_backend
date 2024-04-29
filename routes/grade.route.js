const gradeRouter = require("express").Router();
const gradeController = require("../controllers/grade.controller");
const multer = require("multer");
const upload = multer();

gradeRouter.post("/", upload.array("question", "guide"), gradeController.grade);

module.exports = gradeRouter;
