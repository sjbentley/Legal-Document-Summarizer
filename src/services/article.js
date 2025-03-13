import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rapidApiKey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;

export const articleApi = createApi({
  reducerPath: "articleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://article-extractor-and-summarizer.p.rapidapi.com/",
    prepareHeaders: (headers) => {
      headers.set("X-RapidAPI-Key", rapidApiKey);
      headers.set("X-RapidAPI-Host", "article-extractor-and-summarizer.p.rapidapi.com");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // 1) Existing endpoint for summarizing an article by URL
    getSummary: builder.query({
      query: (params) =>
        `summarize?url=${encodeURIComponent(params.articleUrl)}&length=3`,
    }),
    // 2) (New) We'll add a second endpoint for legal analysis of raw text
    getLegalAnalysis: builder.mutation({
      query: (body) => {
        // `body` will contain the raw PDF text to analyze
        // For demonstration, let's assume you want to use ChatGPT (OpenAI) or Llama.
        // We'll show ChatGPT as an example.
        return {
          // If you have your own backend or a direct OpenAI endpoint, adjust accordingly.
          url: "/api/legal-analysis", // <--- A custom route in your own backend OR a proxy
          method: "POST",
          body, // e.g. { text: extractedText }
        };
      },
      // Optionally transform the response to a { summary: "...", ... } shape
      transformResponse: (response) => {
        // Adjust to match how your backend or model returns data
        // Example: { summary: "Summarized content..." }
        return response;
      },
    }),
  }),
});

// Export both hooks
export const {
  useLazyGetSummaryQuery,  // For URL-based summarization (RapidAPI)
  useGetLegalAnalysisMutation, // For raw text-based legal analysis
} = articleApi;
