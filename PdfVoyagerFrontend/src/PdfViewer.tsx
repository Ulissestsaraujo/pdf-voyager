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
import { authApi } from "./helpers/apiConnector";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";

import "./PdfViewer.css";

const PdfViewer = () => {
  const { pdfId } = useParams<{ pdfId: string }>();
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReadSasUrl = async () => {
      try {
        const response = await authApi().get(`/api/pdf/${pdfId}/read-url`);
        setSasUrl(response.data.result);
      } catch (error) {
        console.error("Error fetching read SAS URL:", error);
      }
    };

    const fetchProgress = async () => {
      try {
        const response = await authApi().get(`/api/progress/${pdfId}`);
        setCurrentPage(response.data || 1);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();
    fetchReadSasUrl();
  }, [pdfId]);

  const saveProgress = useDebouncedCallback(async (page: number) => {
    try {
      await authApi().post("/api/progress", {
        PdfId: pdfId,
        LastPage: page,
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, 1000);

  useEffect(() => {
    saveProgress(currentPage);
  }, [currentPage, saveProgress]);

  const goPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goNext = () => {
    setCurrentPage((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!sasUrl) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-7xl flex flex-col items-center">
        <div
          ref={containerRef}
          className="flex  justify-centerw-full min-h-[85vh] items-start overflow-auto p-4"
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
                className="shadow-md border border-gray-300 mx-auto"
              />
            </div>
          </Document>
        </div>

        <div className="mt-4 flex justify-between items-center w-full px-6">
          <button
            onClick={goPrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <p className="text-gray-700">
            Page {currentPage} of {numPages || "?"}
          </p>
          <button
            onClick={goNext}
            disabled={currentPage === numPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
