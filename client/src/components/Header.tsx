// Created by DevOps
// GitHub: https://github.com/githubsantu
import { ShieldCheck, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from '@tauri-apps/plugin-opener';
import toast from "react-hot-toast";

export default function Header() {
  const handleGithubClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTauri()) {
      e.preventDefault();
      try {
        await openUrl("https://github.com/githubsantu");
        toast.success("Opening in browser...");
      } catch (err) {
        console.error("Failed to open link:", err);
        toast.error("Failed to open link:"+ err);
      }
    }
  };
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Left */}
      <Link to="/" className="flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-blue-600" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          PrivyShare
        </span>
      </Link>

      {/* Right */}
      <a
        href="https://github.com/githubsantu"
        target="_blank"
        rel="noreferrer"
        onClick={handleGithubClick}
        className="text-gray-500 hover:text-blue-600 transition"
      >
        <Github size={22} />
      </a>
    </header>
  );
}
