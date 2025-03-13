import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery, useGetLegalAnalysisMutation } from "../services/article";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");

  // 1) Existing RapidAPI summarization hook for URLs
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  // 2) New hook for analyzing raw text (e.g., from PDFs)
  const [getLegalAnalysis, { error: analysisError, isLoading: isAnalysisLoading }] =
    useGetLegalAnalysisMutation();

  // Load articles from localStorage on mount
  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem("articles"));
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  // Handle URL-based summarization (RapidAPI)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const existingArticle = allArticles.find((item) => item.url === article.url);
    if (existingArticle) return setArticle(existingArticle);

    // Summarize by URL
    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  // Copy URL for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  // Handle PDF upload -> extract text -> call the new legal analysis endpoint
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Read file as ArrayBuffer
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let extractedText = "";
        // Loop through all pages to extract text
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          extractedText += pageText + "\n";
        }
        console.log("Extracted text:", extractedText);

        // 1) Call your new "getLegalAnalysis" mutation
        //    which hits a legal summary & analysis API (ChatGPT, Llama, or your custom server).
        const { data } = await getLegalAnalysis({ text: extractedText });
        // 2) Store the result
        if (data?.summary) {
          const newArticle = { url: file.name, summary: data.summary };
          const updatedAllArticles = [newArticle, ...allArticles];
          setArticle(newArticle);
          setAllArticles(updatedAllArticles);
          localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error processing PDF:", err);
    }
  };

  // Render
  return (
    <section className='mt-16 w-full max-w-xl'>
      {/* Search / Input Form */}
      <div className='flex flex-col w-full gap-2'>
        <form className='flex flex-col items-center' onSubmit={handleSubmit}>
          <div className='relative w-full'>
            <img
              src={linkIcon}
              alt='link-icon'
              className='absolute left-0 my-2 ml-3 w-5'
            />
            <input
              type='url'
              placeholder='Enter Website URL or Upload PDF Document for Legal Analysis'
              value={article.url}
              onChange={(e) => setArticle({ ...article, url: e.target.value })}
              onKeyDown={handleKeyDown}
              required
              className='url_input peer'
            />
            <button
              type='submit'
              className='submit_btn peer-focus:border-gray-700 peer-focus:text-blue-700'
            >
              <p>↵</p>
            </button>
          </div>
          {/* Upload Button */}
          <div className='mt-4 w-full flex justify-center'>
            <label
              htmlFor='upload'
              className='cursor-pointer bg-blue-500 text-white px-4 py-2 rounded'
            >
              Upload PDF
            </label>
            <input
              id='upload'
              type='file'
              accept='application/pdf'
              className='hidden'
              onChange={handleUpload}
            />
          </div>
        </form>
      </div>

      {/* Display Summary */}
      <div className='my-10 max-w-full flex justify-center items-center'>
        {/* Show a loader if either endpoint is fetching */}
        {(isFetching || isAnalysisLoading) ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : (error || analysisError) ? (
          <p className='font-inter font-bold text-black text-center'>
            Well, that wasn't supposed to happen...
            <br />
            <span className='font-satoshi font-normal text-gray-700'>
              {error?.data?.error || analysisError?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className='flex flex-col gap-3'>
              <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                Legal <span className='blue_gradient'>Summary</span>
              </h2>
              <div className='summary_box'>
                <p className='font-inter font-medium text-sm text-gray-700'>
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
