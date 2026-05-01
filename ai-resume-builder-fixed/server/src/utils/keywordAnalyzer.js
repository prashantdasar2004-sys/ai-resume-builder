const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "will",
  "with", "this", "that", "from", "they", "were", "said", "each",
  "which", "their", "about", "would", "make", "like", "just", "over",
  "such", "take", "than", "them", "very", "some", "into", "most",
  "other", "could", "also", "more", "what", "when", "your", "work",
  "able", "using", "used", "including", "must", "should", "well",
  "experience", "role", "team", "join", "looking", "based", "strong",
  "working", "knowledge", "understanding", "skills", "ability",
  "responsibilities", "requirements", "qualifications", "preferred",
]);

const extractKeywords = (text) => {
  if (!text) return new Map();
  const words = text.toLowerCase().match(/\b[a-z][a-z0-9+#.-]{1,}\b/g) || [];
  const freq = new Map();
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return freq;
};

export const analyzeKeywords = (resumeText, jobDescriptionText) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescriptionText);

  const topJdKeywords = [...jdKeywords.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);

  const matched = topJdKeywords.filter(k => resumeKeywords.has(k));
  const missing = topJdKeywords.filter(k => !resumeKeywords.has(k));

  const score = topJdKeywords.length > 0
    ? Math.round((matched.length / topJdKeywords.length) * 100)
    : 0;

  return { score, matchedKeywords: matched, missingKeywords: missing, topJdKeywords };
};