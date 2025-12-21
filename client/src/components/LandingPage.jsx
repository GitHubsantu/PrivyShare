// Created by DevOps
// GitHub: https://github.com/githubsantu

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UploadCloud, LinkIcon, LockKeyhole, Upload, Download } from "lucide-react";
import {Link} from "react-router-dom";

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
    title: "Privacy First",
    description: "End-to-end encrypted sharing that keeps your files safe from prying eyes.",
  },
  {
    icon: <UploadCloud className="h-8 w-8 text-blue-600" />,
    title: "Instant Upload",
    description: "Upload files with real-time progress and get a shareable link instantly.",
  },
  {
    icon: <LinkIcon className="h-8 w-8 text-blue-600" />,
    title: "Link Expiry & Controls",
    description: "Set expiry times or download limits to maintain full control.",
  },
  {
    icon: <LockKeyhole className="h-8 w-8 text-blue-600" />,
    title: "No Tracking",
    description: "We don’t log, fingerprint, or analyze your files or links. Ever.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to <span className="text-blue-600">PrivyShare</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-xl text-gray-600 dark:text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Secure, private, and fast file sharing with full control over who sees what.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Link to="/upload">
          <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
            Send File <Upload size={18} />
          </button>
          </Link>
          <Link to="/receive">
          <button className="flex items-center gap-2 px-8 py-3 border border-blue-600 text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            Receive File <Download size={20} />
          </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-blue-600">PrivyShare</span>?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md"
                whileHover={{ scale: 1.03 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
