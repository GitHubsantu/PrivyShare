// Created by DevOps
// GitHub: https://github.com/githubsantu
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

export default function FileDownload() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const roomId = window.location.pathname.split("/").pop();

  const isFirefox = useMemo(() => {
    return typeof navigator !== 'undefined' && 
           navigator.userAgent.toLowerCase().includes('firefox');
  }, []);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chunksRef = useRef<Uint8Array[]>([]);
  const totalSizeRef = useRef(0);
  const receivedRef = useRef(0);
  const filenameRef = useRef("");
  const originalNameRef = useRef("");
  const isProcessingRef = useRef(false);
  const lastUpdateRef = useRef(Date.now());
  const bytesAtLastUpdateRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [status, setStatus] = useState<
    "waiting" | "connecting" | "receiving" | "decrypting" | "done" | "error" | "cancelled"
  >("waiting");
  const cancelledRef = useRef(false);

  const decryptFile = async (
    buffer: ArrayBuffer,
    key: string
  ): Promise<ArrayBuffer> => {
    try {
      const keyBytes = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      
      const iv = buffer.slice(0, 12);
      const data = buffer.slice(12);

      return await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv), tagLength: 128 },
        cryptoKey,
        data
      );
    } catch (err) {
      console.error("Decryption error:", err);
      throw new Error("Decryption failed: " + (err as Error).message);
    }
  };
  const handleCancelDownload = () => {
        cancelledRef.current = true;
        
        if (pcRef.current) {
          pcRef.current.close();
        }
        
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        
        chunksRef.current = [];
        receivedRef.current = 0;
        
        setStatus("cancelled");
        toast.error("Download cancelled");
        console.log("❌ Download cancelled by user");
      };

  const finalizeFile = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setStatus("decrypting");
      setProgress(100);
      toast.loading("Decrypting...");

      const combined = new Uint8Array(receivedRef.current);
      let offset = 0;

      for (const chunk of chunksRef.current) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      console.log(`Combined: ${combined.byteLength} bytes`);

      if (combined.byteLength !== totalSizeRef.current) {
        throw new Error(`Size mismatch: ${combined.byteLength} vs ${totalSizeRef.current}`);
      }

      const decrypted = await decryptFile(combined.buffer, key!);
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = originalNameRef.current || filenameRef.current.replace(/\.enc$/, "") || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.dismiss();
      setStatus("done");
      toast.success("Downloaded!");
    } catch (err) {
      console.error("Finalize error:", err);
      toast.dismiss();
      toast.error("Decryption failed");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!roomId || !key) {
      toast.error("Invalid link");
      setStatus("error");
      return;
    }

    console.log("🔽 Receiver starting, room:", roomId);
    setStatus("connecting");

    const socket = io("https://server-restless-voice-9454.fly.dev", {
      transports: ["websocket"],
      upgrade: false,
      reconnection: false
    });
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    socket.on("connect", () => {
      console.log("🔌 Socket connected");
      socket.emit("join-room", roomId);
      console.log("📍 Joined room:", roomId);
      toast.success("Connected! Waiting for sender...");
      setStatus("waiting");
    });

    // DATA CHANNEL
    pc.ondatachannel = (event) => {
      console.log("📥 Data channel received");
      const channel = event.channel;
      channel.binaryType = "arraybuffer";

      channel.onopen = () => {
        console.log("✅ Channel opened");
        setStatus("receiving");
        toast.success("Receiving file...");
        lastUpdateRef.current = Date.now();
        bytesAtLastUpdateRef.current = 0;
      };

      channel.onmessage = async (e) => {
        if (cancelledRef.current) {
            console.log("❌ Download cancelled, ignoring data");
            return;
          }

          if (typeof e.data === "string") {
            try {
              const meta = JSON.parse(e.data);
              
              // Sender cancel check
              if (meta.type === "cancel") {
                console.log("❌ Sender cancelled transfer");
                toast.error("Sender cancelled the transfer");
                setStatus("cancelled");
                handleCancelDownload();
                return;
              }            
            if (meta.type === "meta") {
              totalSizeRef.current = meta.size;
              filenameRef.current = meta.filename;
              originalNameRef.current = meta.originalName;
              chunksRef.current = [];
              receivedRef.current = 0;
              setProgress(0);
              console.log(`📦 Expecting: ${meta.originalName} (${(meta.size / 1024 / 1024).toFixed(2)} MB)`);
              return;
            }

            if (meta.type === "done") {
              console.log("✅ Transfer complete");
              await finalizeFile();
              return;
            }
          } catch (err) {
            console.error("Metadata error:", err);
          }
          return;
        }

        if (e.data instanceof ArrayBuffer) {
          const chunk = new Uint8Array(e.data);
          chunksRef.current.push(chunk);
          receivedRef.current += chunk.length;

          if (totalSizeRef.current > 0) {
            const percent = (receivedRef.current / totalSizeRef.current) * 100;
            setProgress(Math.min(percent, 99));

            const now = Date.now();
            const updateInterval = isFirefox ? 300 : 500;
            
            if (now - lastUpdateRef.current > updateInterval) {
              const bytesReceived = receivedRef.current - bytesAtLastUpdateRef.current;
              const timeDiff = (now - lastUpdateRef.current) / 1000;
              const speedMBps = (bytesReceived / timeDiff / 1024 / 1024);
              setDownloadSpeed(speedMBps);
              lastUpdateRef.current = now;
              bytesAtLastUpdateRef.current = receivedRef.current;
            }
          }
        }
      };

      channel.onerror = (err) => {
        console.error("Channel error:", err);
        toast.error("Channel error or Cancelled");
        setStatus("cancelled");
      };
    };

    // OFFER/ANSWER
    socket.on("offer", async (offer) => {
      console.log("📥 Offer received");
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
        console.log("📤 Answer sent");
      } catch (err) {
        console.error("❌ Offer error:", err);
        toast.error("Connection failed");
      }
    });

    // ICE CANDIDATES
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("📤 Sending ICE:", e.candidate.type);
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    socket.on("ice-candidate", async (candidate) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("📥 ICE candidate added");
      } catch (err) {
        console.error("❌ ICE error:", err);
      }
    });

    pc.oniceconnectionstatechange = () => {
      console.log("🔗 ICE state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected") {
        console.log("✅ P2P connected!");
      } else if (pc.iceConnectionState === "failed") {
        console.error("❌ ICE failed");
        toast.error("Connection failed");
        setStatus("error");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", pc.connectionState);
    };

    return () => {
      console.log("🧹 Cleanup");
      if (pcRef.current) pcRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, key, isFirefox]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-center mb-4">
          🔒 Receiving File
        </h2>

        {filenameRef.current && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-400">File:</p>
            <p className="text-white truncate">{originalNameRef.current || filenameRef.current}</p>
            {totalSizeRef.current > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Size: {(totalSizeRef.current / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        )}

        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`h-3 transition-all duration-200 ${
              status === "done" ? "bg-green-500" : status === "cancelled" ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Progress: {progress.toFixed(1)}%</span>
          {downloadSpeed > 0 && status === "receiving" && (
            <span className="text-blue-400 font-semibold">{downloadSpeed.toFixed(2)} MB/s</span>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mb-4">
          {status === "connecting" && "Connecting..."}
          {status === "waiting" && "Waiting for sender..."}
          {status === "receiving" && `Receiving: ${(receivedRef.current / 1024 / 1024).toFixed(2)} MB`}
          {status === "decrypting" && "Decrypting..."}
          {status === "done" && "Complete ✅"}
          {status === "error" && "Error ❌"}
        </p>

        {status === "done" && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm mt-1">File saved</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Share Another
            </button>
          </div>
        )}
        {status === "receiving" && (
          <button
            onClick={handleCancelDownload}
            className="w-full bg-red-600 hover:bg-red-700 rounded-lg py-2.5 font-semibold transition-colors mb-4"
          >
            Cancel Download
          </button>
        )}
        {status === "cancelled" && (
          <div className="mt-4 text-center">
            <h3 className="text-orange-400 font-semibold text-lg">⚠️ Cancelled</h3>
            <p className="text-gray-400 text-sm mt-1 mb-4">Transfer was cancelled</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition"
            >
              Try Again
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="mt-4 text-center">
            <p className="text-red-400 text-sm mb-4">Connection failed</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}