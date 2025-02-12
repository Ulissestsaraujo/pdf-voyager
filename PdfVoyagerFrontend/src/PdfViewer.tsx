import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { authApi } from "./helpers/apiConnector";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfViewer = () => {
  const { pdfId } = useParams<{ pdfId: string }>();
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [twoPageView, setTwoPageView] = useState(window.innerWidth >= 1024);
  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];
  const [renderedPages, setRenderedPages] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const handleResize = () => {
      setTwoPageView(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchReadSasUrl = async () => {
      try {
        const response = await authApi().get(`/api/pdf/${pdfId}/read-url`);
        console.info("Read SAS URL:", response.data.result);
        setSasUrl(response.data.result);
      } catch (error) {
        console.error("Error fetching read SAS URL:", error);
      }
    };
    fetchReadSasUrl();
  }, [pdfId]);

  useEffect(() => {
    if (!sasUrl) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjs.getDocument(sasUrl);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);

        const renderPage = async (
          pageNum: number,
          canvasRef: React.RefObject<HTMLCanvasElement | null>
        ) => {
          if (pageNum > pdf.numPages || pageNum < 1) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;

          context.clearRect(0, 0, canvas.width, canvas.height);

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          setRenderedPages((prev) => ({ ...prev, [pageNum]: true }));
        };

        if (canvasRefs[0].current) {
          await renderPage(currentPage, canvasRefs[0]);
        }

        if (
          twoPageView &&
          currentPage + 1 <= pdf.numPages &&
          canvasRefs[1].current
        ) {
          await renderPage(currentPage + 1, canvasRefs[1]);
        } else if (canvasRefs[1].current) {
          const context = canvasRefs[1].current.getContext("2d");
          if (context) {
            context.clearRect(
              0,
              0,
              canvasRefs[1].current.width,
              canvasRefs[1].current.height
            );
          }
        }

        if (
          currentPage + 2 <= pdf.numPages &&
          !renderedPages[currentPage + 2]
        ) {
          const preRenderCanvas = document.createElement("canvas");
          await renderPage(currentPage + 2, { current: preRenderCanvas });
        }
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    loadPdf();
  }, [sasUrl, currentPage, twoPageView]);

  if (!sasUrl) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-7xl flex flex-col items-center">
        <div className="flex items-center mb-4 space-x-2">
          <input
            type="checkbox"
            checked={twoPageView}
            onChange={() => setTwoPageView((prev) => !prev)}
            className="h-4 w-4 text-blue-500"
          />
          <label className="text-gray-700 text-sm">Enable Two-Page View</label>
        </div>
        <div
          className={`flex ${
            twoPageView ? "gap-6" : "gap-0"
          } w-full h-[85vh] items-center justify-center overflow-hidden`}
        >
          <canvas
            ref={canvasRefs[0]}
            className={`shadow-md border border-gray-300 ${
              twoPageView ? "w-[48%]" : "w-full"
            } h-full object-contain`}
          />
          {twoPageView && (
            <canvas
              ref={canvasRefs[1]}
              className="shadow-md border border-gray-300 w-[48%] h-full object-contain"
            />
          )}
        </div>
        <div className="mt-4 flex justify-between items-center w-full px-6">
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.max(prev - (twoPageView ? 2 : 1), 1)
              )
            }
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <p className="text-gray-700">
            Page {currentPage} of {numPages || "?"}
          </p>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                numPages
                  ? Math.min(prev + (twoPageView ? 2 : 1), numPages)
                  : prev
              )
            }
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
