type ReviewTab = "paste" | "repo";

interface ReviewTabsProps {
  activeTab: ReviewTab;
  onSelect: (tab: ReviewTab) => void;
  isAuthenticated: boolean;
}

export default function ReviewTabs({
  activeTab,
  onSelect,
  isAuthenticated,
}: ReviewTabsProps) {
  const baseButtonClasses =
    "relative border-b-2 border-transparent px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

  return (
    <nav className="mb-5 border-b border-divider/70">
      <button
        type="button"
        onClick={() => onSelect("paste")}
        className={`${baseButtonClasses} ${
          activeTab === "paste"
            ? "border-primary text-primary"
            : "text-text-subtle hover:text-text"
        }`}
        aria-pressed={activeTab === "paste"}
      >
        Paste Code
      </button>
      <button
        type="button"
        onClick={() => onSelect("repo")}
        disabled={!isAuthenticated}
        className={`${baseButtonClasses} ${
          activeTab === "repo"
            ? "border-primary text-primary"
            : isAuthenticated
            ? "text-text-subtle hover:text-text"
            : "cursor-not-allowed text-text-muted opacity-60"
        }`}
        aria-pressed={activeTab === "repo"}
      >
        Review from Repo
      </button>
    </nav>
  );
}
