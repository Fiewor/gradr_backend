const { GoogleGenerativeAI } = require("@google/generative-ai");
const WordExtractor = require("word-extractor");
const getOnlineAnswers = require("./getOnlineAnswers");
const downloadFilesToLocal = require("./downloadFilesToLocal");
const readFolderContent = require("./readFolderContent");

function formulateGradingPrompt(
  question,
  guide,
  answer,
  onlineAnswers,
  marksAttainable,
  dependencyLevel,
  extraPrompt
) {
  let dynamicPortion = "";

  switch (dependencyLevel) {
    case 0: // Only internet answers
      dynamicPortion = `Assess the student's answer based solely on the online answers here: ${onlineAnswers} and give the student an appropriate grade.`;
      break;
    case 1: // Both marking guide and internet
      dynamicPortion = `Assess the student's answer based on the guide instructions here: ${guide} and the online answers here: ${onlineAnswers} and give the student an appropriate grade.`;
      break;
    case 2: // Only marking guide
      dynamicPortion = `Assess the student's answer based solely on the marking instructions here: ${guide} and give the student an appropriate grade.`;
      break;
    default:
      dynamicPortion = `Assess the student's answer based on the guide instructions here: ${guide} and the online answers here: ${onlineAnswers} and give the student an appropriate grade.`;
      break;
  }

  const prompt = `You are a university lecturer who is grading a student's answers to a question: ${question}.
        You have a marking guide ${guide} that instructs you on how to allocate marks. Note that the maximum attainable mark is ${marksAttainable}.
        Here is the student's answer to the question: ${answer}.
        ${dynamicPortion}
        ${extraPrompt && `Take note of this: ${extraPrompt}`}
        Also provide feedback on the student's performance noting areas for improvement. Start this feedback on a new line with the sentence 'Here is some feedback: '`;

  return prompt;
}

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
