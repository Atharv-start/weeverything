import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class AiService {
  private genAI: any;

  constructor(private readonly prisma: PrismaClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private async callGemini(prompt: string, fallbackResponse: string): Promise<string> {
    if (!this.genAI) {
      console.warn('GEMINI_API_KEY is missing. Returning simulated fallback response.');
      return fallbackResponse;
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response?.text();
      return text || fallbackResponse;
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      return fallbackResponse;
    }
  }

  async getChatSuggestions(conversationId: string, userId: string) {
    // Fetch last few messages for context
    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { sender: { select: { displayName: true } } },
    });

    const context = messages
      .reverse()
      .map((m) => `${m.sender.displayName}: ${m.content}`)
      .join('\n');

    const prompt = `You are a helpful AI chat assistant. Based on this conversation history, suggest 3 quick, short, natural-sounding replies the user could send. Return ONLY a JSON array of strings, like ["Sure!", "Sounds good.", "Let me check."]:\n\n${context}`;
    const fallback = `["Okay, got it!", "Let me think about it.", "Let's catch up later!"]`;

    try {
      const response = await this.callGemini(prompt, fallback);
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return JSON.parse(fallback);
    }
  }

  async generateTaskPlan(description: string) {
    const prompt = `You are an AI task planner. Break down the following goal or project description into a step-by-step checklist of actionable tasks. Include priority (LOW, MEDIUM, HIGH) for each. Return ONLY a JSON array of objects with fields "title", "description", and "priority":\n\nGoal: "${description}"`;
    const fallback = `[
      {"title": "Initial research", "description": "Review baseline specifications", "priority": "HIGH"},
      {"title": "Design layout draft", "description": "Create a preliminary structure", "priority": "MEDIUM"},
      {"title": "Implementation Phase 1", "description": "Write core functions", "priority": "HIGH"}
    ]`;

    try {
      const response = await this.callGemini(prompt, fallback);
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return JSON.parse(fallback);
    }
  }

  async getExpenseInsights(userId: string) {
    // Fetch user expenses
    const expenses = await this.prisma.expense.findMany({
      where: { paidById: userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    if (expenses.length === 0) {
      return 'No spending data available. Record some expenses in the Splitter Mini App to get personalized spend insights.';
    }

    const summary = expenses.map((e) => `- ${e.title}: ₹${(e.amount / 100).toFixed(2)}`).join('\n');
    const prompt = `You are an AI financial coach. Review this list of expenses and provide 2 bullet points of constructive, brief spending insights and 1 tip. Do NOT give professional financial advice:\n\n${summary}`;
    const fallback = `• You spent on multiple items recently. Track recurring trends.\n• Maintain emergency safety reserves.\n• Tip: Try setting a daily limit for miscellaneous items.`;

    return this.callGemini(prompt, fallback);
  }

  async assistUniversal(query: string) {
    const prompt = `You are the WeEverything AI Universal Assistant. Users ask you questions about how to use the app, finding Mini Apps, or summarizing ideas. WeEverything includes: Chats, Moments (feed), Wallet (ledgers), Mini Apps (Expenses, Habit tracker, Daily Planner). Keep your answer under 3 sentences:\n\nQuestion: "${query}"`;
    const fallback = `I can help you navigate WeEverything! You can use our Chats to connect with colleagues, Wallet to transfer funds, or Mini Apps like the Calorie Tracker and Expense Splitter.`;
    return this.callGemini(prompt, fallback);
  }

  async assistMoments(caption: string) {
    const prompt = `You are an AI assistant. Rewrite this caption for a social post to make it more engaging and recommend 3 relevant hashtags. Return ONLY the rewritten text followed by the hashtags:\n\nOriginal caption: "${caption}"`;
    const fallback = `Exploring new bounds today! ✨ #explore #innovation #daily`;
    return this.callGemini(prompt, fallback);
  }
}
