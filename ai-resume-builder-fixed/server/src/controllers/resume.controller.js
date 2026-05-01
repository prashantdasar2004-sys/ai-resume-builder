import * as resumeService from '../services/resume.service.js';
import extractTextFromPdf from '../utils/resumeParser.js';
import * as aiService from '../services/ai.service.js';

export const createResume = async (req, res, next) => {
  try {
    const resume = await resumeService.createResume(req.user._id, req.body);
    return res.status(201).json({ success: true, data: resume });
  } catch (error) { next(error); }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getResumes(req.user._id);
    return res.status(200).json({ success: true, data: resumes });
  } catch (error) { next(error); }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResume(req.params.id, req.user._id);
    return res.status(200).json({ success: true, data: resume });
  } catch (error) { next(error); }
};

export const updateResume = async (req, res, next) => {
  try {
    const resume = await resumeService.updateResume(req.params.id, req.user._id, req.body);
    return res.status(200).json({ success: true, data: resume });
  } catch (error) { next(error); }
};

export const updateSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section name.' });
    }
    const resume = await resumeService.updateSection(req.params.id, req.user._id, section, req.body);
    return res.status(200).json({ success: true, data: resume });
  } catch (error) { next(error); }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const resume = await resumeService.updateTemplate(req.params.id, req.user._id, req.body.template);
    return res.status(200).json({ success: true, data: resume });
  } catch (error) { next(error); }
};

export const deleteResume = async (req, res, next) => {
  try {
    await resumeService.deleteResume(req.params.id, req.user._id);
    return res.status(200).json({ success: true, message: 'Resume deleted.' });
  } catch (error) { next(error); }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);
    const parsedData = await aiService.parseResume(resumeText);

    // Normalize field names: AI returns 'linkedin'/'github'/'website', schema expects 'linkedIn'/'portfolio'
    const personalInfo = {
      fullName: parsedData.personalInfo?.fullName || '',
      email: parsedData.personalInfo?.email || '',
      phone: parsedData.personalInfo?.phone || '',
      location: parsedData.personalInfo?.location || '',
      linkedIn: parsedData.personalInfo?.linkedIn || parsedData.personalInfo?.linkedin || '',
      portfolio: parsedData.personalInfo?.portfolio || parsedData.personalInfo?.website || parsedData.personalInfo?.github || '',
    };

    const resume = await resumeService.createResume(req.user._id, {
      title: personalInfo.fullName
        ? `${personalInfo.fullName}'s Resume`
        : 'Uploaded Resume',
      sections: {
        personalInfo,
        summary: parsedData.personalInfo?.summary || parsedData.summary || '',
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || { technical: [], soft: [], languages: [] },
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || [],
      },
    });

    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};