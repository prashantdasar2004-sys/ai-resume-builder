// ============================================
// AtsScorePanel.jsx - ATS Scoring Display
// ============================================

import './index.css';
import { useState, useContext } from 'react';
import { ResumeContext } from '../../context/ResumeContext.jsx';
import { getAtsScore } from '../../services/aiService.js';
import JobDescriptionInput from '../JobDescriptionInput';
import AtsScoreCircle from '../AtsScoreCircle';
import AtsChecklistItem from '../AtsChecklistItem';
import SkillGapCard from '../SkillGapCard';
import ATS_METRICS from '../../constants/atsMetrics.js';
import { HiExclamationTriangle, HiLightBulb } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function AtsScorePanel() {
  const { resume, updateAtsScore, updateField } = useContext(ResumeContext);
  const [jobDescription, setJobDescription] = useState(resume.jobDescription || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // atsScore can be a plain number (stored in DB after analysis) or a full object (returned in-session).
  // Normalize so the UI always gets an object with expected fields, or null.
  const rawScore = resume.atsScore;
  const atsScore = rawScore
    ? typeof rawScore === 'number'
      ? { overall: rawScore, overallScore: rawScore, breakdown: {}, missingKeywords: [], presentKeywords: [], suggestions: [], overallFeedback: 'Run a new analysis for the full breakdown.' }
      : rawScore
    : null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Paste a job description first');
      return;
    }
    if (!resume._id) {
      toast.error('No resume loaded');
      return;
    }

    setIsAnalyzing(true);
    try {
      updateField('jobDescription', jobDescription);
      const result = await getAtsScore(resume._id, jobDescription);
      // result comes back as { overall, breakdown, missingKeywords, presentKeywords, suggestions, overallFeedback }
      updateAtsScore(result);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('ATS error:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-md flex-col gap-md">

      {/* Job Description Input */}
      <JobDescriptionInput
        value={jobDescription}
        onChange={setJobDescription}
        onAnalyze={handleAnalyze}
        isLoading={isAnalyzing}
      />

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex-center p-lg">
          <div className="spinner" />
        </div>
      )}

      {/* Score Results */}
      {atsScore && !isAnalyzing && (
        <>
          {/* Overall Score Circle */}
          <div className="flex-center p-sm">
            <AtsScoreCircle score={atsScore.overall || 0} />
          </div>

          {/* Overall Feedback */}
          {atsScore.overallFeedback && (
            <div className="suggestion-item" style={{ textAlign: 'center', fontStyle: 'italic' }}>
              {atsScore.overallFeedback}
            </div>
          )}

          {/* Metric Breakdown */}
          {atsScore.breakdown && Object.keys(atsScore.breakdown).length > 0 && (
            <div className="flex-col gap-sm">
              <h3 className="section-title">Score Breakdown</h3>
              {ATS_METRICS.map((metric) => {
                const data = atsScore.breakdown[metric.key];
                if (data === undefined || data === null) return null;
                // data can be a number OR an object { score, label }
                const score = typeof data === 'object' ? (data.score ?? 0) : data;
                const fix = typeof data === 'object' ? (data.fix || data.suggestion || '') : '';
                return (
                  <AtsChecklistItem
                    key={metric.key}
                    label={metric.label}
                    score={score}
                    fix={fix}
                    weight={metric.weight}
                  />
                );
              })}
            </div>
          )}

          {/* Missing Keywords */}
          {atsScore.missingKeywords && atsScore.missingKeywords.length > 0 && (
            <div className="flex-col gap-sm">
              <div className="flex-row items-center gap-xs">
                <HiExclamationTriangle className="text-purple" />
                <h3 className="section-title">Missing Keywords</h3>
              </div>
              <div className="flex-row flex-wrap gap-xs">
                {atsScore.missingKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Present Keywords */}
          {atsScore.presentKeywords && atsScore.presentKeywords.length > 0 && (
            <div className="flex-col gap-sm">
              <h3 className="section-title">Matched Keywords</h3>
              <div className="flex-row flex-wrap gap-xs">
                {atsScore.presentKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag-present">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions — AI returns objects {metric, priority, issue, fix} OR plain strings */}
          {atsScore.suggestions && atsScore.suggestions.length > 0 && (
            <div className="flex-col gap-sm">
              <div className="flex-row items-center gap-xs">
                <HiLightBulb className="text-purple" />
                <h3 className="section-title">Suggestions</h3>
              </div>
              <div className="flex-col gap-sm">
                {atsScore.suggestions.map((suggestion, index) => {
                  // Handle both string and object formats safely
                  if (typeof suggestion === 'string') {
                    return (
                      <div key={index} className="suggestion-item">
                        {suggestion}
                      </div>
                    );
                  }
                  // Object format: { metric, priority, issue, fix }
                  return (
                    <div key={index} className="suggestion-item">
                      {suggestion.priority && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            marginRight: '6px',
                            color:
                              suggestion.priority === 'high' ? '#dc2626'
                              : suggestion.priority === 'medium' ? '#d97706'
                              : '#6b7280',
                          }}
                        >
                          [{suggestion.priority}]
                        </span>
                      )}
                      {suggestion.fix || suggestion.issue || JSON.stringify(suggestion)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {atsScore.skillGaps && (
            <SkillGapCard
              missingSkills={atsScore.skillGaps.missing || []}
              recommendations={atsScore.skillGaps.recommendations || []}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!atsScore && !isAnalyzing && (
        <div className="empty-state">
          <p className="text-muted text-sm">
            Paste a job description above and click Analyze to see your ATS score.
          </p>
        </div>
      )}
    </div>
  );
}

export default AtsScorePanel;