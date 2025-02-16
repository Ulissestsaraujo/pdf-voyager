import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DocumentLibrary from "./DocumentLibrary";
import PdfUploader from "./PdfUploader";
import PdfViewer from "./PdfViewer";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="pt-20 px-4 sm:px-8 md:px-16 lg:px-32">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DocumentLibrary />} />
              <Route path="/upload" element={<PdfUploader />} />
              <Route path="/pdf/:pdfId" element={<PdfViewer />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
