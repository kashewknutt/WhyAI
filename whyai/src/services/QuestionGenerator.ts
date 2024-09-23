import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const QuestionGenerator = {
  async generate(context: string): Promise<string> {
    console.log('Generating question for context:', context);
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: "You're tasked with helping the speaker come up with novel and creative ideas. Ask an innovative and pointed question on the subject matter spoken thus far. Limit your response to 15 words."
          },
          { role: 'user', content: context }
        ],
        max_tokens: 30,
      });

      const question = response.choices[0].message.content || 'Could not generate a question.';
      console.log('Generated question:', question);
      return question;
    } catch (error) {
      console.error('Error generating question:', error);
      return 'Error generating question.';
    }
  }
};