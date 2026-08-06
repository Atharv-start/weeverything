/**
 * search.prompts.ts – Semantic search and NL query prompt templates
 */
export const SEARCH_PROMPTS = {
  SEMANTIC_REWRITE_V1: {
    key: 'search.semantic-rewrite.v1',
    name: 'Semantic Query Rewriter',
    feature: 'search',
    template: `You are a search query optimizer for WeEverything, a super-app with chats, moments, wallet, tasks, expenses, and workspace.
Expand this query into a semantic search query with synonyms and related terms.
Return ONLY the expanded query string (no explanation).

Original query: {{query}}
Search scope: {{scope}}`,
  },

  NL_QUERY_TRANSLATE_V1: {
    key: 'search.nl-query.v1',
    name: 'Natural Language to Structured Query',
    feature: 'nl-query',
    template: `You are a safe query translator for WeEverything.
Translate this natural language question into a safe, structured query spec.
Return ONLY valid JSON matching this schema exactly:
{
  "entity": "expenses|tasks|messages|posts|wallet|users",
  "filters": [{"field": "...", "op": "eq|gt|lt|gte|lte|contains|in", "value": "..."}],
  "sort": {"field": "...", "dir": "asc|desc"},
  "limit": 10,
  "explanation": "brief human-readable explanation"
}

Question: {{question}}
User context: {{userContext}}

IMPORTANT: Only use fields that exist in the data model. Never generate raw SQL.`,
  },

  RESULT_RANKING_V1: {
    key: 'search.result-ranking.v1',
    name: 'Search Result Relevance Reranker',
    feature: 'search',
    template: `Given the user's query and these search results, rank them by relevance.
Return a JSON array of result IDs in order of relevance: ["id1", "id2", ...]

Query: {{query}}
Results: {{results}}`,
  },
} as const;
