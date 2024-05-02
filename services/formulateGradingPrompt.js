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

module.exports = { formulateGradingPrompt };
