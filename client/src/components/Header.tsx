// Created by DevOps
// GitHub: https://github.com/githubsantu
import { ShieldCheck, Github } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
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
        className="text-gray-500 hover:text-blue-600 transition"
      >
        <Github size={22} />
      </a>
    </header>
  );
}
