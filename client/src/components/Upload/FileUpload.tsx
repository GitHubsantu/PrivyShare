// Created by DevOps
// GitHub: https://github.com/githubsantu
"use client";

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import LinkModal from "../LinkModal";
import { io, Socket } from "socket.io-client";
import { encryptFile } from "../utils/encryptFile";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  // Detect browser once
  const isFirefox = useMemo(() => {
    return typeof navigator !== 'undefined' && 
           navigator.userAgent.toLowerCase().includes('firefox');
  }, []);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const encryptedDataRef = useRef<{ blob: Blob; filename: string; originalName: string } | null>(null);
  const cancelTransferRef = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };
  const handleCancelTransfer = () => {
    cancelTransferRef.current = true;
    
    // Close channel
    if (channelRef.current) {
      try {
        channelRef.current.send(JSON.stringify({ type: "cancel" }));
      } catch (err) {
        console.log("Channel already closed");
      }
      channelRef.current.close();
    }
    
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Reset state
    setUploadProgress(0);
    setUploadSpeed(0);
    setIsTransferring(false);
    setShowPopup(false);
    
    toast.error("Transfer cancelled");
    console.log("❌ Transfer cancelled by user");
  };
  const sendFile = async (channel: RTCDataChannel) => {
    if (!encryptedDataRef.current) {
      console.error("No encrypted data to send");
      return;
    }

    try {
      const { blob, filename, originalName } = encryptedDataRef.current;
      
      const encryptedBuffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(encryptedBuffer);

      console.log("Sending file:", filename, "Size:", uint8.length);

      // Send metadata
      channel.send(
        JSON.stringify({
          type: "meta",
          filename: filename,
          originalName: originalName,
          size: uint8.length,
        })
      );

      // Adaptive chunk size based on browser
      const CHUNK_SIZE = isFirefox ? 64 * 1024 : 256 * 1024;
      const BUFFER_THRESHOLD = isFirefox ? CHUNK_SIZE * 2 : CHUNK_SIZE * 4;
      
      let offset = 0;
      let lastUpdate = Date.now();
      let bytesAtLastUpdate = 0;

      console.log(`Chunk size: ${CHUNK_SIZE / 1024}KB`);

      const sendNextChunk = () => {
        const chunksPerCycle = isFirefox ? 5 : 10;
        
        for (let i = 0; i < chunksPerCycle && offset < uint8.length; i++) {
          if (channel.bufferedAmount > BUFFER_THRESHOLD) {
            setTimeout(sendNextChunk, 10);
            return;
          }

          const chunk = uint8.slice(offset, Math.min(offset + CHUNK_SIZE, uint8.length));
          channel.send(chunk);
          offset += chunk.length;

          const progress = (offset / uint8.length) * 100;
          setUploadProgress(progress);

          const now = Date.now();
          if (now - lastUpdate > 500) {
            const bytesSent = offset - bytesAtLastUpdate;
            const timeDiff = (now - lastUpdate) / 1000;
            const speedMBps = (bytesSent / timeDiff / 1024 / 1024);
            setUploadSpeed(speedMBps);
            lastUpdate = now;
            bytesAtLastUpdate = offset;
          }
        }

        if (offset < uint8.length) {
          setTimeout(sendNextChunk, 0);
        } else {
          channel.send(JSON.stringify({ type: "done" }));
          console.log(`File sent: ${uint8.length} bytes`);
          setUploadProgress(100);
          toast.success("File sent successfully!");
        }
      };

      sendNextChunk();

    } catch (err) {
      console.error("Send error:", err);
      toast.error("Failed to send file");
    }
  };

  const handleGenerateLink = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      toast.loading("Encrypting file...");

      const { encryptedBlob, key } = await encryptFile(file);
      
      encryptedDataRef.current = {
        blob: encryptedBlob,
        filename: file.name + ".enc",
        originalName: file.name
      };

      const socket = io("https://server-restless-voice-9454.fly.dev", {
        transports: ["websocket"],
        upgrade: false,
        reconnection: false
      });
      socketRef.current = socket;

      const roomId = crypto.randomUUID().substring(0, 8);

      const pc = new RTCPeerConnection({
        iceServers: []
      });
      pcRef.current = pc;

      const channel = pc.createDataChannel("file", {
        ordered: true
      });
      channelRef.current = channel;

      channel.binaryType = "arraybuffer";
      channel.bufferedAmountLowThreshold = isFirefox ? 32 * 1024 : 256 * 1024;

      channel.onopen = async () => {
        console.log("✅ Channel opened - starting transfer");
        toast.dismiss();
        toast.success("Connected! Sending file...");
        await sendFile(channel);
      };

      channel.onerror = (error) => {
        console.error("Channel error:", error);
        toast.error("Data channel error or Cancelled");
        setUploadProgress(0);
        setUploadSpeed(0);
        setIsTransferring(false);
        setShowPopup(false);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("📤 Sending ICE:", e.candidate.type);
          socket.emit("ice-candidate", { roomId, candidate: e.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🔗 ICE state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "connected") {
          console.log("✅ P2P connected!");
        }
      };

      let offerSent = false;

      socket.on("connect", () => {
        console.log("🔌 Socket connected");
        socket.emit("join-room", roomId);
        console.log("📍 Joined room:", roomId);
      });

      // CRITICAL: Wait for receiver to join before creating offer
      socket.on("user-joined", async (data) => {
        if (offerSent) return;
        offerSent = true;
        
        console.log("👤 Receiver joined! Creating offer...");
        toast.loading("Receiver connected! Establishing P2P...");
        
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
          console.log("📤 Offer sent");
        } catch (err) {
          console.error("❌ Offer error:", err);
          toast.error("Failed to connect");
        }
      });

      socket.on("answer", async (answer) => {
        console.log("📥 Answer received");
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("✅ Remote description set");
        } catch (err) {
          console.error("❌ Answer error:", err);
        }
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("📥 ICE candidate added");
        } catch (err) {
          console.error("❌ ICE error:", err);
        }
      });

      const link = `${window.location.origin}/download/${roomId}?key=${encodeURIComponent(key)}`;

      toast.dismiss();
      setShareLink(link);
      setShowPopup(true);
      console.log("🔗 Link generated:", link);
      toast.success("Share link ready! Waiting for receiver...");

    } catch (err) {
      console.error("❌ Setup error:", err);
      toast.dismiss();
      toast.error("Setup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-white"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-1">
            P2P File Share
          </h2>
          <p className="text-gray-400 text-sm">Secure & private sharing</p>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-40 px-4 bg-gray-700 border-2 border-dashed border-gray-500 rounded-xl cursor-pointer hover:border-blue-400 transition">
          <UploadCloud className="w-10 h-10 text-blue-400 mb-2" />
          <span className="text-gray-300">Click or drag & drop your file</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <div className="mt-4 bg-gray-700/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">Selected:</p>
            <p className="text-white font-medium truncate">{file.name}</p>
            <p className="text-sm text-gray-400 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4 space-y-3">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Uploading: {uploadProgress.toFixed(1)}%</span>
              <span>{uploadSpeed.toFixed(2)} MB/s</span>
            </div>
            <button
              onClick={handleCancelTransfer}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-2 font-semibold transition"
            >
              Cancel Transfer
            </button>
          </div>
        )}

        <button
          onClick={handleGenerateLink}
          disabled={!file}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl py-3 font-semibold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition"
        >
          Generate P2P Link
        </button>
      </motion.div>

      {showPopup && <LinkModal link={shareLink} onClose={() => setShowPopup(false)} />}
    </div>
  );
}