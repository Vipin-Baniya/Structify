const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface TreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  lang?: string;
}

// ─── FETCH REPO TREE ─────────────────────────────────────────────────────────

export async function getRepoTree(
  owner: string,
  repo: string,
  branch = "main"
): Promise<FileNode[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers, next: { revalidate: 120 } }
  );

  if (!res.ok) {
    // Try 'master' if 'main' fails
    if (branch === "main") return getRepoTree(owner, repo, "master");
    throw new Error(`GitHub tree fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const items: TreeItem[] = data.tree || [];

  return buildTree(filterTree(items));
}

// ─── FETCH FILE CONTENT ──────────────────────────────────────────────────────

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<{ content: string; language: string; size: number }> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    { headers, next: { revalidate: 60 } }
  );

  if (!res.ok) throw new Error(`File fetch failed: ${res.status}`);

  const data = await res.json();

  // GitHub returns base64 encoded content
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  const language = detectLanguage(path);

  return { content, language, size: data.size };
}

// ─── FETCH COMMITS ────────────────────────────────────────────────────────────

export async function getRecentCommits(
  owner: string,
  repo: string,
  limit = 5
) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${limit}`,
    { headers, next: { revalidate: 300 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.map((c: any) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
}

// ─── FETCH REPO INFO ─────────────────────────────────────────────────────────

export async function getRepoInfo(owner: string, repo: string) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    { headers, next: { revalidate: 600 } }
  );

  if (!res.ok) return null;

  const d = await res.json();
  return {
    stars: d.stargazers_count,
    forks: d.forks_count,
    language: d.language,
    updatedAt: d.updated_at,
    description: d.description,
    defaultBranch: d.default_branch,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const IGNORE = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out",
  ".DS_Store", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".env", ".env.local", "__pycache__", ".pytest_cache",
  "*.pyc", ".venv", "venv", "target", ".cargo",
]);

function filterTree(items: TreeItem[]): TreeItem[] {
  return items.filter((item) => {
    const parts = item.path.split("/");
    return !parts.some((p) => IGNORE.has(p));
  });
}

function buildTree(items: TreeItem[]): FileNode[] {
  const root: FileNode[] = [];
  const map: Record<string, FileNode> = {};

  // First pass: create all nodes
  items.forEach((item) => {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "folder" : "file",
      ...(item.type === "blob" ? { lang: detectLanguage(name) } : { children: [] }),
    };
    map[item.path] = node;
  });

  // Second pass: build hierarchy
  items.forEach((item) => {
    const parts = item.path.split("/");
    if (parts.length === 1) {
      root.push(map[item.path]);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map[parentPath];
      if (parent?.children) {
        parent.children.push(map[item.path]);
      }
    }
  });

  // Sort: folders first, then files
  const sort = (nodes: FileNode[]): FileNode[] =>
    nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => (n.children ? { ...n, children: sort(n.children) } : n));

  return sort(root);
}

const LANG_MAP: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  py: "python", cpp: "cpp", c: "c", h: "cpp", hpp: "cpp",
  java: "java", rs: "rust", go: "go", rb: "ruby", php: "php",
  cs: "csharp", swift: "swift", kt: "kotlin", scala: "scala",
  md: "markdown", mdx: "markdown", json: "json", yaml: "yaml",
  yml: "yaml", toml: "toml", sh: "shell", bash: "shell",
  html: "html", css: "css", scss: "scss", sql: "sql",
  dockerfile: "dockerfile", txt: "plaintext", env: "plaintext",
  xml: "xml", svg: "xml", m: "matlab", slx: "plaintext",
  ipynb: "json", r: "r",
};

export function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === "dockerfile") return "dockerfile";
  if (lower === "makefile") return "makefile";
  const ext = lower.split(".").pop() || "";
  return LANG_MAP[ext] || "plaintext";
}
