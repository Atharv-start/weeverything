/**
 * document.prompts.ts – Document AI prompt templates
 */
export const DOCUMENT_PROMPTS = {
  EXTRACT_INFO_V1: {
    key: 'document.extract-info.v1',
    name: 'Document Information Extractor',
    feature: 'doc-ai',
    template: `You are a document intelligence assistant.
Extract structured information from this document.
Return ONLY valid JSON with these fields (use null for missing):
{
  "documentType": "invoice|receipt|id_card|business_card|report|contract|other",
  "title": "...",
  "date": "ISO date or null",
  "amount": "number or null",
  "currency": "3-letter code or null",
  "parties": ["name1", "name2"],
  "keyFields": {"field": "value"},
  "summary": "2-sentence summary"
}

Document text:
{{content}}`,
  },

  SUMMARIZE_DOC_V1: {
    key: 'document.summarize.v1',
    name: 'Document Summarizer',
    feature: 'summarization',
    template: `Summarize this document concisely.
Return a JSON object:
{
  "title": "inferred title",
  "summary": "3-5 sentence summary",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["item 1"],
  "category": "finance|legal|technical|personal|other"
}

Document:
{{content}}`,
  },

  CLASSIFY_DOC_V1: {
    key: 'document.classify.v1',
    name: 'Document Classifier',
    feature: 'doc-ai',
    template: `Classify this document. Return JSON:
{ "type": "invoice|receipt|report|contract|id|other", "confidence": 0-100, "tags": [] }

Document excerpt:
{{excerpt}}`,
  },

  OCR_CLEANUP_V1: {
    key: 'document.ocr-cleanup.v1',
    name: 'OCR Text Cleaner',
    feature: 'doc-ai',
    template: `The following text was extracted via OCR and may contain errors.
Clean it up, fix obvious OCR mistakes, and return the corrected plain text only.

Raw OCR text:
{{ocrText}}`,
  },
} as const;
