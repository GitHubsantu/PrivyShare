// Created by DevOps
// GitHub: https://github.com/githubsantu

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Download, Link, QrCode, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { setCameraStream } from "../utils/cameraManager";


export default function ReceivePage() {
  const [linkText, setLinkText] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const isMobile = useMemo(() => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      stopScanner();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);


  const startDownload = (urlString: string) => {
    try {
      const url = new URL(urlString);

      if (!url.pathname.includes("/download/")) {
        toast.error("Invalid P2P download link");
        return;
      }

      // Stop camera if running
      stopScanner();
      
      navigate(url.pathname + url.search);
    } catch {
      toast.error("Invalid link format");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLinkText(text);
      toast.success("Link pasted");
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const startScanner = async () => {
    try {
      setShowScanner(true);
      setScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      setCameraStream(stream);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          scanQRCode();
        };
      }

      toast.success("Camera ready - scan QR code");
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access denied");
      setShowScanner(false);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Reset video element
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setShowScanner(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("Missing video/canvas ref");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      console.log("No canvas context");
      return;
    }

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    let frameCount = 0;
    let isScanning = true; // Local variable instead of state

    const scan = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        console.log("Scanning stopped");
        return;
      }

      try {
        frameCount++;
        
        // Check if video is ready
        if (!video.videoWidth || !video.videoHeight) {
          if (frameCount === 5) {
            console.log("Waiting for video...");
          }
          return;
        }

        // Log once when dimensions are available
        if (frameCount === 1) {
          console.log(`Video: ${video.videoWidth}x${video.videoHeight}`);
        }

        // Log every 50 frames
        if (frameCount % 50 === 0) {
          console.log(`Scanning frame ${frameCount}...`);
        }

        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try to decode QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          console.log("QR Found: " + code.data.substring(0, 30));
          isScanning = false; // Stop local scanning
          stopScanner();
          toast.success("QR Code Found!");
          startDownload(code.data);
        }
      } catch (err) {
        console.log("Scan error: " + err);
      }
    };

    console.log("Scan started");
    scanIntervalRef.current = window.setInterval(scan, 100);
    
    // Cleanup function to stop scanning
    return () => {
      isScanning = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-700 text-white"
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">
            Receive File
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isMobile
              ? "Scan QR code or paste link"
              : "Paste secure P2P download link"}
          </p>
        </div>

        {/* QR SCANNER (Mobile & Desktop) */}
        {showScanner ? (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-black border-2 border-blue-500">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-4 border-blue-500 animate-pulse pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 shadow-lg"></div>
              </div>

              {/* Close button */}
              <button
                onClick={stopScanner}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Position QR code within frame
            </p>
          </div>
        ) : (
          <>
            {/* QR Scan Button */}
            <button
              onClick={startScanner}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 py-3 rounded-xl font-semibold hover:scale-105 transition mb-4"
            >
              <Camera size={18} />
              {isMobile ? "Scan QR Code" : "Scan QR Code with Camera"}
            </button>

            {/* Link Input */}
            <div className="relative mb-4">
              <Link className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="https://privyshare.com/download/..."
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePaste}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl text-sm font-medium transition"
              >
                Paste Link
              </button>

              <button
                onClick={() => startDownload(linkText)}
                disabled={!linkText}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:hover:scale-100"
              >
                <Download size={16} />
                Start
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Secure P2P transfer · No server storage
        </p>
      </motion.div>
    </div>
  );
}