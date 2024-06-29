function formulateGradingPrompt(answer, dependencyLevel, extraPrompt) {
  let dynamicPortion = "";

  switch (dependencyLevel) {
    case 0: // Only internet answers
      dynamicPortion = `Score this student's answer: ${answer} based solely on the online answers.`;
      break;
    case 1: // Both marking guide and internet
      dynamicPortion = `Score this student's answer: ${answer} based on the marking guide instructions and the online answers.`;
      break;
    case 2: // Only marking guide
      dynamicPortion = `Score this student's answer: ${answer} based solely on the marking guide instructions.`;
      break;
    default:
      dynamicPortion = `Score this student's answer: ${answer} based on the marking guide instructions and the online answers.`;
      break;
  }

  const prompt = `
          ${dynamicPortion}
          
          ${extraPrompt && `Take note of this: ${extraPrompt}`}
          `;

  return prompt;
}

module.exports = { formulateGradingPrompt };
