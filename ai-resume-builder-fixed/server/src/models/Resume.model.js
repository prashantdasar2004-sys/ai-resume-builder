import mongoose from 'mongoose';

const experienceSchema =
  new mongoose.Schema(
    {
      company: {
        type: String,
        default: '',
      },

      role: {
        type: String,
        default: '',
      },

      startDate: {
        type: String,
        default: '',
      },

      endDate: {
        type: String,
        default: '',
      },

      current: {
        type: Boolean,
        default: false,
      },

      bullets: {
        type: [String],
        default: [],
      },
    },
    { _id: true }
  );

const educationSchema =
  new mongoose.Schema(
    {
      institution: {
        type: String,
        default: '',
      },

      degree: {
        type: String,
        default: '',
      },

      field: {
        type: String,
        default: '',
      },

      startDate: {
        type: String,
        default: '',
      },

      endDate: {
        type: String,
        default: '',
      },

      gpa: {
        type: String,
        default: '',
      },
    },
    { _id: true }
  );

const projectSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        default: '',
      },

      description: {
        type: String,
        default: '',
      },

      technologies: {
        type: [String],
        default: [],
      },

      link: {
        type: String,
        default: '',
      },

      bullets: {
        type: [String],
        default: [],
      },
    },
    { _id: true }
  );

const certificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        default: '',
      },

      issuer: {
        type: String,
        default: '',
      },

      date: {
        type: String,
        default: '',
      },

      link: {
        type: String,
        default: '',
      },
    },
    { _id: true }
  );

const atsBreakdownSchema =
  new mongoose.Schema(
    {},
    {
      strict: false,
      _id: false,
    }
  );

const resumeSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: 'User',

        required: true,
      },

      title: {
        type: String,
        default:
          'Untitled Resume',
      },

      template: {
        type: String,

        enum: [
          'classic',
          'modern',
          'creative',
          'minimal',
          'executive',
        ],

        default: 'classic',
      },

      targetRole: {
        type: String,
        default: '',
      },

      jobDescription: {
        type: String,
        default: '',
      },

      sections: {
        personalInfo: {
          fullName: {
            type: String,
            default: '',
          },

          email: {
            type: String,
            default: '',
          },

          phone: {
            type: String,
            default: '',
          },

          location: {
            type: String,
            default: '',
          },

          linkedIn: {
            type: String,
            default: '',
          },

          portfolio: {
            type: String,
            default: '',
          },
        },

        // summary as top-level section (matches client)
        summary: {
          type: String,
          default: '',
        },

        experience: {
          type: [
            experienceSchema,
          ],

          default: [],
        },

        education: {
          type: [
            educationSchema,
          ],

          default: [],
        },

        skills: {
          technical: {
            type: [String],
            default: [],
          },

          soft: {
            type: [String],
            default: [],
          },

          languages: {
            type: [String],
            default: [],
          },
        },

        projects: {
          type: [projectSchema],
          default: [],
        },

        certifications: {
          type: [
            certificationSchema,
          ],

          default: [],
        },
      },

      atsScore: {
        type: Number,
        default: 0,
      },

      atsBreakdown: {
        type: atsBreakdownSchema,

        default: () => ({}),
      },
    },

    {
      timestamps: true,
    }
  );

resumeSchema.index({
  userId: 1,
  createdAt: -1,
});

const Resume = mongoose.model(
  'Resume',
  resumeSchema
);

export default Resume;