import Resume from '../models/Resume.model.js';
import ResumeVersion from '../models/ResumeVersion.model.js';

export const saveVersion = async (resumeId, userId, label) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }

  const lastVersion = await ResumeVersion.findOne({ resumeId })
    .sort({ versionNumber: -1 });
  const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const version = new ResumeVersion({
    resumeId,
    userId,
    versionNumber,
    label: label || `Version ${versionNumber}`,
    snapshot: resume.sections,
  });

  return await version.save();
};

export const getVersions = async (resumeId, userId) => {
  return await ResumeVersion.find({ resumeId, userId })
    .sort({ versionNumber: -1 });
};

export const getVersion = async (resumeId, userId, versionId) => {
  const version = await ResumeVersion.findOne({
    _id: versionId, resumeId, userId,
  });
  if (!version) {
    const error = new Error('Version not found.');
    error.statusCode = 404;
    throw error;
  }
  return version;
};

export const restoreVersion = async (resumeId, userId, versionId) => {
  const version = await ResumeVersion.findOne({
    _id: versionId, resumeId, userId,
  });
  if (!version) {
    const error = new Error('Version not found.');
    error.statusCode = 404;
    throw error;
  }

  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { sections: version.snapshot } },
    { new: true }
  );
  if (!resume) {
    const error = new Error('Resume not found.');
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const deleteVersion = async (resumeId, userId, versionId) => {
  const version = await ResumeVersion.findOneAndDelete({
    _id: versionId, resumeId, userId,
  });
  if (!version) {
    const error = new Error('Version not found.');
    error.statusCode = 404;
    throw error;
  }
  return version;
};