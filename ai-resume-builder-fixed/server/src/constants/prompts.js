export const resumeParserPrompt = (resumeText) => `You are an expert resume parser. Extract structured data from this resume text.

RESUME TEXT:
${resumeText}

Parse the resume and extract ALL information into this EXACT JSON format:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "website": "",
    "summary": ""
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "languages": []
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": "",
      "bullets": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "link": ""
    }
  ]
}

Rules:
- Extract ALL experience entries, education entries, projects, certifications
- For bullets, extract each bullet point as a separate string in the array
- For skills, categorize them appropriately
- If a field is not found, use empty string or empty array
- Return ONLY the JSON, no other text`;

export const bulletWriterPrompt = (data) => `You are an expert resume writer specializing in STAR-method bullet points.

CONTEXT:
- Role: ${data.role || ''} at ${data.company || ''}
- Target position: ${data.targetRole || ''}
- Job Description Keywords: ${data.jobDescription || ''}

RAW EXPERIENCE:
${data.rawExperience || ''}

RULES:
- Write 3-5 powerful bullet points using STAR method (Situation-Task-Action-Result)
- Start each bullet with a strong action verb
- Include metrics and quantifiable results where possible
- Incorporate relevant keywords from the job description
- Keep each bullet under 2 lines
- Focus on impact and achievements, not just duties

You MUST respond with valid JSON in this exact format:
{
  "bullets": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ]
}`;

export const summaryWriterPrompt = (data) => `You are an expert resume writer. Write a compelling professional summary.

CANDIDATE INFO:
- Name: ${data.fullName || ''}
- Target Role: ${data.targetRole || ''}
- Years of Experience: ${data.yearsOfExperience || ''}
- Key Skills: ${data.skills || ''}
- Top Achievements: ${data.achievements || ''}

RULES:
- Write 3-4 sentences maximum
- Start with a strong professional identity statement
- Include 2-3 key skills or expertise areas
- End with value proposition or career goal
- Tailor to the target role
- Do NOT use first person (I, me, my)

You MUST respond with valid JSON in this exact format:
{
  "summary": "your generated summary here"
}`;

export const atsScorePrompt = (data) => `You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description.

JOB DESCRIPTION:
${data.jobDescription || ''}

RESUME DATA:
${JSON.stringify(data.resumeData || {}, null, 2)}

ALGORITHMIC PRE-SCORES (0-100):
- Keyword Match: ${data.algorithmicScores?.keywordMatch || 0}
- Bullet Quality: ${data.algorithmicScores?.bulletQuality || 0}
- Formatting: ${data.algorithmicScores?.formatting || 0}
- Section Completeness: ${data.algorithmicScores?.sectionCompleteness || 0}
- Quantification: ${data.algorithmicScores?.quantification || 0}
- Action Verbs: ${data.algorithmicScores?.actionVerbs || 0}
- Length: ${data.algorithmicScores?.length || 0}
- Contact Info: ${data.algorithmicScores?.contactInfo || 0}

Provide AI scores for ALL 10 metrics and detailed feedback.

You MUST respond with valid JSON in this exact format:
{
  "scores": {
    "keywordMatch": 0,
    "bulletQuality": 0,
    "formatting": 0,
    "sectionCompleteness": 0,
    "summaryStrength": 0,
    "skillCoverage": 0,
    "quantification": 0,
    "actionVerbs": 0,
    "length": 0,
    "contactInfo": 0
  },
  "missingKeywords": [],
  "presentKeywords": [],
  "suggestions": [
    {
      "metric": "metric name",
      "priority": "high/medium/low",
      "issue": "what is wrong",
      "fix": "how to fix it"
    }
  ],
  "overallFeedback": "overall feedback here"
}`;

export const resumeReviewPrompt = (data) => `You are a senior career counselor and resume expert with 20 years of experience. Review this resume comprehensively.

RESUME DATA:
${JSON.stringify(data.resumeData || {}, null, 2)}

TARGET ROLE: ${data.targetRole || 'Not specified'}

Provide a thorough review covering all aspects of the resume.

You MUST respond with valid JSON in this exact format:
{
  "overallScore": 0,
  "overallFeedback": "",
  "sections": {
    "personalInfo": { "score": 0, "feedback": "", "suggestions": [] },
    "summary": { "score": 0, "feedback": "", "suggestions": [] },
    "experience": { "score": 0, "feedback": "", "suggestions": [] },
    "education": { "score": 0, "feedback": "", "suggestions": [] },
    "skills": { "score": 0, "feedback": "", "suggestions": [] },
    "projects": { "score": 0, "feedback": "", "suggestions": [] }
  },
  "strengths": [],
  "improvements": [],
  "quickWins": []
}`;

export const jobMatchPrompt = (data) => `You are a career advisor. Analyze how well this resume matches the job description.

JOB DESCRIPTION:
${data.jobDescription || ''}

RESUME DATA:
${JSON.stringify(data.resumeData || {}, null, 2)}

You MUST respond with valid JSON in this exact format:
{
  "matchScore": 0,
  "matchedRequirements": [],
  "missingRequirements": [],
  "recommendations": [],
  "summary": ""
}`;

export const skillGapPrompt = (data) => `You are a career development expert. Identify skill gaps between this resume and job description.

JOB DESCRIPTION:
${data.jobDescription || ''}

CURRENT SKILLS FROM RESUME:
${JSON.stringify(data.currentSkills || {}, null, 2)}

You MUST respond with valid JSON in this exact format:
{
  "missingSkills": {
    "critical": [],
    "important": [],
    "niceToHave": []
  },
  "existingStrengths": [],
  "learningPath": [
    {
      "skill": "",
      "priority": "high/medium/low",
      "timeToLearn": "",
      "resources": []
    }
  ],
  "summary": ""
}`;