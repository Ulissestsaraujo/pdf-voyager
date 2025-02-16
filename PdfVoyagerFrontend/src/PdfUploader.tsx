import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "./helpers/apiConnector";
const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file || !filename.trim()) {
      alert("Please select a PDF file and enter a filename!");
      return;
    }

    setUploadStatus("Generating upload URL...");

    try {
      const { data } = await api.post("/api/pdf/generate-upload-url", {
        filename,
      });

      if (!data.sasUrl) {
        setUploadStatus("Error: Missing SAS URL response");
        return;
      }

      setUploadStatus("Uploading...");

      await api.put(data.sasUrl, file, {
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent?.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadStatus(`Uploading... ${percent}%`);
        },
      });

      await api.post("/api/pdf/save-metadata/", {
        filename,
        blobUrl: data.sasUrl.split("?")[0],
      });

      setUploadStatus("Upload and metadata saved successfully!");
      setFile(null);
      setFilename("");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Error: Upload failed. Check logs.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium p-6 text-center rounded-lg cursor-pointer transition"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-700 font-semibold">Drop the PDF here...</p>
          ) : (
            <p className="text-gray-600">
              Drag & drop a PDF here, or click to select one
            </p>
          )}
        </div>
        {file && (
          <div className="mt-4">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full mt-2 p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter custom filename..."
            />
          </div>
        )}
        {file && (
          <button
            onClick={handleUpload}
            disabled={!filename}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            Upload PDF
          </button>
        )}
        {uploadStatus && (
          <p className="mt-4 text-center text-sm font-semibold text-gray-700">
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default PdfUploader;
