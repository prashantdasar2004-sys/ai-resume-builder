import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import Resume from '../models/Resume.model.js';

export const createAgentTools = (context, aiService) => {
  const updateResumeSectionTool = new DynamicStructuredTool({
    name: 'update_resume_section',
    description: 'Update a specific section of the resume with new data extracted from the conversation.',
    schema: z.object({
      section: z.enum([
        'personalInfo', 'experience', 'education',
        'skills', 'projects', 'certifications'
      ]).describe('The resume section to update'),
      data: z.any().describe('The data to update the section with'),
    }),
    func: async ({ section, data }) => {
      try {
        const validSections = [
          'personalInfo', 'experience', 'education',
          'skills', 'projects', 'certifications'
        ];
        if (!validSections.includes(section)) {
          return `Error: Invalid section "${section}"`;
        }
        await Resume.findByIdAndUpdate(
          context.resumeId,
          { $set: { [`sections.${section}`]: data } },
          { new: true }
        );
        return `Successfully updated ${section} section.`;
      } catch (error) {
        return `Error updating section: ${error.message}`;
      }
    },
  });

  const getResumeDataTool = new DynamicStructuredTool({
    name: 'get_resume_data',
    description: 'Get the current resume data to review what has been filled in so far.',
    schema: z.object({}),
    func: async () => {
      try {
        const resume = await Resume.findById(context.resumeId);
        if (!resume) return 'Resume not found.';
        return JSON.stringify(resume.sections, null, 2);
      } catch (error) {
        return `Error fetching resume: ${error.message}`;
      }
    },
  });

  const generateBulletsTool = new DynamicStructuredTool({
    name: 'generate_bullets',
    description: 'Generate STAR-method bullet points for a specific experience.',
    schema: z.object({
      role: z.string().describe('Job role/title'),
      company: z.string().describe('Company name'),
      rawExperience: z.string().describe('Raw description of experience'),
      targetRole: z.string().optional().describe('Target job role'),
    }),
    func: async ({ role, company, rawExperience, targetRole }) => {
      try {
        const result = await aiService.generateBullets({
          role, company, rawExperience, targetRole: targetRole || '',
        });
        return JSON.stringify(result);
      } catch (error) {
        return `Error generating bullets: ${error.message}`;
      }
    },
  });

  const calculateAtsScoreTool = new DynamicStructuredTool({
    name: 'calculate_ats_score',
    description: 'Calculate the ATS score for the current resume.',
    schema: z.object({
      jobDescription: z.string().optional().describe('Job description to score against'),
    }),
    func: async ({ jobDescription }) => {
      try {
        const resume = await Resume.findById(context.resumeId);
        if (!resume) return 'Resume not found.';
        const result = await aiService.getAtsScore({
          resumeData: resume.sections,
          jobDescription: jobDescription || '',
        });
        return `ATS Score: ${result.overallScore}/100. ${result.overallFeedback}`;
      } catch (error) {
        return `Error calculating ATS score: ${error.message}`;
      }
    },
  });

  return [
    updateResumeSectionTool,
    getResumeDataTool,
    generateBulletsTool,
    calculateAtsScoreTool,
  ];
};