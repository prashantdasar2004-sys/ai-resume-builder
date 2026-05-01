import API from './api.js';

const chatWithAgent = async (resumeId, message, sectionTargeted = '') => {
  return await API.post('/ai/chat', { resumeId, message, sectionTargeted });
};

const generateBullets = async (data) => {
  return await API.post('/ai/generate-bullets', data);
};

const generateSummary = async (resumeId) => {
  return await API.post('/ai/generate-summary', { resumeId });
};

const getAtsScore = async (resumeId, jobDescription) => {
  return await API.post('/ai/ats-score', { resumeId, jobDescription });
};

const reviewResume = async (resumeId) => {
  return await API.post('/ai/review', { resumeId });
};

const matchJob = async (resumeId, jobDescription) => {
  return await API.post('/ai/match-job', { resumeId, jobDescription });
};

const detectSkillGaps = async (resumeId, jobDescription) => {
  return await API.post('/ai/skill-gaps', { resumeId, jobDescription });
};

const getChatHistory = async (resumeId) => {
  return await API.get(`/ai/chat-history/${resumeId}`);
};

export {
  chatWithAgent, generateBullets, generateSummary,
  getAtsScore, reviewResume, matchJob, detectSkillGaps, getChatHistory,
};