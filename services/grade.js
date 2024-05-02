const { GoogleGenerativeAI } = require("@google/generative-ai");
const WordExtractor = require("word-extractor");
const getOnlineAnswers = require("./getOnlineAnswers");
const downloadFilesToLocal = require("./downloadFilesToLocal");
const readFolderContent = require("./readFolderContent");
const { formulateGradingPrompt } = require("./formulateGradingPrompt");

async function grade(
  questionUrl,
  guideUrl,
  answersFolder,
  marksAttainable = 0,
  dependencyLevel = 0,
  extraPrompt = ""
) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
  const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

  let questionPath = "",
    guidePath = "";

  const fetchQuestion = await downloadFilesToLocal(questionUrl, "question");
  if (fetchQuestion?.status === "success") {
    questionPath = fetchQuestion?.path;
  }

  const fetchGuide = await downloadFilesToLocal(guideUrl, "guide");
  if (fetchGuide?.status === "success") {
    guidePath = fetchGuide?.path;
  }

  let question = "",
    guide = "";

  const extractor = new WordExtractor();
  if (questionPath) {
    const questionData = await extractor.extract(questionPath);
    question = questionData.getBody();
  }

  if (guidePath) {
    const guideData = await extractor.extract(guidePath);
    guide = guideData.getBody();
  }

  const onlineAnswers = await getOnlineAnswers(question);
  const studentAnswers = await readFolderContent(answersFolder);

  if (studentAnswers.error || !studentAnswers?.length) {
    return { status: "error", message: "No student answer to grade." };
  }

  const responses = await Promise.allSettled(
    studentAnswers.map(async (answer) => {
      if (question && guide && onlineAnswers) {
        const gradingPrompt = formulateGradingPrompt(
          question,
          guide,
          answer,
          onlineAnswers,
          marksAttainable,
          dependencyLevel,
          extraPrompt
        );

        const result = await textModel.generateContent(gradingPrompt);
        const response = result.response;
        console.log("output of grading: ", response.text());
        return response.text();
      } else {
        return { status: "error", message: "One or more parameters are falsy" };
      }
    })
  );

  const data = {
    question,
    markingGuide: guide,
    gradingReponse: responses,
  };

  return { status: "success", data };
}

module.exports = {
  grade,
};
