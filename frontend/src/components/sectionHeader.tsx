const sectionHeader = (id: string, title: string) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
      {id}
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <div className="h-px flex-1 bg-border" />
  </div>
)

export default sectionHeader
