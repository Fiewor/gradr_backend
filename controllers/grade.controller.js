const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const fileToGenerativePart = require("../services/fileToGenerativePart");

const WordExtractor = require("word-extractor");

async function grade(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

  const options = {
    // withFileTypes: true,
  };

  // for answer sheets
  const answersFolder = "C:/Users/JFiewor/Downloads/gradr/answer_sheets";

  const questionPath =
    "C:/Users/JFiewor/Downloads/gradr/lecturer_upload/question.docx";
  const guidePath =
    "C:/Users/JFiewor/Downloads/gradr/lecturer_upload/guide.docx";

  const extractor = new WordExtractor();
  const questionData = await extractor.extract(questionPath);
  const guideData = await extractor.extract(guidePath);

  const question = questionData.getBody();
  const guide = guideData.getBody();

  async function getAnswers(question) {
    const prompt = `Find the right answers to the question: ${question}. Provide links to references where possible. Ignore any mention of Question number and/or marks/points.`;

    const result = await textModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  const onlineAnswers = await getAnswers(question);

  async function readFolderContent(folder) {
    const expectedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    if (fs.existsSync(folder)) {
      const data = fs
        .readdirSync(folder, options, (err, files) => files)
        .map((files) => {
          const filePath = path.join(folder, files);
          return fileToGenerativePart(filePath, "image/jpeg");
        });

      const prompt = "What is the text contained in this image?";
      const result = await visionModel.generateContent([prompt, ...data]);
      const response = result.response;
      return response.text();
    } else {
      return { error: true, message: "Folder doesn't exist" };
    }
  }

  const studentAnswer = await readFolderContent(answersFolder);

  if (question && guide && studentAnswer) {
    const gradingPrompt = `You are a university lecturer who is grading a student's answers to a question: ${question}.
  You have a marking guide ${guide} that instructs you on how to allocate marks, and the sum of each major bullet points gives you the total number of marks to be allocated.
  Here is the student's answer to the question: ${studentAnswer}.
  Assess the student's answer based on the guide instructions here: ${guide} and the online answers here: ${onlineAnswers} and give the student a grade.
  Also provide feedback on the student's performance noting areas for improvement. Start this feedback on a new line with the sentence 'Here is some feedback: '`;

    const result = await textModel.generateContent(gradingPrompt);
    const response = result.response;
    console.log("output of grading: ", response.text());

    res.status(200).send({
      success: true,
      data: {
        question: question,
        markingGuide: guide,
        gradingReponse: response.text(),
      },
    });
  } else {
    console.log("One or more parameters are falsy");
  }
}

module.exports = {
  grade,
};
