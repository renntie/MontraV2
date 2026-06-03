export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in">
    {Icon && (
      <div className="w-16 h-16 rounded-3xl bg-bg-elevated border border-border
        flex items-center justify-center mb-4
        transition-transform duration-300 hover:scale-110 hover:border-border-strong">
        <Icon size={26} className="text-text-muted" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="text-sm font-bold text-text-primary mb-1.5">{title}</h3>
    {description && (
      <p className="text-xs text-text-muted mb-5 max-w-[220px] leading-relaxed">{description}</p>
    )}
    {action}
  </div>
)
