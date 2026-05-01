import * as aiService from '../services/ai.service.js';
import { runInterviewAgent } from '../services/agent.service.js';
import ChatHistory from '../models/ChatHistory.model.js';
import Resume from '../models/Resume.model.js';
import mongoose from 'mongoose';

export const chat = async (req, res, next) => {
  try {
    const { resumeId, message } = req.body;

    if (!resumeId || !message) {
      return res.status(400).json({
        success: false,
        message: 'resumeId and message are required.',
      });
    }

    // Validate resumeId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resumeId format.',
      });
    }

    // Verify resume belongs to user
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      resumeId,
      agentType: 'interview',
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: req.user._id,
        resumeId,
        agentType: 'interview',
        messages: [],
      });
    }

    chatHistory.messages.push({ role: 'user', content: message });

    let response = await runInterviewAgent(
      resumeId,
      message,
      chatHistory.messages.slice(0, -1)
    );

    if (!response) response = 'No response generated';
    if (typeof response !== 'string') response = JSON.stringify(response);

    chatHistory.messages.push({ role: 'assistant', content: response });

    await chatHistory.save();

    return res.status(200).json({
      success: true,
      data: { response },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI chat failed',
    });
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // Validate resumeId
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      resumeId,
      agentType: 'interview',
    });

    // Normalize messages so client always gets { role, content, timestamp }
    const messages = chatHistory
      ? chatHistory.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
        }))
      : [];

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const generateBullets = async (req, res, next) => {
  try {
    const result = await aiService.generateBullets(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const generateSummary = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    const resume = resumeId && mongoose.Types.ObjectId.isValid(resumeId)
      ? await Resume.findOne({ _id: resumeId, userId: req.user._id })
      : null;

    const result = await aiService.generateSummary({
      resumeData: resume ? resume.sections : {},
      targetRole: resume ? resume.targetRole : '',
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const atsScore = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, message: 'Invalid resumeId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const result = await aiService.getAtsScore({
      resumeData: resume.sections,
      jobDescription: jobDescription || '',
    });

    const flatBreakdown = {};
    for (const [key, val] of Object.entries(result.breakdown)) {
      flatBreakdown[key] = typeof val === 'object' ? val.score || 0 : val;
    }

    await Resume.findByIdAndUpdate(resumeId, {
      $set: { atsScore: result.overallScore, atsBreakdown: flatBreakdown },
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const review = async (req, res, next) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, message: 'Invalid resumeId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const result = await aiService.reviewResume({
      resumeData: resume.sections,
      targetRole: targetRole || '',
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const matchJob = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, message: 'Invalid resumeId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const result = await aiService.matchJob({
      resumeData: resume.sections,
      jobDescription: jobDescription || '',
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const skillGaps = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, message: 'Invalid resumeId.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const result = await aiService.getSkillGaps({
      currentSkills: resume.sections?.skills || {},
      jobDescription: jobDescription || '',
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};