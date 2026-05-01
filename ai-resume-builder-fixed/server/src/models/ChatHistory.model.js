import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    agentType: {
      type: String,
      enum: ['interview', 'review', 'ats'],
      default: 'interview',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ userId: 1, resumeId: 1, agentType: 1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;