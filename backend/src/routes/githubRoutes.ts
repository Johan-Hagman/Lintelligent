import { Router } from "express";
import { requireSession } from "../utils/session.js";

const router = Router();

router.use(requireSession);

router.get("/repos", async (_req, res) => {
  const session = res.locals.session!;
  try {
    const reposRes = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!reposRes.ok) {
      return res
        .status(reposRes.status)
        .json({ error: "Failed to fetch repositories" });
    }

    const repos = await reposRes.json();
    res.json(repos);
  } catch (error) {
    console.error("GitHub repos error:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

router.get("/repos/:owner/:repo/branches", async (req, res) => {
  const session = res.locals.session!;
  const { owner, repo } = req.params;
  try {
    const branchesRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!branchesRes.ok) {
      return res
        .status(branchesRes.status)
        .json({ error: "Failed to fetch branches" });
    }

    const branches = await branchesRes.json();
    res.json(branches);
  } catch (error) {
    console.error("GitHub branches error:", error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

router.get("/repos/:owner/:repo/tree/:branch", async (req, res) => {
  const session = res.locals.session!;
  const { owner, repo, branch } = req.params;
  try {
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!branchRes.ok) {
      return res
        .status(branchRes.status)
        .json({ error: "Failed to fetch branch" });
    }

    const branchData = await branchRes.json();
    const treeSha = branchData.commit.sha;

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!treeRes.ok) {
      return res
        .status(treeRes.status)
        .json({ error: "Failed to fetch file tree" });
    }

    const treeData = await treeRes.json();
    res.json(treeData);
  } catch (error) {
    console.error("GitHub tree error:", error);
    res.status(500).json({ error: "Failed to fetch file tree" });
  }
});

router.get("/repos/:owner/:repo/contents", async (req, res) => {
  const session = res.locals.session!;
  const { owner, repo } = req.params;
  const { path, ref } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  try {
    const url = new URL(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    );
    if (ref) {
      url.searchParams.set("ref", String(ref));
    }

    const contentRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${session.ghToken}`,
        Accept: "application/json",
      },
    });

    if (!contentRes.ok) {
      return res
        .status(contentRes.status)
        .json({ error: "Failed to fetch file content" });
    }

    const content = await contentRes.json();
    res.json(content);
  } catch (error) {
    console.error("GitHub content error:", error);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
});

export { router as githubRoutes };


