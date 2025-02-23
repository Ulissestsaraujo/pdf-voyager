import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./PdfViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
import DesktopPdfViewer from "./DesktopPdfViewer";
import MobilePdfViewer from "./MobilePdfViewer";
import { api } from "./helpers/apiConnector";
import { useParams } from "react-router-dom";

const PdfViewer = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { pdfId } = useParams<{ pdfId: string }>();
  const [sasUrl, setSasUrl] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div className={`pdf-viewer-container ${isMobile ? "mobile" : "desktop"}`}>
      {!isMobile && currentPage && (
        <DesktopPdfViewer sasUrl={sasUrl} currPage={currentPage} />
      )}

      {isMobile && currentPage && (
        <MobilePdfViewer sasUrl={sasUrl} currPage={currentPage} />
      )}
    </div>
  );
};

export default PdfViewer;
