const WEIGHTS = {
  keywordMatch: 0.20,
  bulletQuality: 0.15,
  formatting: 0.10,
  sectionCompleteness: 0.10,
  summaryStrength: 0.10,
  skillCoverage: 0.10,
  quantification: 0.10,
  actionVerbs: 0.05,
  length: 0.05,
  contactInfo: 0.05,
};

export const calculateOverallScore = (breakdown) => {
  let total = 0;
  for (const [metric, weight] of Object.entries(WEIGHTS)) {
    total += (breakdown[metric] || 0) * weight;
  }
  return Math.round(total);
};

export const getScoreCategory = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'green' };
  if (score >= 60) return { label: 'Good', color: 'blue' };
  if (score >= 40) return { label: 'Fair', color: 'yellow' };
  return { label: 'Needs Work', color: 'red' };
};

export const calculateAlgorithmicScores = (formatResults, keywordResults, sections) => {
  const allBullets = [];
  sections?.experience?.forEach(exp => {
    if (exp.bullets) allBullets.push(...exp.bullets);
  });
  sections?.projects?.forEach(proj => {
    if (proj.bullets) allBullets.push(...proj.bullets);
  });

  const actionVerbScore = allBullets.length > 0
    ? Math.round((formatResults.actionVerbCount / allBullets.length) * 100)
    : 0;

  const quantificationScore = allBullets.length > 0
    ? Math.round((formatResults.quantifiedCount / allBullets.length) * 100)
    : 0;

  const bulletQualityScore = Math.round((actionVerbScore + quantificationScore) / 2);

  const totalSections = 6;
  const filledSections = [
    formatResults.hasContactInfo,
    formatResults.hasSummary,
    formatResults.hasExperience,
    formatResults.hasEducation,
    formatResults.hasSkills,
    !!(sections?.projects?.length > 0),
  ].filter(Boolean).length;
  const sectionCompletenessScore = Math.round((filledSections / totalSections) * 100);

  const resumeText = JSON.stringify(sections);
  const wordCount = resumeText.split(/\s+/).length;
  const lengthScore = wordCount >= 300 && wordCount <= 800 ? 100
    : wordCount < 300 ? Math.round((wordCount / 300) * 100)
    : Math.max(0, 100 - Math.round(((wordCount - 800) / 400) * 50));

  const contactInfoScore = formatResults.hasContactInfo ? 100 : 0;
  const summaryScore = formatResults.hasSummary ? 80 : 0;

  const technicalSkills = sections?.skills?.technical?.length || 0;
  const skillCoverageScore = Math.min(100, technicalSkills * 10);

  return {
    keywordMatch: keywordResults.score,
    bulletQuality: bulletQualityScore,
    formatting: formatResults.score,
    sectionCompleteness: sectionCompletenessScore,
    summaryStrength: summaryScore,
    skillCoverage: skillCoverageScore,
    quantification: quantificationScore,
    actionVerbs: actionVerbScore,
    length: lengthScore,
    contactInfo: contactInfoScore,
  };
};