import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';

const sanitizeSections = sections => {
  if (!sections) return sections;

  const cleaned = { ...sections };

  const arrayFields = ['experience', 'education', 'projects', 'certifications'];

  for (const field of arrayFields) {
    if (cleaned[field] && Array.isArray(cleaned[field])) {
      cleaned[field] = cleaned[field].map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
    }
  }

  return cleaned;
};

export const createResume = async (userId, data) => {
  try {
    const resume = new Resume({ userId, ...data });
    return await resume.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getResumes = async userId => {
  return await Resume.find({ userId }).sort({ createdAt: -1 });
};

export const getResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new Error('Resume not found.');
  return resume;
};

export const updateResume = async (resumeId, userId, data) => {
  try {
    // Use dot-notation $set keys to avoid Mongoose subdoc conflicts
    const setPayload = {};

    if (data.title !== undefined) setPayload.title = data.title;
    if (data.template !== undefined) setPayload.template = data.template;
    if (data.targetRole !== undefined) setPayload.targetRole = data.targetRole;
    if (data.jobDescription !== undefined) setPayload.jobDescription = data.jobDescription;

    if (data.sections) {
      const s = sanitizeSections(data.sections);
      if (s.personalInfo !== undefined) setPayload['sections.personalInfo'] = s.personalInfo;
      if (s.summary !== undefined) setPayload['sections.summary'] = s.summary;
      if (s.experience !== undefined) setPayload['sections.experience'] = s.experience;
      if (s.education !== undefined) setPayload['sections.education'] = s.education;
      if (s.skills !== undefined) setPayload['sections.skills'] = s.skills;
      if (s.projects !== undefined) setPayload['sections.projects'] = s.projects;
      if (s.certifications !== undefined) setPayload['sections.certifications'] = s.certifications;
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { $set: setPayload },
      { new: true }
    );

    return resume;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSection = async (resumeId, userId, section, data) => {
  try {
    const sanitizedData =
      section === 'summary'
        ? (typeof data === 'string' ? data : data.summary ?? '')
        : section === 'personalInfo' || section === 'skills'
        ? data
        : sanitizeSections({ [section]: data })[section];

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { $set: { [`sections.${section}`]: sanitizedData } },
      { new: true }
    );

    return resume;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTemplate = async (resumeId, userId, template) => {
  return await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { template } },
    { new: true }
  );
};

export const deleteResume = async (resumeId, userId) => {
  return await Resume.findOneAndDelete({ _id: resumeId, userId });
};