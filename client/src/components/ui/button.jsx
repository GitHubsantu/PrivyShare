// Created by DevOps
// GitHub: https://github.com/githubsantu

export function Button({ children, variant = "default", ...props }) {
  const base = "px-4 py-2 rounded-xl transition font-medium";
  const styles =
    variant === "outline"
      ? "border border-blue-600 text-blue-600 hover:bg-blue-100"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}
