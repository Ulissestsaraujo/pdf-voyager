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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Document Library
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pdfs.map((pdf) => (
          <Link
            key={pdf.id}
            to={`/pdf/${pdf.id}`}
            className="block bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
          >
            <h3 className="font-semibold text-lg text-gray-800 truncate">
              {pdf.fileName}
            </h3>
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
