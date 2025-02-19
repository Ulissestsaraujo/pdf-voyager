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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 w-full max-w-lg border border-slate-200 dark:border-gray-700">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-slate-400 dark:border-gray-500 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 font-medium p-6 text-center rounded-lg cursor-pointer transition"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-slate-800 dark:text-gray-200 font-semibold">
              Drop the PDF here...
            </p>
          ) : (
            <p className="text-slate-700 dark:text-gray-300">
              Drag & drop or click to upload
            </p>
          )}
        </div>
        {file && (
          <div className="mt-4">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full mt-2 p-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-slate-500"
              placeholder="Enter custom filename..."
            />
          </div>
        )}
        {file && (
          <button
            onClick={handleUpload}
            disabled={!filename}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            Upload PDF
          </button>
        )}
        {uploadStatus && (
          <p className="mt-4 text-center text-sm font-semibold text-slate-700 dark:text-gray-300">
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default PdfUploader;
