import API from './api.js';

const createResume = async (data = {}) => {
  return await API.post('/resumes', data);
};

const getResumes = async () => {
  return await API.get('/resumes');
};

const getResume = async (id) => {
  return await API.get(`/resumes/${id}`);
};

const updateResume = async (id, data) => {
  return await API.put(`/resumes/${id}`, data);
};

const updateSection = async (id, section, data) => {
  return await API.put(`/resumes/${id}/sections/${section}`, data);
};

const updateTemplate = async (id, template) => {
  return await API.put(`/resumes/${id}/template`, { template });
};

const deleteResume = async (id) => {
  return await API.delete(`/resumes/${id}`);
};

const saveVersion = async (resumeId, label) => {
  return await API.post(`/versions/${resumeId}`, { label });
};

const getVersions = async (resumeId) => {
  return await API.get(`/versions/${resumeId}`);
};

const restoreVersion = async (resumeId, versionId) => {
  return await API.post(`/versions/${resumeId}/${versionId}/restore`);
};

const deleteVersion = async (resumeId, versionId) => {
  return await API.delete(`/versions/${resumeId}/${versionId}`);
};

const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await API.post('/resumes/upload', formData);
};

export {
  createResume, getResumes, getResume,
  updateResume, updateSection, updateTemplate, deleteResume,
  saveVersion, getVersions, restoreVersion, deleteVersion,
  uploadResume,
};