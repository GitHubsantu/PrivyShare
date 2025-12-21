// Created by DevOps
// GitHub: https://github.com/githubsantu

"use client";

import toast from "react-hot-toast";
import { X, Copy, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface LinkModalProps {
  link: string;
  onClose: () => void;
}

export default function LinkModal({ link, onClose }: LinkModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center text-green-500 mb-2">
          ✅ File Uploaded
        </h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
          Share this secure download link
        </p>

        {/* 🔗 Link box */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <input
            value={link}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none truncate"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("🔗 Link copied!");
            }}
            className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Copy size={16} />
          </button>
        </div>

        {/* 📱 QR CODE */}
        <div className="mt-6 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl shadow">
            <QRCodeCanvas
              value={link}
              size={180}
              level="H"
              includeMargin
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Scan QR to download
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white py-2 text-sm"
          >
            Open <ExternalLink size={14} />
          </a>

          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 text-sm hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
