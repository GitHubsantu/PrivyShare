// Created by DevOps
// GitHub: https://github.com/githubsantu

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Download, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReceivePage() {
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!link.trim()) {
      toast.error("Please paste a download link");
      return;
    }

    try {
      const url = new URL(link);

      if (!url.pathname.includes("/download/")) {
        toast.error("Invalid P2P download link");
        return;
      }

      // 👇 Navigate inside Tauri app
      navigate(url.pathname + url.search);
    } catch (err) {
      toast.error("Invalid link format");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLink(text);
      toast.success("Link pasted from clipboard");
    } catch {
      toast.error("Clipboard access denied");
    }
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
            Paste the secure P2P download link
          </p>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <LinkIcon className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://tauri.localhost/download/..."
            className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:text-blue-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePaste}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl text-sm font-medium transition"
          >
            Paste Link
          </button>

          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 py-3 rounded-xl font-semibold transition"
          >
            <Download size={16} />
            Start Download
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          File will be downloaded securely via P2P
        </p>
      </motion.div>
    </div>
  );
}
