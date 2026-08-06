/**
 * chat.prompts.ts – Chat-related prompt templates
 */
export const CHAT_PROMPTS = {
  SUGGESTIONS_V1: {
    key: 'chat.suggestions.v1',
    name: 'Chat Reply Suggestions',
    feature: 'copilot',
    template: `You are a helpful AI chat assistant for WeEverything.
Based on this conversation history, suggest 3 quick, short, natural-sounding replies the user could send.
Return ONLY a JSON array of strings, like ["Sure!", "Sounds good.", "Let me check."].

Conversation:
{{context}}`,
  },

  SUMMARIZE_V1: {
    key: 'chat.summarize.v1',
    name: 'Chat Summarization',
    feature: 'summarization',
    template: `You are a WeEverything AI assistant. Summarize this conversation in concise bullet points.
Focus on key decisions, action items, and important information.
Format: bullet list with bold action items marked as **[ACTION]**.

Conversation:
{{context}}

Participants: {{participants}}`,
  },

  SENTIMENT_V1: {
    key: 'chat.sentiment.v1',
    name: 'Chat Sentiment Analysis',
    feature: 'analytics',
    template: `Analyze the sentiment of this conversation. Return JSON with:
{ "overall": "positive|negative|neutral|mixed", "score": 0-100, "topics": ["..."], "flags": [] }

Conversation:
{{context}}`,
  },
} as const;
