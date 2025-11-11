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
  return (
    <nav style={{ marginBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
      <button
        onClick={() => onSelect("paste")}
        style={{
          padding: "10px 20px",
          border: "none",
          backgroundColor: "transparent",
          borderBottom:
            activeTab === "paste" ? "2px solid #3b82f6" : "2px solid transparent",
          color: activeTab === "paste" ? "#3b82f6" : "#6b7280",
          cursor: "pointer",
          fontWeight: activeTab === "paste" ? "600" : "400",
        }}
      >
        Paste Code
      </button>
      <button
        onClick={() => onSelect("repo")}
        disabled={!isAuthenticated}
        style={{
          padding: "10px 20px",
          border: "none",
          backgroundColor: "transparent",
          borderBottom:
            activeTab === "repo" ? "2px solid #3b82f6" : "2px solid transparent",
          color:
            activeTab === "repo"
              ? "#3b82f6"
              : isAuthenticated
              ? "#6b7280"
              : "#d1d5db",
          cursor: isAuthenticated ? "pointer" : "not-allowed",
          fontWeight: activeTab === "repo" ? "600" : "400",
          opacity: isAuthenticated ? 1 : 0.5,
        }}
      >
        Review from Repo
      </button>
    </nav>
  );
}

