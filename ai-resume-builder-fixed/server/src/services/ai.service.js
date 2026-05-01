import { generateContent } from '../config/gemini.config.js';
import {
  resumeParserPrompt,
  bulletWriterPrompt,
  summaryWriterPrompt,
  atsScorePrompt,
  resumeReviewPrompt,
  jobMatchPrompt,
  skillGapPrompt,
} from '../constants/prompts.js';
import { checkFormatting } from '../utils/formatChecker.js';
import { analyzeKeywords } from '../utils/keywordAnalyzer.js';
import { calculateAlgorithmicScores, calculateOverallScore } from '../utils/scoreCalculator.js';

const parseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (_) {
    return null;
  }
};

export const parseResume = async (resumeText) => {
  try {
    const prompt = resumeParserPrompt(resumeText);
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed) return parsed;
    return { personalInfo: {}, experience: [], education: [], skills: { technical: [], soft: [], languages: [] }, projects: [], certifications: [] };
  } catch (error) {
    console.error('parseResume error:', error);
    return { personalInfo: {}, experience: [], education: [], skills: { technical: [], soft: [], languages: [] }, projects: [], certifications: [] };
  }
};

export const generateBullets = async (data) => {
  try {
    const prompt = bulletWriterPrompt(data);
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed && Array.isArray(parsed.bullets)) return { bullets: parsed.bullets };
    return { bullets: [response] };
  } catch (error) {
    console.error('generateBullets error:', error);
    return { bullets: ['Failed to generate bullets'] };
  }
};

export const generateSummary = async (data) => {
  try {
    const prompt = summaryWriterPrompt({
      fullName: data.resumeData?.personalInfo?.fullName || '',
      targetRole: data.targetRole || '',
      yearsOfExperience: data.resumeData?.experience?.length ? `${data.resumeData.experience.length}+ roles` : '',
      skills: [...(data.resumeData?.skills?.technical || []), ...(data.resumeData?.skills?.soft || [])].slice(0, 6).join(', '),
      achievements: data.resumeData?.experience?.flatMap((e) => e.bullets || []).slice(0, 3).join('. ') || '',
    });
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed && parsed.summary) return { summary: parsed.summary };
    return { summary: response };
  } catch (error) {
    console.error('generateSummary error:', error);
    return { summary: 'Failed to generate summary' };
  }
};

export const getAtsScore = async (data) => {
  try {
    const { resumeData, jobDescription } = data;
    const formatResults = checkFormatting(resumeData);
    const resumeText = JSON.stringify(resumeData);
    const keywordResults = analyzeKeywords(resumeText, jobDescription || '');
    const algorithmicScores = calculateAlgorithmicScores(formatResults, keywordResults, resumeData);

    const prompt = atsScorePrompt({ resumeData, jobDescription, algorithmicScores });
    const response = await generateContent(prompt);
    const aiResult = parseJSON(response);

    const mergedScores = {};
    for (const key of Object.keys(algorithmicScores)) {
      const aiScore = aiResult?.scores?.[key] ?? algorithmicScores[key];
      mergedScores[key] = Math.round((algorithmicScores[key] + aiScore) / 2);
    }

    const overallScore = calculateOverallScore(mergedScores);
    const breakdown = {};
    for (const [key, score] of Object.entries(mergedScores)) {
      breakdown[key] = { score, label: key };
    }

    return {
      overall: overallScore,
      overallScore,
      breakdown,
      missingKeywords: aiResult?.missingKeywords || keywordResults.missingKeywords,
      presentKeywords: aiResult?.presentKeywords || keywordResults.matchedKeywords,
      suggestions: aiResult?.suggestions || [],
      overallFeedback: aiResult?.overallFeedback || 'Analysis complete.',
    };
  } catch (error) {
    console.error('getAtsScore error:', error);
    return { overall: 0, overallScore: 0, breakdown: {}, missingKeywords: [], presentKeywords: [], suggestions: [], overallFeedback: 'ATS analysis failed. Please try again.' };
  }
};

export const reviewResume = async (data) => {
  try {
    const prompt = resumeReviewPrompt(data);
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed) return parsed;
    return { review: response };
  } catch (error) {
    console.error('reviewResume error:', error);
    return { review: 'Resume review failed' };
  }
};

export const matchJob = async (data) => {
  try {
    const prompt = jobMatchPrompt(data);
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed) return parsed;
    return { matchScore: 0, feedback: 'Match analysis failed' };
  } catch (error) {
    console.error('matchJob error:', error);
    return { matchScore: 0, feedback: 'Match analysis failed' };
  }
};

export const getSkillGaps = async (data) => {
  try {
    const prompt = skillGapPrompt(data);
    const response = await generateContent(prompt);
    const parsed = parseJSON(response);
    if (parsed) return parsed;
    return { missingSkills: { critical: [], important: [], niceToHave: [] } };
  } catch (error) {
    console.error('getSkillGaps error:', error);
    return { missingSkills: { critical: [], important: [], niceToHave: [] } };
  }
};

export const chatWithInterviewAgent = async (resumeId, message, chatHistory) => {
  try {
    const response = await generateContent(`You are an AI resume assistant.\n\nUser: ${message}\n\nGive helpful resume advice.`);
    return response || 'AI could not respond';
  } catch (error) {
    console.error('AI CHAT ERROR:', error);
    return 'AI response failed';
  }
};