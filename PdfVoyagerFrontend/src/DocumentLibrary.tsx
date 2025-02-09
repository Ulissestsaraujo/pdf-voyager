import { useEffect, useState } from 'react';
import { api } from './helpers/ApiConnector';
import { Link } from 'react-router-dom';

interface PdfMetadata {
    id: string;
    fileName: string;
    blobUrl: string;
    uploadDate: string;
    userId: string;
}

const DocumentLibrary = () => {
    const [pdfs, setPdfs] = useState<PdfMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const { data } = await api.get("/pdf/user/123")
                setPdfs(data);
            } catch (error) {
                console.error("Failed to fetch PDFs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPdfs();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Document Library</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pdfs.map((pdf) => (
                    <Link
                        key={pdf.id}
                        to={`/pdf/${pdf.id}`}
                        className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <h3 className="font-bold truncate">{pdf.fileName}</h3>
                        <p className="text-sm text-gray-500">
                            Uploaded: {new Date(pdf.uploadDate).toLocaleDateString()}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DocumentLibrary;