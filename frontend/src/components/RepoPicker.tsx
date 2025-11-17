import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SelectMenu, type SelectOption } from "./ui/SelectMenu";
import { API_BASE_URL } from "../utils/api";

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

  const onFileSelectRef = useRef(onFileSelect);
  useEffect(() => {
    onFileSelectRef.current = onFileSelect;
  }, [onFileSelect]);

  const fetchFileContent = useCallback(
    async (repoFullName: string, branch: string, filePath: string) => {
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
          `${API_BASE_URL}/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(
            filePath
          )}&ref=${branch}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.content && data.encoding === "base64") {
            const content = atob(data.content.replace(/\s/g, ""));
            const repoInfo = {
              owner,
              repo,
              ref: branch,
              filePath,
            };
            console.log("Calling onFileSelect with repoInfo:", repoInfo);
            onFileSelectRef.current?.(content, filePath, repoInfo);
          } else {
            console.error("Unexpected content format:", data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch file content:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
  }, [fetchFileContent, selectedRepo, selectedBranch, selectedFile]);

  const fetchRepos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/github/repos`, {
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
        `${API_BASE_URL}/api/github/repos/${owner}/${repo}/branches`,
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
        `${API_BASE_URL}/api/github/repos/${owner}/${repo}/tree/${branch}`,
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

  const repoOptions = useMemo<SelectOption<string>[]>(
    () =>
      repos.map((repo) => ({
        label: repo.full_name,
        value: repo.full_name,
      })),
    [repos]
  );

  const branchOptions = useMemo<SelectOption<string>[]>(
    () =>
      branches.map((branch) => ({
        label: branch.name,
        value: branch.name,
      })),
    [branches]
  );

  const fileOptions = useMemo<SelectOption<string>[]>(
    () =>
      files.map((file) => ({
        label: file.path,
        value: file.path,
      })),
    [files]
  );

  return (
    <section aria-label="Repository selection" className="mb-6 space-y-4">
      <div className="space-y-2">
        <SelectMenu
          label="Select Repo"
          options={repoOptions}
          value={selectedRepo}
          placeholder="-- Select Repository --"
          onChange={setSelectedRepo}
          emptyMessage="No repositories available."
        />
      </div>

      {selectedRepo && (
        <SelectMenu
          label="Select Branch"
          options={branchOptions}
          value={selectedBranch}
          placeholder="-- Select Branch --"
          disabled={loading || branches.length === 0}
          onChange={setSelectedBranch}
          emptyMessage="No branches available."
        />
      )}

      {selectedRepo && selectedBranch && (
        <SelectMenu
          label="Select File"
          options={fileOptions}
          value={selectedFile}
          placeholder="-- Select File --"
          disabled={loading || files.length === 0}
          onChange={setSelectedFile}
          emptyMessage="No matching files found in this branch."
        />
      )}

      {loading && (
        <div className="rounded-lg border border-divider/60 bg-surface-tinted/40 px-4 py-3 text-sm text-text-muted">
          Loading...
        </div>
      )}
    </section>
  );
}
