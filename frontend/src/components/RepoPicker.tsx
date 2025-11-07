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
  onFileSelect: (content: string, path: string) => void;
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
      fetchFileContent(selectedRepo, selectedBranch, selectedFile);
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
            node.type === "blob" &&
            /\.(js|ts|jsx|tsx)$/i.test(node.path)
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
    setLoading(true);
    try {
      const [owner, repo] = repoFullName.split("/");
      const response = await fetch(
        `http://localhost:3001/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(filePath)}&ref=${branch}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        // Decode base64 content (GitHub API returns content as base64)
        if (data.content && data.encoding === "base64") {
          const content = atob(data.content.replace(/\s/g, ""));
          onFileSelect(content, filePath);
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

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
          Select Repo:
        </label>
        <select
          value={selectedRepo || ""}
          onChange={(e) => setSelectedRepo(e.target.value || null)}
          style={{ width: "100%", padding: "8px", fontSize: "14px" }}
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
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
            Select Branch:
          </label>
          <select
            value={selectedBranch || ""}
            onChange={(e) => setSelectedBranch(e.target.value || null)}
            disabled={loading || branches.length === 0}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
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
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
            Select File:
          </label>
          <select
            value={selectedFile || ""}
            onChange={(e) => setSelectedFile(e.target.value || null)}
            disabled={loading || files.length === 0}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
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

      {loading && <div style={{ padding: "10px", color: "#666" }}>Loading...</div>}
    </div>
  );
}

