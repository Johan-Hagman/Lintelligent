import { z } from "zod/v3";

export const GetProjectContextInputShape = {
  owner: z.string(),
  repo: z.string(),
  ref: z.string(), // branch or commit SHA
  filePath: z.string(), // path to the file being reviewed
  accessToken: z.string(), // GitHub access token
};

export const GetProjectContextInputSchema = z.object(
  GetProjectContextInputShape
);

export type GetProjectContextInput = z.infer<
  typeof GetProjectContextInputSchema
>;

export interface ProjectContextOutput {
  targetFile: {
    path: string;
    content: string;
  };
  relatedFiles: Array<{
    path: string;
    content: string;
    reason: string; // why this file is relevant
  }>;
  configs: {
    packageJson?: string;
    tsconfigJson?: string;
    eslintrc?: string;
  };
  projectSummary: string;
}

export const ProjectContextOutputSchema = z.object({
  targetFile: z.object({
    path: z.string(),
    content: z.string(),
  }),
  relatedFiles: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      reason: z.string(),
    })
  ),
  configs: z.object({
    packageJson: z.string().optional(),
    tsconfigJson: z.string().optional(),
    eslintrc: z.string().optional(),
  }),
  projectSummary: z.string(),
});

// Parse imports from code content
function parseImports(content: string, filePath: string): string[] {
  const imports: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Match: import ... from "..."
    const importMatch = line.match(/import\s+.*?\s+from\s+["']([^"']+)["']/);
    if (importMatch) {
      imports.push(importMatch[1]);
    }
    // Match: require("...")
    const requireMatch = line.match(/require\(["']([^"']+)["']\)/);
    if (requireMatch) {
      imports.push(requireMatch[1]);
    }
  }

  return imports;
}

const IMPORT_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx"];

// Resolve import path to a list of candidate file paths
function resolveImportCandidates(
  importPath: string,
  currentFilePath: string
): string[] {
  const currentDirParts = currentFilePath.split("/").slice(0, -1);
  const segments = importPath
    .split("/")
    .filter((segment) => segment.length > 0);
  const stack: string[] = [];

  const isRelative =
    importPath.startsWith("./") || importPath.startsWith("../");
  const isAbsolute = importPath.startsWith("/");

  if (!isRelative && !isAbsolute) {
    stack.push("src");
    stack.push(...segments);
  } else if (isAbsolute) {
    stack.push(...segments);
  } else {
    stack.push(...currentDirParts);
    const rawSegments = importPath.split("/");
    for (const segment of rawSegments) {
      if (!segment || segment === ".") continue;
      if (segment === "..") {
        stack.pop();
        continue;
      }
      stack.push(segment);
    }
  }

  const normalizedSegments: string[] = [];
  for (const segment of stack) {
    if (segment === ".") continue;
    if (segment === "..") {
      normalizedSegments.pop();
      continue;
    }
    normalizedSegments.push(segment);
  }

  const normalizedPath = normalizedSegments.join("/");

  if (/\.(js|jsx|ts|tsx)$/i.test(normalizedPath)) {
    return [normalizedPath];
  }

  return IMPORT_EXTENSIONS.map((ext) => `${normalizedPath}${ext}`).filter(
    (candidate, index, self) => candidate && self.indexOf(candidate) === index
  );
}

// Fetch file from GitHub API
async function fetchFileContent(
  owner: string,
  repo: string,
  ref: string,
  path: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.content && data.encoding === "base64") {
      return atob(data.content.replace(/\s/g, ""));
    }
    return null;
  } catch {
    return null;
  }
}

export async function executeGetProjectContext(
  params: GetProjectContextInput
): Promise<ProjectContextOutput> {
  const { owner, repo, ref, filePath, accessToken } = params;

  // 1. Fetch target file
  const targetContent = await fetchFileContent(
    owner,
    repo,
    ref,
    filePath,
    accessToken
  );

  if (!targetContent) {
    // DEBUG: Include params in error to see what we got
    throw new Error(
      `Failed to fetch target file: ${filePath}. Params received: ${JSON.stringify(
        {
          owner,
          repo,
          ref,
          filePath: filePath || "UNDEFINED",
          hasAccessToken: !!accessToken,
        }
      )}`
    );
  }

  // 2. Parse imports from target file
  const imports = parseImports(targetContent, filePath);
  const relatedFiles: Array<{
    path: string;
    content: string;
    reason: string;
  }> = [];

  // 3. Fetch imported files (max 5 to avoid too much context)
  for (const imp of imports.slice(0, 5)) {
    const candidates = resolveImportCandidates(imp, filePath);

    for (const candidate of candidates) {
      const content = await fetchFileContent(
        owner,
        repo,
        ref,
        candidate,
        accessToken
      );
      if (!content) continue;

      relatedFiles.push({
        path: candidate,
        content: content.substring(0, 2000), // Limit content size
        reason: `Imported by ${filePath}`,
      });
      break;
    }
  }

  // 4. Fetch config files
  const configs: {
    packageJson?: string;
    tsconfigJson?: string;
    eslintrc?: string;
  } = {};

  const packageJson = await fetchFileContent(
    owner,
    repo,
    ref,
    "package.json",
    accessToken
  );
  if (packageJson) configs.packageJson = packageJson.substring(0, 1000);

  const tsconfigJson = await fetchFileContent(
    owner,
    repo,
    ref,
    "tsconfig.json",
    accessToken
  );
  if (tsconfigJson) configs.tsconfigJson = tsconfigJson.substring(0, 1000);

  const eslintrc = await fetchFileContent(
    owner,
    repo,
    ref,
    ".eslintrc.json",
    accessToken
  );
  if (!eslintrc) {
    const eslintrcJs = await fetchFileContent(
      owner,
      repo,
      ref,
      ".eslintrc.js",
      accessToken
    );
    if (eslintrcJs) configs.eslintrc = eslintrcJs.substring(0, 1000);
  } else {
    configs.eslintrc = eslintrc.substring(0, 1000);
  }

  // 5. Generate project summary
  const projectSummary = `Project: ${owner}/${repo} (${ref}). Reviewing file: ${filePath}. ${
    relatedFiles.length > 0
      ? `Related files: ${relatedFiles.map((f) => f.path).join(", ")}.`
      : ""
  }`;

  return {
    targetFile: {
      path: filePath,
      content: targetContent,
    },
    relatedFiles,
    configs,
    projectSummary,
  };
}
