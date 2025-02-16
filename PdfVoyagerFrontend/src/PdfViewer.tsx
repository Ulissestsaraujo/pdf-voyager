import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";

import "./PdfViewer.css";
import { api } from "./helpers/apiConnector";

const PdfViewer = () => {
  const { pdfId } = useParams<{ pdfId: string }>();
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const devicePixelRatio = window.devicePixelRatio || 1;

  useEffect(() => {
    const fetchReadSasUrl = async () => {
      try {
        const response = await api.get(`/api/pdf/${pdfId}/read-url`);
        setSasUrl(response.data.result);
      } catch (error) {
        console.error("Error fetching read SAS URL:", error);
      }
    };

    const fetchProgress = async () => {
      try {
        const response = await api.get(`/api/progress/${pdfId}`);
        setCurrentPage(response.data || 1);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();
    fetchReadSasUrl();
  }, [pdfId]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25));
  const resetZoom = () => setScale(1);

  const saveProgress = useDebouncedCallback(async (page: number) => {
    try {
      await api.post("/api/progress", {
        PdfId: pdfId,
        LastPage: page,
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, 1000);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    saveProgress(currentPage);
  }, [currentPage, saveProgress]);

  const goPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goNext = () => {
    setCurrentPage((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setPageInput("");
      return;
    }

    const page = parseInt(value, 10);
    if (!isNaN(page)) {
      setPageInput(value);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const validatePageInput = () => {
    if (!numPages) return;

    let page = parseInt(pageInput, 10);
    if (isNaN(page)) {
      page = currentPage;
    }

    const newPage = Math.min(Math.max(1, page), numPages);
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  if (!sasUrl) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-7xl flex flex-col items-center">
        {/* Top Controls */}
        <div className="w-full flex flex-wrap gap-4 justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="w-20 text-center">
              {(scale * 100).toFixed(0)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pageInput}
                onChange={handlePageChange}
                onBlur={validatePageInput}
                onKeyDown={(e) => e.key === "Enter" && validatePageInput()}
                min="1"
                max={numPages || 1}
                className="w-16 px-2 py-1 border rounded text-center"
              />
              <span>of {numPages || "?"}</span>
            </div>
            <button
              onClick={goNext}
              disabled={currentPage === numPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* PDF Container */}
        <div
          ref={containerRef}
          className="flex justify-center w-full min-h-[85vh] items-start overflow-auto p-4"
        >
          <Document
            file={sasUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center gap-4"
            options={options}
          >
            <div className="w-full">
              <Page
                pageNumber={currentPage}
                scale={scale * devicePixelRatio}
                className="shadow-md border border-gray-300 mx-auto"
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
