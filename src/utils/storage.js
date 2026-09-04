const STORAGE_KEY = 'ai_voice_tutor_sessions_v1';

/**
 * Retrieves all saved learning sessions from localStorage
 * @returns {Array<object>}
 */
export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read sessions from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new completed learning session to localStorage
 * @param {object} session
 * @returns {object} The saved session object with ID and timestamp
 */
export function saveSession(session) {
  try {
    const current = getSessions();
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      language: session.language || 'English',
      transcript: session.transcript || '',
      correctedSentence: session.analysis?.correctedSentence || session.correctedSentence || '',
      grammarScore: Number(session.analysis?.grammarScore ?? session.grammarScore ?? 0),
      vocabularyScore: Number(session.analysis?.vocabularyScore ?? session.vocabularyScore ?? 0),
      mistakes: Array.isArray(session.analysis?.mistakes) ? session.analysis.mistakes : (session.mistakes || []),
      feedback: session.analysis?.feedback || session.feedback || '',
      encouragement: session.analysis?.encouragement || session.encouragement || '',
      difficulty: session.analysis?.difficulty || session.difficulty || 'beginner',
    };

    const updated = [newSession, ...current].slice(0, 50); // Keep last 50 sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSession;
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
    return null;
  }
}

/**
 * Deletes a specific session by ID
 * @param {string} id
 */
export function deleteSession(id) {
  try {
    const current = getSessions();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete session:', err);
    return [];
  }
}

/**
 * Clears all learning history
 */
export function clearSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear sessions:', err);
  }
}

/**
 * Computes aggregate learning metrics and adaptive difficulty level
 * @param {Array<object>} [sessions]
 * @returns {object} Aggregate analytics object
 */
export function calculateStats(sessions = null) {
  const data = sessions || getSessions();
  const total = data.length;

  if (total === 0) {
    return {
      totalSessions: 0,
      averageGrammar: 0,
      averageVocabulary: 0,
      overallAverage: 0,
      commonMistakes: [],
      adaptiveDifficulty: 'beginner',
      recentTrend: [],
      masteryLevel: 'Novice Learner',
    };
  }

  const grammarSum = data.reduce((acc, s) => acc + (s.grammarScore || 0), 0);
  const vocabSum = data.reduce((acc, s) => acc + (s.vocabularyScore || 0), 0);

  const averageGrammar = Math.round(grammarSum / total);
  const averageVocabulary = Math.round(vocabSum / total);
  const overallAverage = Math.round((averageGrammar + averageVocabulary) / 2);

  // Compute Adaptive Difficulty based on performance
  let adaptiveDifficulty = 'beginner';
  let masteryLevel = '🌱 Beginner';

  if (overallAverage >= 80) {
    adaptiveDifficulty = 'advanced';
    masteryLevel = '🏆 Advanced Speaker';
  } else if (overallAverage >= 60) {
    adaptiveDifficulty = 'intermediate';
    masteryLevel = '⚡ Intermediate Learner';
  }

  // Aggregate common mistake categories & topics
  const mistakeCounts = {};
  data.forEach((session) => {
    if (Array.isArray(session.mistakes)) {
      session.mistakes.forEach((m) => {
        const type = (m.type || 'grammar').toLowerCase();
        mistakeCounts[type] = (mistakeCounts[type] || 0) + 1;
      });
    }
  });

  const commonMistakes = Object.entries(mistakeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const recentTrend = data.slice(0, 7).reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    grammar: s.grammarScore,
    vocabulary: s.vocabularyScore,
    avg: Math.round(((s.grammarScore || 0) + (s.vocabularyScore || 0)) / 2),
  }));

  return {
    totalSessions: total,
    averageGrammar,
    averageVocabulary,
    overallAverage,
    commonMistakes,
    adaptiveDifficulty,
    masteryLevel,
    recentTrend,
  };
}
