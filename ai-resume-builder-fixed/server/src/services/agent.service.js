import { generateContent } from '../config/gemini.config.js';
import Resume from '../models/Resume.model.js';

export const runInterviewAgent = async (resumeId, message, chatHistory = []) => {
  try {
    let resumeContext = '';
    try {
      const resume = await Resume.findById(resumeId);
      if (resume) resumeContext = `Current resume:\n${JSON.stringify(resume.sections, null, 2)}`;
    } catch (_) {}

    const historyText = chatHistory
      .slice(-6)
      .map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
      .join('\n');

    const prompt = `You are an expert career coach and resume writer AI assistant.
Help users build strong, professional resumes. Be specific and actionable.

${resumeContext}

${historyText ? `Previous conversation:\n${historyText}\n` : ''}
User: ${message}

Respond helpfully and concisely.`;

    const response = await generateContent(prompt);
    return response || 'I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Agent error:', error?.message || error);
    return 'AI assistant is temporarily unavailable. Please check your GEMINI_API_KEY in the .env file.';
  }
};