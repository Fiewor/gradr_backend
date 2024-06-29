const { GoogleGenerativeAI } = require("@google/generative-ai");
const WordExtractor = require("word-extractor");
const getOnlineAnswers = require("./getOnlineAnswers");
const downloadFilesToLocal = require("./downloadFilesToLocal");
const readFolderContent = require("./readFolderContent");
const { formulateGradingPrompt } = require("./formulateGradingPrompt");
const { GoogleAIFileManager } = require("@google/generative-ai/files");
const { splitConvertRead } = require("./splitConvertRead");

const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
// const fileManager = new GoogleAIFileManager(process.env.GOOGLEAI_API_KEY);

async function grade(
  questionUrl,
  guideUrl,
  marksAttainable = 0,
  dependencyLevel = 0,
  extraPrompt = "",
  questionExtension = ".pdf",
  guideExtension = ".pdf"
) {
  let questionPath = "",
    guidePath = "";

  const fetchQuestion = await downloadFilesToLocal(
    questionUrl,
    "files",
    `question${questionExtension}`,
    "document"
  );
  if (fetchQuestion?.status === "success") {
    questionPath = fetchQuestion?.path;
  }

  const fetchGuide = await downloadFilesToLocal(
    guideUrl,
    "files",
    `guide${guideExtension}`,
    "document"
  );

  if (fetchGuide?.status === "success") {
    guidePath = fetchGuide?.path;
  }

  let question = "",
    guide = "";

  console.log("questionPath: ", questionPath);

  if (questionPath) {
    if (questionExtension === ".docx") {
      const extractor = new WordExtractor();
      const questionData = await extractor.extract(questionPath);
      question = questionData.getBody();
    } else {
      // question is a .pdf, read using AI instead of with word extractor
      question = await splitConvertRead(questionPath);
    }
  }

  if (guidePath) {
    if (guideExtension === ".docx") {
      const guideData = await extractor.extract(guidePath);
      guide = guideData.getBody();
    } else {
      guide = await splitConvertRead(guidePath);
    }
  }

  console.log("question: ", question);

  const onlineAnswers = await getOnlineAnswers(question);
  console.log("onlineAnswers: ", onlineAnswers);

  const systemInstruction = `You are a university lecturer. \
      You receive a student's answers to question: ${question} and you score the student out of the maximum attainable marks: ${marksAttainable} \
      You have the right answers to the question: ${onlineAnswers}. The prompt will instruct you on whether to use these right answers ot not. \
      You have a marking guide: ${guide} that instructs you on how to allocate marks for the question. \
      Feel free to reference the marking guide but do not include/repeat it in the response. \
      You response must be a JSON object with the following schema: \
      - score: score gotten by the student / total attainable marks \
      - explanation: the justification for the score given to the student. Explain your reasoning step-by-step. \
      - feedback: feedback on the student's overall performing stating areas for improvement (if any) \
      If the response contains control characters such as '\n' (new line character), be sure to escape them with a backslash (). \
      `;

  const textModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0,
      topP: 0.5,
      topK: 1,
      responseMimeType: "application/json",
    },
    systemInstruction: {
      role: "system",
      parts: [
        {
          text: systemInstruction,
        },
      ],
    },
  });

  const folderContent = await readFolderContent();

  if (folderContent?.error || !folderContent?.length) {
    return { status: "error", message: "No student answer to grade." };
  }

  const responses = await Promise.allSettled(
    // go through all the student's answers
    folderContent.map(async ({ text: studentAnswer }) => {
      if (question && guide && onlineAnswers) {
        // generate prompt
        const gradingPrompt = formulateGradingPrompt(
          studentAnswer,
          dependencyLevel,
          extraPrompt
        );

        // grade
        const result = await textModel.generateContent(gradingPrompt);
        const response = result.response;
        console.log("output of grading: ", response.text());
        return response.text();
      } else {
        return {
          status: "error",
          message: "One or more parameters are falsy",
        };
      }
    })
  );

  const data = {
    question,
    markingGuide: guide,
    gradingResponse: responses,
    onlineAnswers: onlineAnswers,
    answerFilesUrls: folderContent.map(({ url }) => url),
  };

  return { status: "success", data };
}

module.exports = {
  grade,
};
