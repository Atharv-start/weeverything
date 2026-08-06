/**
 * chunker.service.ts
 * Text chunking service for the RAG pipeline.
 * Splits documents into overlapping chunks for better retrieval.
 */

import { Injectable } from '@nestjs/common';

export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

export interface ChunkOptions {
  maxChunkSize?: number;   // characters per chunk (default 800)
  overlap?: number;        // overlapping characters between chunks (default 100)
  minChunkSize?: number;   // skip chunks smaller than this (default 50)
}

@Injectable()
export class ChunkerService {
  /**
   * Split text into overlapping chunks respecting sentence boundaries where possible.
   */
  chunk(text: string, options: ChunkOptions = {}): TextChunk[] {
    const {
      maxChunkSize = 800,
      overlap = 100,
      minChunkSize = 50,
    } = options;

    const cleanText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (cleanText.length === 0) return [];

    // Split on sentence boundaries (periods, question marks, exclamation points)
    const sentences = this.splitSentences(cleanText);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let chunkStart = 0;
    let charOffset = 0;
    let chunkIndex = 0;

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length >= minChunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex++,
          startChar: chunkStart,
          endChar: chunkStart + currentChunk.length,
        });

        // Apply overlap: keep last `overlap` chars as context for the next chunk
        const overlapText = currentChunk.slice(-overlap);
        chunkStart = charOffset - overlapText.length;
        currentChunk = overlapText + sentence;
      } else {
        currentChunk += sentence;
      }
      charOffset += sentence.length;
    }

    // Flush remaining text
    if (currentChunk.trim().length >= minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        startChar: chunkStart,
        endChar: chunkStart + currentChunk.length,
      });
    }

    return chunks;
  }

  /** Chunk multiple documents */
  chunkDocuments(
    documents: Array<{ id: string; content: string }>,
    options?: ChunkOptions,
  ): Array<{ docId: string; chunk: TextChunk }> {
    return documents.flatMap((doc) =>
      this.chunk(doc.content, options).map((chunk) => ({ docId: doc.id, chunk })),
    );
  }

  private splitSentences(text: string): string[] {
    // Simple sentence splitter — handles periods, ?, !, and newlines
    return text.split(/(?<=[.!?])\s+|(?<=\n)\n/g).filter(Boolean).map((s) => s + ' ');
  }
}
