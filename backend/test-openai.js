const OpenAI = require('openai').default;
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Testing OpenAI connection...');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10));

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "hello" in JSON format' }],
      max_tokens: 50,
      response_format: { type: 'json_object' }
    });
    console.log('✅ SUCCESS:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error details:', error);
  }
}

test();
