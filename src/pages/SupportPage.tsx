export default function SupportPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse the LeagueSuite knowledge base for guides, tutorials, and FAQs.
        </p>
      </div>
      <div className="flex-1 bg-background">
        <iframe
          src="https://hub.leaguesuite.com/kb"
          title="LeagueSuite Knowledge Base"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
