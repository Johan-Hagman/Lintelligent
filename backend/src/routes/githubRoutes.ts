import { Router } from "express";
import { requireSession } from "../utils/session.js";
import { logger } from "../utils/logger.js";

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
      logger.warn({ status: reposRes.status }, "Failed to fetch repositories");
      return res
        .status(reposRes.status)
        .json({ error: "Failed to fetch repositories" });
    }

    const repos = await reposRes.json();
    res.json(repos);
  } catch (error) {
    logger.error({ err: error }, "GitHub repos error");
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
        logger.warn(
          { status: branchesRes.status },
          "Failed to fetch branches"
        );
        return res
          .status(branchesRes.status)
          .json({ error: "Failed to fetch branches" });
    }

    const branches = await branchesRes.json();
    res.json(branches);
  } catch (error) {
    logger.error({ err: error }, "GitHub branches error");
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
        logger.warn({ status: branchRes.status }, "Failed to fetch branch");
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
        logger.warn({ status: treeRes.status }, "Failed to fetch file tree");
        return res
          .status(treeRes.status)
          .json({ error: "Failed to fetch file tree" });
    }

    const treeData = await treeRes.json();
    res.json(treeData);
  } catch (error) {
    logger.error({ err: error }, "GitHub tree error");
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
        logger.warn(
          { status: contentRes.status },
          "Failed to fetch file content"
        );
        return res
          .status(contentRes.status)
          .json({ error: "Failed to fetch file content" });
    }

    const content = await contentRes.json();
    res.json(content);
  } catch (error) {
    logger.error({ err: error }, "GitHub content error");
    res.status(500).json({ error: "Failed to fetch file content" });
  }
});

export { router as githubRoutes };


