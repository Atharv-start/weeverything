/**
 * voice.service.ts
 * Voice AI — Speech-to-Text, Text-to-Speech, voice command parsing,
 * and voice note transcription.
 *
 * Note: Browser-side STT/TTS uses the Web Speech API (no backend required).
 * This service handles server-side voice processing for note transcription
 * and command parsing.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiEngineService } from '../engine/ai-engine.service';

export interface VoiceCommandResult {
  intent: string;
  action: string;
  params: Record<string, string>;
  href?: string;
  rawTranscript: string;
}

export interface TranscriptionResult {
  transcript: string;
  language: string;
  confidence: number;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  // Supported intent → action mapping
  private readonly intentMap: Record<string, { action: string; href: string }> = {
    open_chats: { action: 'navigate', href: '/chats' },
    open_wallet: { action: 'navigate', href: '/wallet' },
    open_tasks: { action: 'navigate', href: '/workspace' },
    open_moments: { action: 'navigate', href: '/moments' },
    open_search: { action: 'navigate', href: '/search' },
    open_notifications: { action: 'navigate', href: '/notifications' },
    open_home: { action: 'navigate', href: '/home' },
    open_settings: { action: 'navigate', href: '/settings' },
    new_task: { action: 'create_task', href: '/workspace' },
    send_money: { action: 'wallet_transfer', href: '/wallet' },
    ai_help: { action: 'copilot', href: '/home' },
  };

  constructor(private readonly engine: AiEngineService) {}

  /**
   * Parse a voice command transcript into a structured action.
   * The transcript comes from the browser's Web Speech API.
   */
  async parseVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
    const intentsJson = JSON.stringify(Object.keys(this.intentMap));
    const prompt = `Parse this voice command into a WeEverything action.
Available intents: ${intentsJson}
Return JSON: {"intent": "...", "params": {}}

Voice command: "${transcript}"`;

    try {
      const response = await this.engine.ask(prompt, { feature: 'voice', maxTokens: 100 });
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as { intent: string; params: Record<string, string> };

      const mapping = this.intentMap[parsed.intent] ?? { action: 'copilot', href: '/home' };

      return {
        intent: parsed.intent,
        action: mapping.action,
        params: parsed.params ?? {},
        href: mapping.href,
        rawTranscript: transcript,
      };
    } catch {
      // Fallback: treat as copilot query
      return {
        intent: 'ai_help',
        action: 'copilot',
        params: { query: transcript },
        href: '/home',
        rawTranscript: transcript,
      };
    }
  }

  /**
   * Generate a voice note from transcribed text.
   * Cleans up filler words and formats the text for saving as a note.
   */
  async cleanTranscript(rawTranscript: string): Promise<TranscriptionResult> {
    const prompt = `Clean up this voice note transcript. Remove filler words (um, uh, like), fix punctuation, and format as clear text. Return ONLY the cleaned text.

Raw: "${rawTranscript}"`;

    try {
      const cleaned = await this.engine.ask(prompt, { feature: 'voice', maxTokens: 512 });
      return {
        transcript: cleaned.trim(),
        language: 'en',
        confidence: 85,
      };
    } catch {
      return {
        transcript: rawTranscript,
        language: 'en',
        confidence: 70,
      };
    }
  }

  /**
   * Convert text to speech metadata (for browser TTS via Web Speech API).
   * Returns SSML-compatible hints for the frontend TTS engine.
   */
  prepareTtsText(text: string): { text: string; rate: number; pitch: number; language: string } {
    // Clean markdown for TTS
    const cleaned = text
      .replace(/#{1,6}\s/g, '') // headings
      .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1') // bold/italic
      .replace(/`(.+?)`/g, '$1') // code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
      .replace(/\n+/g, '. ') // newlines to pauses
      .substring(0, 1000);

    return {
      text: cleaned,
      rate: 1.0,
      pitch: 1.0,
      language: 'en-US',
    };
  }
}
