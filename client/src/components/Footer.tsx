// Created by DevOps
// GitHub: https://github.com/githubsantu
export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm 
      bg-gray-100 text-gray-600 
      dark:bg-gray-900 dark:text-gray-400 
      border-t border-gray-200 dark:border-gray-700">
      
      © {new Date().getFullYear()} <span className="font-semibold">PrivyShare</span> ·
      P2P only · No tracking · Open source
    </footer>
  );
}
