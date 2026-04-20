import React from "react"

type SectionCardProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  size?: "sm" | "md" | "lg" // 👈 new optional prop
}

const sizeStyles = {
  sm: "p-4 text-sm",
  md: "p-5 text-base",
  lg: "p-6 text-lg",
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  className = "",
  action,
  size = "md", // 👈 default
}) => {
  return (
    <div
      className={`rounded-xl border bg-card shadow-sm ${
        sizeStyles[size]
      } ${className}`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-1 text-gray-500">{description}</p>}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div>{children}</div>
    </div>
  )
}

export default SectionCard
