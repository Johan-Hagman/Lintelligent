import { useState, useEffect } from "react";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}

interface Branch {
  name: string;
  commit: {
    sha: string;
  };
}

interface TreeNode {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

interface TreeResponse {
  tree: TreeNode[];
}

export default function RepoPicker({
  onFileSelect,
}: {
  onFileSelect: (
    content: string,
    path: string,
    repoInfo?: { owner: string; repo: string; ref: string; filePath: string }
  ) => void;
}) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [files, setFiles] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches(selectedRepo);
    } else {
      setBranches([]);
      setFiles([]);
      setSelectedBranch(null);
      setSelectedFile(null);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedRepo && selectedBranch) {
      fetchFiles(selectedRepo, selectedBranch);
    } else {
      setFiles([]);
      setSelectedFile(null);
    }
  }, [selectedRepo, selectedBranch]);

  useEffect(() => {
    if (selectedRepo && selectedBranch && selectedFile) {
      console.log("useEffect triggering fetchFileContent:", {
        selectedRepo,
        selectedBranch,
        selectedFile,
      });
      fetchFileContent(selectedRepo, selectedBranch, selectedFile);
    } else {
      console.log("useEffect not triggering - missing:", {
        selectedRepo,
        selectedBranch,
        selectedFile,
      });
    }
  }, [selectedRepo, selectedBranch, selectedFile]);

  const fetchRepos = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/github/repos", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    }
  };

  const fetchBranches = async (repoFullName: string) => {
    setLoading(true);
    try {
      const [owner, repo] = repoFullName.split("/");
      const response = await fetch(
        `http://localhost:3001/api/github/repos/${owner}/${repo}/branches`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (repoFullName: string, branch: string) => {
    setLoading(true);
    try {
      const [owner, repo] = repoFullName.split("/");
      const response = await fetch(
        `http://localhost:3001/api/github/repos/${owner}/${repo}/tree/${branch}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data: TreeResponse = await response.json();
        // Filter only JS/TS files
        const codeFiles = data.tree.filter(
          (node) =>
            node.type === "blob" && /\.(js|ts|jsx|tsx)$/i.test(node.path)
        );
        setFiles(codeFiles);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (
    repoFullName: string,
    branch: string,
    filePath: string
  ) => {
    console.log("fetchFileContent called with:", {
      repoFullName,
      branch,
      filePath,
    });
    if (!filePath) {
      console.error("filePath is missing in fetchFileContent!");
      return;
    }
    setLoading(true);
    try {
      const [owner, repo] = repoFullName.split("/");
      const response = await fetch(
        `http://localhost:3001/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(
          filePath
        )}&ref=${branch}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        // Decode base64 content (GitHub API returns content as base64)
        if (data.content && data.encoding === "base64") {
          const content = atob(data.content.replace(/\s/g, ""));
          const repoInfo = {
            owner,
            repo,
            ref: branch,
            filePath: filePath, // Use the parameter, not a variable
          };
          console.log("Calling onFileSelect with repoInfo:", repoInfo);
          onFileSelect(content, filePath, repoInfo);
        } else {
          console.error("Unexpected content format:", data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch file content:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectClasses =
    "block w-full rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 text-sm text-text shadow-sm transition focus:border-primary focus:outline-none focus-visible:ring-3 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section aria-label="Repository selection" className="mb-6 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-muted">
          Select Repo
        </label>
        <select
          value={selectedRepo || ""}
          onChange={(e) => setSelectedRepo(e.target.value || null)}
          className={selectClasses}
        >
          <option value="">-- Select Repository --</option>
          {repos.map((repo) => (
            <option key={repo.id} value={repo.full_name}>
              {repo.full_name}
            </option>
          ))}
        </select>
      </div>

      {selectedRepo && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Select Branch
          </label>
          <select
            value={selectedBranch || ""}
            onChange={(e) => setSelectedBranch(e.target.value || null)}
            disabled={loading || branches.length === 0}
            className={selectClasses}
          >
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedRepo && selectedBranch && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Select File
          </label>
          <select
            value={selectedFile || ""}
            onChange={(e) => setSelectedFile(e.target.value || null)}
            disabled={loading || files.length === 0}
            className={selectClasses}
          >
            <option value="">-- Select File --</option>
            {files.map((file) => (
              <option key={file.sha} value={file.path}>
                {file.path}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-divider/60 bg-surface-tinted/40 px-4 py-3 text-sm text-text-muted">
          Loading...
        </div>
      )}
    </section>
  );
}
