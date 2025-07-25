import * as React from "react"

const badgeVariants = {
  default: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-500 text-white hover:bg-gray-600",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-gray-300 text-gray-700",
}

const Badge = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${badgeVariants[variant]} ${className}`}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge, badgeVariants } 