const ACTION_VERBS = new Set([
  "led", "developed", "designed", "implemented", "managed", "created",
  "optimized", "built", "launched", "reduced", "increased", "achieved",
  "delivered", "collaborated", "spearheaded", "architected", "streamlined",
  "automated", "improved", "established", "mentored", "drove", "scaled",
  "transformed", "pioneered", "orchestrated", "engineered", "integrated",
  "accelerated", "negotiated", "resolved", "migrated", "deployed",
  "configured", "analyzed", "refactored", "coordinated", "facilitated",
]);

export const checkFormatting = (sections) => {
  const results = {
    hasContactInfo: false,
    hasSummary: false,
    hasExperience: false,
    hasEducation: false,
    hasSkills: false,
    bulletCount: 0,
    actionVerbCount: 0,
    quantifiedCount: 0,
    totalBullets: 0,
    score: 0,
  };

  if (sections?.personalInfo) {
    const p = sections.personalInfo;
    results.hasContactInfo = !!(p.email && p.phone && p.fullName);
  }

  // FIX: summary is at sections.summary (top-level), NOT inside personalInfo
  results.hasSummary = !!(sections?.summary && sections.summary.length > 20);

  results.hasExperience = !!(sections?.experience?.length > 0);
  results.hasEducation = !!(sections?.education?.length > 0);
  results.hasSkills = !!(
    sections?.skills?.technical?.length > 0 ||
    sections?.skills?.soft?.length > 0
  );

  const allBullets = [];
  sections?.experience?.forEach(exp => {
    if (exp.bullets) allBullets.push(...exp.bullets);
  });
  sections?.projects?.forEach(proj => {
    if (proj.bullets) allBullets.push(...proj.bullets);
  });

  results.totalBullets = allBullets.length;

  for (const bullet of allBullets) {
    const firstWord = bullet.trim().split(' ')[0]?.toLowerCase();
    if (ACTION_VERBS.has(firstWord)) results.actionVerbCount++;
    if (/\d+%|\$\d+|\d+x|\d+ (million|billion|thousand|users|customers)/.test(bullet)) {
      results.quantifiedCount++;
    }
  }

  let score = 0;
  if (results.hasContactInfo) score += 20;
  if (results.hasSummary) score += 15;
  if (results.hasExperience) score += 20;
  if (results.hasEducation) score += 15;
  if (results.hasSkills) score += 15;
  if (results.totalBullets > 0) {
    score += Math.min(15, Math.round((results.actionVerbCount / results.totalBullets) * 15));
  }

  results.score = score;
  return results;
};