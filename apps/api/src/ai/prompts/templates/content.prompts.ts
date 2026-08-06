/**
 * content.prompts.ts – Smart content generation prompt templates
 */
export const CONTENT_PROMPTS = {
  EMAIL_DRAFT_V1: {
    key: 'content.email-draft.v1',
    name: 'Email Draft Generator',
    feature: 'content-gen',
    template: `You are a professional email writing assistant.
Write a clear, concise email based on these instructions.
Tone: {{tone}}
Context: {{context}}
Instructions: {{instructions}}

Return ONLY the email body (no subject line unless asked).`,
  },

  MOMENT_CAPTION_V1: {
    key: 'content.moment-caption.v1',
    name: 'Social Post Caption Generator',
    feature: 'content-gen',
    template: `You are a social media copywriter for WeEverything.
Rewrite this caption to be engaging and add 3 relevant hashtags.
Return the rewritten text followed by the hashtags on a new line.

Original: {{caption}}`,
  },

  TASK_DESCRIPTION_V1: {
    key: 'content.task-description.v1',
    name: 'Task Description Generator',
    feature: 'content-gen',
    template: `Generate a clear, actionable task description for:
Title: {{title}}
Context: {{context}}

Return a 2-3 sentence description with clear acceptance criteria.`,
  },

  TASK_PLAN_V1: {
    key: 'content.task-plan.v1',
    name: 'Task Plan Generator',
    feature: 'content-gen',
    template: `You are an AI task planner. Break down this goal into actionable tasks.
Include priority (LOW, MEDIUM, HIGH) for each.
Return ONLY a JSON array: [{"title": "...", "description": "...", "priority": "HIGH"}].

Goal: {{description}}`,
  },

  MEETING_SUMMARY_V1: {
    key: 'content.meeting-summary.v1',
    name: 'Meeting Summary',
    feature: 'summarization',
    template: `Summarize this meeting transcript into:
1. Key decisions (bullet list)
2. Action items with owners (if mentioned)
3. Next steps

Transcript:
{{transcript}}`,
  },

  ANNOUNCEMENT_V1: {
    key: 'content.announcement.v1',
    name: 'Channel Announcement Generator',
    feature: 'content-gen',
    template: `Write a clear, professional announcement for a team channel.
Topic: {{topic}}
Audience: {{audience}}
Key points: {{keyPoints}}
Tone: {{tone}}`,
  },

  COMMENT_REPLY_V1: {
    key: 'content.comment-reply.v1',
    name: 'Comment Reply Generator',
    feature: 'content-gen',
    template: `Generate a thoughtful, concise reply to this comment.
Post context: {{postContext}}
Comment: {{comment}}
My perspective: {{perspective}}`,
  },
} as const;
