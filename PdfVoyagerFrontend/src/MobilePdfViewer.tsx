import { useEffect, useMemo, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./PdfViewer.css";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { api } from "./helpers/apiConnector";
import { useParams } from "react-router-dom";

// Proper PDF worker initialization
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface MobilePdfViewerProps {
  sasUrl?: string;
  currPage: number;
}

const MobilePdfViewer = ({ sasUrl, currPage }: MobilePdfViewerProps) => {
  console.info(currPage);
  const { pdfId } = useParams<{ pdfId: string }>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(currPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const options = useMemo(
    () => ({
      cMapUrl: "/cmaps/",
      standardFontDataUrl: "/standard_fonts/",
      disableAutoFetch: true,
      disableStream: true,
    }),
    []
  );

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastDistance(distance);
      setBaseScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan start
      setIsDragging(true);
      setStartX(e.touches[0].pageX);
      setStartY(e.touches[0].pageY);
      setScrollLeft(containerRef.current?.scrollLeft || 0);
      setScrollTop(containerRef.current?.scrollTop || 0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && containerRef.current) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastDistance) {
        const newScale = (distance / lastDistance) * baseScale;
        setScale(Math.min(Math.max(newScale, 0.5), 3));
      }
      setLastDistance(distance);
    } else if (isDragging && containerRef.current) {
      // Panning
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;

      containerRef.current.scrollLeft = scrollLeft - walkX;
      containerRef.current.scrollTop = scrollTop - walkY;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastDistance(null);
  };

  // Scale calculation
  useEffect(() => {
    const calculateBaseScale = async () => {
      if (!containerRef.current || !sasUrl) return;

      const pdf = await pdfjs.getDocument(sasUrl).promise;
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.offsetWidth - 32;

      const base = containerWidth / viewport.width;
      setBaseScale(base);
      setScale(base);
    };

    calculateBaseScale();
  }, [sasUrl, currentPage]);

  // Save progress
  const saveProgress = useDebouncedCallback(async (page: number) => {
    if (page === 1) return;
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
    saveProgress(currentPage);
  }, [currentPage, saveProgress]);

  return (
    <div
      className="mobile-pdf-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={containerRef} className="pdf-content">
        {sasUrl && (
          <Document
            file={sasUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            options={options}
            loading={<div className="loading-spinner" />}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={false}
              className="pdf-page"
            />
          </Document>
        )}
      </div>

      <div className="mobile-controls">
        <div className="page-controls">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            ←
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(numPages || p, p + 1))
            }
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePdfViewer;
