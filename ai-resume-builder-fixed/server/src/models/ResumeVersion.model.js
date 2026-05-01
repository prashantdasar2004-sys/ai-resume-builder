import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeVersionSchema.index({ resumeId: 1, versionNumber: -1 });

const ResumeVersion = mongoose.model('ResumeVersion', resumeVersionSchema);
export default ResumeVersion;