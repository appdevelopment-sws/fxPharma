import React from "react"

type SectionCardProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  className = "",
  action,
}) => {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div>{children}</div>
    </div>
  )
}

export default SectionCard
