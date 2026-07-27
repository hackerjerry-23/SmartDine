/**
 * Thin wrapper around the Gemini API (@google/genai - the current,
 * supported SDK; the old @google/generative-ai package and the
 * gemini-1.5-flash / gemini-2.0-flash model families it used are
 * end-of-life and now return hard errors).
 *
 * Centralising this here means every AI feature (assistant, recommend,
 * forecast, inventory-predict) shares the same client, model choice and
 * error handling instead of duplicating try/catch everywhere.
 */
const { GoogleGenAI } = require('@google/genai');

// 'gemini-flash-latest' is Google's auto-updated alias - it always points
// at the current recommended Flash model, so this keeps working across
// Google's model deprecations without code changes.
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/**
 * Calls Gemini with a plain text prompt and returns the plain text reply.
 * Throws a descriptive error (never a raw SDK error) so controllers can
 * decide how to degrade gracefully.
 */
async function generateText(prompt) {
  const ai = getClient();
  if (!ai) {
    throw new Error('AI assistant is not configured (missing GEMINI_API_KEY on the server).');
  }

  try {
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    if (!text) throw new Error('empty response');
    return text;
  } catch (err) {
    console.error('Gemini request failed:', err.message);
    throw new Error('The AI assistant is temporarily unavailable. Please try again in a moment.');
  }
}

/**
 * Same as generateText but strips ```json fences and parses the result.
 * Returns null (rather than throwing) on malformed JSON so callers can
 * fall back to a non-AI response instead of 500ing.
 */
async function generateJSON(prompt) {
  const raw = await generateText(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini returned non-JSON content:', cleaned.slice(0, 200));
    return null;
  }
}

module.exports = { generateText, generateJSON, MODEL };
