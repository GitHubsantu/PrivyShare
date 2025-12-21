import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FileUploadPage from "./components/Upload/FileUpload";
import FileDownload from "./components/Download/FileDownload";
import LandingPage from "./components/LandingPage"
import { Toaster } from "react-hot-toast";
import ReceivePage from "./components/Receive/ReceivePage";

function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<FileUploadPage />} />
        <Route path="/receive" element={<ReceivePage />} />
        <Route path="/download/:id" element={<FileDownload />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
      <Footer/>
    </>
  );
}

export default App;
