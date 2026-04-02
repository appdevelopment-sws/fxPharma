import React from "react"

type SectionCardProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div>{children}</div>
    </div>
  )
}

export default SectionCard
