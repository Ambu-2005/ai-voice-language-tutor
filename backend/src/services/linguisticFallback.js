/**
 * Intelligent Pedagogical Linguistic Fallback Engine
 * Specialized for Indian Languages & Indian-English learning diagnostics:
 * - English
 * - Hindi (हिंदी)
 * - Kannada (ಕನ್ನಡ)
 * - Telugu (తెలుగు)
 * - Tamil (தமிழ்)
 * - Marathi (मराठी)
 * - Bengali (বাংলা)
 * - Malayalam (മലയാളം)
 * - Gujarati (ગુજરાતી)
 * - Punjabi (ਪੰਜਾਬੀ)
 */

// English & Indian-English linguistic rules
const ENGLISH_RULES = [
  // Irregular past tenses
  { pattern: /\bbuyed\b/gi, original: 'buyed', correction: 'bought', type: 'grammar', explanation: 'The past tense of "buy" is irregular: "bought", not "buyed".' },
  { pattern: /\bgoed\b/gi, original: 'goed', correction: 'went', type: 'grammar', explanation: 'The past tense of "go" is irregular: "went".' },
  { pattern: /\btaked\b/gi, original: 'taked', correction: 'took', type: 'grammar', explanation: 'The past tense of "take" is irregular: "took".' },
  { pattern: /\beated\b/gi, original: 'eated', correction: 'ate', type: 'grammar', explanation: 'The past tense of "eat" is irregular: "ate".' },
  { pattern: /\bcomed\b/gi, original: 'comed', correction: 'came', type: 'grammar', explanation: 'The past tense of "come" is irregular: "came".' },
  { pattern: /\bseed\b/gi, original: 'seed', correction: 'saw', type: 'grammar', explanation: 'The past tense of "see" is irregular: "saw".' },
  { pattern: /\bknowed\b/gi, original: 'knowed', correction: 'knew', type: 'grammar', explanation: 'The past tense of "know" is irregular: "knew".' },
  { pattern: /\bwrited\b/gi, original: 'writed', correction: 'wrote', type: 'grammar', explanation: 'The past tense of "write" is irregular: "wrote".' },
  { pattern: /\brunned\b/gi, original: 'runned', correction: 'ran', type: 'grammar', explanation: 'The past tense of "run" is irregular: "ran".' },
  { pattern: /\bsleeped\b/gi, original: 'sleeped', correction: 'slept', type: 'grammar', explanation: 'The past tense of "sleep" is irregular: "slept".' },
  { pattern: /\bteached\b/gi, original: 'teached', correction: 'taught', type: 'grammar', explanation: 'The past tense of "teach" is irregular: "taught".' },
  { pattern: /\bthinked\b/gi, original: 'thinked', correction: 'thought', type: 'grammar', explanation: 'The past tense of "think" is irregular: "thought".' },
  { pattern: /\bcatched\b/gi, original: 'catched', correction: 'caught', type: 'grammar', explanation: 'The past tense of "catch" is irregular: "caught".' },

  // Past time indicators with present verbs
  { pattern: /\b(yesterday|last\s+(?:week|month|year|night)|ago)\b([^.!?]*?)\bI\s+go\b/gi, original: 'I go', correction: 'I went', type: 'grammar', explanation: 'Use the past tense "went" with past time expressions like "yesterday".' },
  { pattern: /\bI\s+go\b([^.!?]*?)\b(yesterday|last\s+(?:week|month|year|night)|ago)\b/gi, original: 'I go', correction: 'I went', type: 'grammar', explanation: 'Use the past tense "went" when referring to a past event.' },

  // Common Indian-English patterns
  { pattern: /\b(I|we)\s+am\s+doing\s+it\s+daily\b/gi, original: 'am doing it daily', correction: 'do it daily', type: 'grammar', explanation: 'Use simple present for habitual daily actions instead of continuous tense.' },
  { pattern: /\bpass\s+out\s+from\s+college\b/gi, original: 'pass out from college', correction: 'graduate from college', type: 'vocabulary', explanation: 'Use "graduate from college" instead of "pass out".' },
  { pattern: /\bdiscuss\s+about\b/gi, original: 'discuss about', correction: 'discuss', type: 'grammar', explanation: '"Discuss" is a transitive verb; do not use "about" with it.' },
  { pattern: /\brevert\s+back\b/gi, original: 'revert back', correction: 'revert', type: 'vocabulary', explanation: '"Revert" already means to return or reply; "back" is redundant.' },

  // Subject-Verb Agreement
  { pattern: /\b(he|she|it)\s+don't\b/gi, original: "don't", correction: "doesn't", type: 'grammar', explanation: 'Third-person singular subjects (he/she/it) take "doesn\'t", not "don\'t".' },
  { pattern: /\b(he|she|it)\s+have\b/gi, original: 'have', correction: 'has', type: 'grammar', explanation: 'Third-person singular subjects take "has", not "have".' },
  { pattern: /\b(he|she|it)\s+go\b/gi, original: 'go', correction: 'goes', type: 'grammar', explanation: 'In simple present tense, add -es for third-person singular: "goes".' },
  { pattern: /\b(they|we|you)\s+is\b/gi, original: 'is', correction: 'are', type: 'grammar', explanation: 'Plural subjects and "you" take "are", not "is".' },
  { pattern: /\b(they|we|you)\s+was\b/gi, original: 'was', correction: 'were', type: 'grammar', explanation: 'Plural subjects and "you" take "were" in the past tense.' },
  { pattern: /\bI\s+is\b/gi, original: 'is', correction: 'am', type: 'grammar', explanation: 'The first person pronoun "I" pairs with "am".' },

  // Indefinite Articles
  { pattern: /\ba\s+([aeiou][a-z]+)/gi, original: 'a', correction: 'an', type: 'grammar', explanation: 'Use the article "an" before words starting with a vowel sound.' },
  { pattern: /\ban\s+([^aeiou\s][a-z]+)/gi, original: 'an', correction: 'a', type: 'grammar', explanation: 'Use the article "a" before words starting with a consonant sound.' },

  // Missing definite articles in common phrases
  { pattern: /\bgo\s+to\s+market\b/gi, original: 'go to market', correction: 'go to the market', type: 'grammar', explanation: 'Use the definite article "the" before specific places like "the market".' },
  { pattern: /\bwent\s+to\s+market\b/gi, original: 'went to market', correction: 'went to the market', type: 'grammar', explanation: 'Use "the market" instead of "market".' },

  // Double Negatives & Misused Modifiers
  { pattern: /\b(don't|doesn't|didn't)\s+have\s+no\b/gi, original: 'have no', correction: 'have any', type: 'grammar', explanation: 'Avoid double negatives. Use "any" with negative verbs.' },
  { pattern: /\bmore\s+better\b/gi, original: 'more better', correction: 'better', type: 'grammar', explanation: '"Better" is already comparative; do not add "more".' },
  { pattern: /\bmost\s+best\b/gi, original: 'most best', correction: 'best', type: 'grammar', explanation: '"Best" is already superlative; do not add "most".' },
];

// Hindi rules
const HINDI_RULES = [
  { pattern: /\b(mera\s+ko|mere\s+ko)\b/gi, original: 'mere ko', correction: 'mujhe', type: 'grammar', explanation: 'Use the standard pronoun "mujhe" (मुझे) instead of informal "mere ko".' },
  { pattern: /\b(tera\s+ko|tere\s+ko)\b/gi, original: 'tere ko', correction: 'tujhe', type: 'grammar', explanation: 'Use the standard pronoun "tujhe" (तुझे) instead of "tere ko".' },
  { pattern: /\bmai\b([^.!?]*?)\bjaata\s+hai\b/gi, original: 'jaata hai', correction: 'jaata hu', type: 'grammar', explanation: 'For first person "mai" (मैं), the auxiliary verb should be "hu" (हूँ), not "hai".' },
  { pattern: /\bhum\b([^.!?]*?)\bkarega\b/gi, original: 'karega', correction: 'karenge', type: 'grammar', explanation: 'Plural/respectful "hum" (हम) takes plural future verb ending "-enge" (करेंगे).' },
  { pattern: /\baap\b([^.!?]*?)\baao\b/gi, original: 'aao', correction: 'aaiye', type: 'grammar', explanation: 'Use respectful imperative form "aaiye" (आइए) with formal pronoun "aap" (आप).' },
];

// Kannada rules
const KANNADA_RULES = [
  { pattern: /\bnaanu\b([^.!?]*?)\bhoguthe\b/gi, original: 'hoguthe', correction: 'hoguttene', type: 'grammar', explanation: 'In Kannada, first person pronoun "naanu" takes the suffix "-tini / -ttene" (ನಾನು ಹೋಗುತ್ತೇನೆ).' },
  { pattern: /\bneevu\b([^.!?]*?)\bbaa\b/gi, original: 'baa', correction: 'banni', type: 'grammar', explanation: 'Use the polite plural imperative "banni" (ಬನ್ನಿ) with formal "neevu" (ನೀವು).' },
  { pattern: /\bavanu\b([^.!?]*?)\bbaruthe\b/gi, original: 'baruthe', correction: 'baruttane', type: 'grammar', explanation: 'Third person masculine "avanu" takes suffix "-ane" (ಅವನು ಬರುತ್ತಾನೆ).' },
];

// Telugu rules
const TELUGU_RULES = [
  { pattern: /\bmeeru\b([^.!?]*?)\braa\b/gi, original: 'raa', correction: 'randi', type: 'grammar', explanation: 'Use respectful imperative "randi" (రండి) with formal "meeru" (మీరు).' },
  { pattern: /\bnenu\s+pothunna\b/gi, original: 'nenu pothunna', correction: 'nenu velthunnanu', type: 'vocabulary', explanation: 'Use standard polite Telugu "velthunnanu" (వెళ్తున్నాను) for going.' },
];

// Tamil rules
const TAMIL_RULES = [
  { pattern: /\bneenga\b([^.!?]*?)\bvaa\b/gi, original: 'vaa', correction: 'vaanga', type: 'grammar', explanation: 'Use respectful polite ending "vaanga" (வாருங்கள் / வாங்க) with formal "neenga".' },
  { pattern: /\bnaan\b([^.!?]*?)\bpogudhu\b/gi, original: 'pogudhu', correction: 'pogiren', type: 'grammar', explanation: 'First person pronoun "naan" takes verb agreement "-giren" (நான் போகிறேன்).' },
];

// Marathi rules
const MARATHI_RULES = [
  { pattern: /\btumhi\b([^.!?]*?)\bye\b/gi, original: 'ye', correction: 'yaa', type: 'grammar', explanation: 'Use polite imperative "yaa" (या) with respectful pronoun "tumhi" (तुम्ही).' },
  { pattern: /\bmi\s+jaato\s+aahe\b/gi, original: 'mi jaato aahe', correction: 'mee jaat aahe', type: 'grammar', explanation: 'Standard continuous Marathi phrasing is "mee jaat aahe" (मी जात आहे).' },
];

// Bengali rules
const BENGALI_RULES = [
  { pattern: /\baapni\b([^.!?]*?)\baay\b/gi, original: 'aay', correction: 'aashun', type: 'grammar', explanation: 'Use respectful imperative "aashun" (আসুন) with formal "aapni" (আপনি).' },
];

// Malayalam rules
const MALAYALAM_RULES = [
  { pattern: /\bningal\b([^.!?]*?)\bvaru\b/gi, original: 'varu', correction: 'varoo', type: 'grammar', explanation: 'Use respectful polite imperative "varoo" (വരൂ) with formal "ningal" (നിങ്ങൾ).' },
];

// Gujarati rules
const GUJARATI_RULES = [
  { pattern: /\btame\b([^.!?]*?)\baav\b/gi, original: 'aav', correction: 'aavo', type: 'grammar', explanation: 'Use polite imperative ending "aavo" (આવો) with respectful "tame" (તમે).' },
];

// Punjabi rules
const PUNJABI_RULES = [
  { pattern: /\btusi\b([^.!?]*?)\baa\b/gi, original: 'aa', correction: 'aao', type: 'grammar', explanation: 'Use respectful imperative "aao" (ਆਓ) with polite pronoun "tusi" (ਤੁਸੀਂ).' },
];

/**
 * Intelligent Fallback Analyzer for Indian Languages
 * @param {string} transcript
 * @param {string} targetLanguage
 * @returns {object} Structured Analysis Payload
 */
export function evaluateLinguistically(transcript, targetLanguage = 'English') {
  const cleanTranscript = transcript.trim();
  const langLower = (targetLanguage || 'english').toLowerCase();

  let rules = ENGLISH_RULES;
  if (langLower.includes('hindi') || langLower.includes('हिंदी')) {
    rules = HINDI_RULES;
  } else if (langLower.includes('kannada') || langLower.includes('ಕನ್ನಡ')) {
    rules = KANNADA_RULES;
  } else if (langLower.includes('telugu') || langLower.includes('తెలుగు')) {
    rules = TELUGU_RULES;
  } else if (langLower.includes('tamil') || langLower.includes('தமிழ்')) {
    rules = TAMIL_RULES;
  } else if (langLower.includes('marathi') || langLower.includes('मराठी')) {
    rules = MARATHI_RULES;
  } else if (langLower.includes('bengali') || langLower.includes('বাংলা')) {
    rules = BENGALI_RULES;
  } else if (langLower.includes('malayalam') || langLower.includes('മലയാളം')) {
    rules = MALAYALAM_RULES;
  } else if (langLower.includes('gujarati') || langLower.includes('ગુજરાતી')) {
    rules = GUJARATI_RULES;
  } else if (langLower.includes('punjabi') || langLower.includes('ਪੰਜਾਬੀ')) {
    rules = PUNJABI_RULES;
  }

  const detectedMistakes = [];
  let workingSentence = cleanTranscript;

  // Run through rule set
  for (const rule of rules) {
    if (rule.pattern.test(workingSentence)) {
      const matches = workingSentence.match(rule.pattern);
      if (matches && matches.length > 0) {
        const alreadyExists = detectedMistakes.some((m) => m.original.toLowerCase() === rule.original.toLowerCase());
        if (!alreadyExists) {
          detectedMistakes.push({
            original: rule.original,
            correction: rule.correction,
            type: rule.type,
            explanation: rule.explanation,
          });
        }
        // Apply replacement to form corrected sentence
        workingSentence = workingSentence.replace(rule.pattern, (match, p1) => {
          if (rule.original === 'a' && p1) {
            return `an ${p1}`;
          }
          if (rule.original === 'an' && p1) {
            return `a ${p1}`;
          }
          if (match.toLowerCase() === rule.original.toLowerCase()) {
            if (match[0] === match[0].toUpperCase()) {
              return rule.correction.charAt(0).toUpperCase() + rule.correction.slice(1);
            }
            return rule.correction;
          }
          return match.replace(new RegExp(rule.original, 'gi'), rule.correction);
        });
      }
    }
  }

  // Capitalize first letter and ensure terminating punctuation
  let correctedSentence = workingSentence.charAt(0).toUpperCase() + workingSentence.slice(1);
  if (!/[.!?|।]/.test(correctedSentence)) {
    correctedSentence += '.';
  }

  // Calculate scores based on error penalty
  const mistakeCount = detectedMistakes.length;
  let grammarScore = 95;
  let vocabularyScore = 92;

  if (mistakeCount === 1) {
    grammarScore = 82;
    vocabularyScore = 86;
  } else if (mistakeCount === 2) {
    grammarScore = 74;
    vocabularyScore = 78;
  } else if (mistakeCount >= 3) {
    grammarScore = Math.max(55, 68 - mistakeCount * 5);
    vocabularyScore = Math.max(60, 72 - mistakeCount * 4);
  }

  // Determine difficulty
  const wordCount = cleanTranscript.split(/\s+/).length;
  let difficulty = 'beginner';
  if (wordCount > 12) difficulty = 'advanced';
  else if (wordCount > 6) difficulty = 'intermediate';

  // Construct pedagogical feedback and encouragement
  let feedback = '';
  let encouragement = '';

  if (mistakeCount === 0) {
    feedback = `Excellent grammatical accuracy in ${targetLanguage}! Your sentence flows naturally and conveys your meaning clearly.`;
    encouragement = 'Outstanding job! Try building longer and more complex compound sentences in your next practice.';
  } else {
    const errorSummaries = detectedMistakes.map((m) => `"${m.original}" → "${m.correction}"`).join(', ');
    feedback = `Great effort speaking in ${targetLanguage}! We refined ${errorSummaries} to make your phrasing sound native and grammatically natural.`;
    encouragement = 'Making mistakes is the fastest way to master a new language! Review the corrections above and try speaking it once more.';
  }

  return {
    correctedSentence,
    grammarScore,
    vocabularyScore,
    mistakes: detectedMistakes,
    feedback,
    encouragement,
    difficulty,
  };
}
