import { useState } from 'react';
import { pdfjs } from 'react-pdf';

// ✅ Manually set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

// Define the PdfMetadata type
interface PdfMetadata {
    id: string;
    fileName: string;
    uploadDate: string;
    blobUrl: string;
    userId: string;
}
import { Document, Page } from 'react-pdf';
import { api } from './helpers/ApiConnector';

const PdfCard = ({ pdf }: { pdf: PdfMetadata }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [sasUrl, setSasUrl] = useState<string | null>(null);

    // Fetch a read-only SAS URL for viewing
    const fetchReadSasUrl = async () => {
        try {
            const response = await api.get(`/pdf/123/${pdf.id}/read-url`);
            console.info('Read SAS URL:', response.data.result);
            setSasUrl(response.data.result);
        } catch (error) {
            console.error('Error fetching read SAS URL:', error);
        }
    };

    return (
        <div className=" container border rounded-lg p-4 shadow-md">
            <div className="h-48 overflow-hidden mb-4">
                {sasUrl && (
                    <Document
                        file={sasUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                        <Page pageNumber={1} width={200} />
                    </Document>
                )}
            </div>
            <h3 className="font-bold truncate">{pdf.fileName}</h3>
            <p className="text-sm text-gray-500">
                Uploaded: {new Date(pdf.uploadDate).toLocaleDateString()}
            </p>
            <button
                onClick={fetchReadSasUrl}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Open PDF
            </button>
        </div>
    );
};

export default PdfCard;