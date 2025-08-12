"use client";

import clsx from "clsx";

const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rtl:space-x-reverse";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
  secondary: "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700",
  outline: "border border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-gray-400",
  ghost: "text-gray-800 hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({ children, className, variant = "primary", size = "md", ...props }) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

