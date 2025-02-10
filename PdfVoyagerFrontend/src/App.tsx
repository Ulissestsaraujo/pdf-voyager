import './App.css'
import PdfUploader from './PdfUploader'
import DocumentLibrary from './DocumentLibrary'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import PdfViewer from './PdfViewer'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="pt-20 px-4 sm:px-8 md:px-16 lg:px-32"> {/* ✅ Pushes content down */}
        <Routes>
          <Route path="/" element={<DocumentLibrary />} />
          <Route path="/upload" element={<PdfUploader />} />
          <Route path="/pdf/:pdfId" element={<PdfViewer />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App;