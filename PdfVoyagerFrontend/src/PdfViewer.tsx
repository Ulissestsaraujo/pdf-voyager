import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "./helpers/apiConnector";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url"; // ✅ Import manually

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfViewer = () => {
    const { pdfId } = useParams<{ pdfId: string }>();
    const [sasUrl, setSasUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchReadSasUrl = async () => {
            try {
                const response = await api.get(`/pdf/123/${pdfId}/read-url`);
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
            const loadingTask = pdfjs.getDocument(sasUrl);
            const pdf = await loadingTask.promise;
            setNumPages(pdf.numPages);

            const page = await pdf.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d")!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport,
            };

            await page.render(renderContext).promise;
        };

        loadPdf();
    }, [sasUrl, currentPage]);

    if (!sasUrl) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">PDF Viewer</h1>
            <canvas ref={canvasRef} />
            <div className="mt-4 flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <p>
                    Page {currentPage} of {numPages}
                </p>
                <button
                    onClick={() =>
                        setCurrentPage((prev) => (numPages ? Math.min(prev + 1, numPages) : prev))
                    }
                    disabled={currentPage === numPages}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PdfViewer;