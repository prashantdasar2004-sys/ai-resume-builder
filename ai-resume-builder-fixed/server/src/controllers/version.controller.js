import * as versionService from '../services/version.service.js';

export const saveVersion = async (req, res, next) => {
  try {
    const { label } = req.body;
    const version = await versionService.saveVersion(
      req.params.resumeId, req.user._id, label
    );
    return res.status(201).json({ success: true, data: version });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false, message: error.message
      });
    }
    next(error);
  }
};

export const getVersions = async (req, res, next) => {
  try {
    const versions = await versionService.getVersions(
      req.params.resumeId, req.user._id
    );
    return res.status(200).json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};

export const getVersion = async (req, res, next) => {
  try {
    const version = await versionService.getVersion(
      req.params.resumeId, req.user._id, req.params.versionId
    );
    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    next(error);
  }
};

export const restoreVersion = async (req, res, next) => {
  try {
    const resume = await versionService.restoreVersion(
      req.params.resumeId, req.user._id, req.params.versionId
    );
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const deleteVersion = async (req, res, next) => {
  try {
    await versionService.deleteVersion(
      req.params.resumeId, req.user._id, req.params.versionId
    );
    return res.status(200).json({ success: true, message: 'Version deleted.' });
  } catch (error) {
    next(error);
  }
};
