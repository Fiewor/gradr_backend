const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getOnlineAnswers(question) {
  const prompt = `You're a helpful search engine. 
  Find the right answers to the question: ${question}. 
  Provide links to references where possible. 
  Ignore any mention of Question number and/or marks/points.`;

  const result = await textModel.generateContent(prompt);
  const response = result.response;
  return response.text();
}

module.exports = getOnlineAnswers;
