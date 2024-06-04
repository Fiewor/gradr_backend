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

  const prompt = `You are a university lecturer.
          Your task it to score a student's answers: ${answer} to a question: ${question} out of the maximum attainable marks: ${marksAttainable}.
          You have a marking guide ${guide} that instructs you on how to allocate marks. 

          ${dynamicPortion}
          ${extraPrompt && `Take note of this: ${extraPrompt}`}
          Provide feedback on the student's performance noting areas for improvement.

          Explain your reasoning step-by-step in the "explanation" part of the response. Feel free to reference the marking guide but do not include/repeat it in the response.
          Format your response in JSON like show below:
          {
            \"score\": "{total score} / {marksAttainable}",
            \"explanation\": \"\",
            \"feedback\": \"\",
          }
          Do not inlude '\n' (new line character), '*'(asterisk) or any such special character in the response. 

          Here is an example response:
          {
            "score": "17/20",
            "explanation": "The student nailed all the points as specified in the marking guide.",
            "feedback": "There is room for improvement"
          }
          `;

  return prompt;
}

module.exports = { formulateGradingPrompt };
