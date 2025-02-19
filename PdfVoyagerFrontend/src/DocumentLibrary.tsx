import { useEffect, useState } from "react";
import { api } from "./helpers/apiConnector";
import { Link } from "react-router-dom";

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
        const { data } = await api.get("/api/pdf");
        setPdfs(data);
      } catch (error) {
        console.error("Failed to fetch PDFs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPdfs();
  }, []);

  if (loading)
    return <div className="text-center text-gray-600">Loading...</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen bg-white dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-6">
        Document Library
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pdfs.map((pdf) => (
          <Link
            key={pdf.id}
            to={`/pdf/${pdf.id}`}
            className="block bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 transition hover:shadow-lg border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600"
          >
            <h3 className="font-semibold text-lg text-slate-800 dark:text-gray-200 truncate">
              {pdf.fileName}
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Uploaded: {new Date(pdf.uploadDate).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default DocumentLibrary;
