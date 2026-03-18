const PlaceholderPage = ({ title, description }: { title: string; description?: string }) => (
  <div className="space-y-6 max-w-7xl">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className="section-card p-12 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-base font-semibold text-foreground">Coming Soon</h2>
      <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
        This section is under development. Check back soon for updates.
      </p>
    </div>
  </div>
);

export default PlaceholderPage;
