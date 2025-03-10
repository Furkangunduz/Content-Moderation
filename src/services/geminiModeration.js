import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODERATION_PROMPT = `
You are a content moderation system. Your task is to analyze the provided text and determine if it contains inappropriate content.
You must ONLY respond with a valid JSON object and nothing else. No conversational text, no explanations.

The JSON response must follow this exact format:
{
  "isInappropriate": boolean,
  "reasons": string[],
  "confidence": number
}

Categories of inappropriate content to check:
- Profanity or offensive language
- Hate speech
- Threats or violent content
- Harassment or bullying
- Discriminatory content
- Sexual content
- Other inappropriate content

Example response for inappropriate content:
{
  "isInappropriate": true,
  "reasons": ["Contains profanity", "Contains threatening language"],
  "confidence": 0.95
}

Example response for appropriate content:
{
  "isInappropriate": false,
  "reasons": [],
  "confidence": 0.98
}
`;

export const moderateTextWithGemini = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([{ text: MODERATION_PROMPT }, { text: `Text to analyze: "${text}"` }]);

    const response = await result.response;
    const responseText = response.text();

    const cleanedResponse = responseText.replace(/^[^{]*({.*})[^}]*$/s, '$1');

    try {
      const moderation = JSON.parse(cleanedResponse);
      return moderation.isInappropriate ? `Content moderation issues detected: ${moderation.reasons.join(', ')}` : null;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      console.error('Parse error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Gemini moderation error:', error);
    return null;
  }
};
