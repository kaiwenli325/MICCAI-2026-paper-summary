import { mkdir, readFile, writeFile } from "node:fs/promises";

const sourceRepo = "https://raw.githubusercontent.com/kaiwenli325/MICCAI-2026-paper-summary/main";
const localSources = {
  en: process.env.MICCAI_EN_SOURCE,
  zh: process.env.MICCAI_ZH_SOURCE,
};

const fieldNames = {
  en: {
    categories: "Official Categories",
    paper: "Paper Information and Reviews",
    pdf: "PDF",
    code: "Code",
    motivation: "Problem / Motivation",
    method: "Method Overview",
  },
  zh: {
    categories: "官方分类",
    paper: "Paper Information and Reviews",
    pdf: "PDF",
    code: "代码",
    motivation: "问题/动机",
    method: "方法概述",
  },
};

async function loadMarkdown(language) {
  const sourcePath = localSources[language];
  if (sourcePath) return readFile(sourcePath, "utf8");

  const filename = language === "en" ? "README.md" : "README_zh.md";
  const response = await fetch(`${sourceRepo}/${filename}`, { signal: AbortSignal.timeout(60_000) });
  if (response.ok) return response.text();

  const apiResponse = await fetch(`https://api.github.com/repos/kaiwenli325/MICCAI-2026-paper-summary/contents/${filename}`, { signal: AbortSignal.timeout(60_000) });
  if (!apiResponse.ok) throw new Error(`Unable to fetch ${filename}: ${apiResponse.status}`);
  const payload = await apiResponse.json();
  return Buffer.from(payload.content.replace(/\s/g, ""), "base64").toString("utf8");
}

function cleanLabel(label) {
  return label.replace(/[：:]$/, "").trim();
}

function linkFrom(value) {
  return value.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] || value.match(/https?:\/\/\S+/)?.[0] || "";
}

function parseCategories(value) {
  return value
    .split(/[；;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [group, ...rest] = item.split(" -> ");
      return { group: group.trim(), value: rest.join(" -> ").trim() || group.trim() };
    });
}

function parseMarkdown(markdown, language) {
  const labels = fieldNames[language];
  const reverseLabels = Object.fromEntries(Object.entries(labels).map(([key, value]) => [value, key]));
  const sections = markdown.split(/^## /m).slice(1);

  return sections.map((section, index) => {
    const [heading, ...bodyLines] = section.split("\n");
    const headingMatch = heading.trim().match(/^(\d+)\.\s+(.+)$/);
    const fields = {};
    let activeKey = null;

    for (const line of bodyLines) {
      const fieldMatch = line.match(/^- \*\*(.+?)[：:]?\*\*\s*(.*)$/);
      if (fieldMatch) {
        const label = cleanLabel(fieldMatch[1]);
        activeKey = reverseLabels[label] || null;
        if (activeKey) fields[activeKey] = fieldMatch[2].trim();
      } else if (activeKey && line.trim()) {
        fields[activeKey] += ` ${line.trim()}`;
      }
    }

    const id = Number(headingMatch?.[1] || index + 1);
    return {
      id,
      title: headingMatch?.[2]?.trim() || heading.trim(),
      categories: parseCategories(fields.categories || ""),
      links: {
        paper: linkFrom(fields.paper || ""),
        pdf: linkFrom(fields.pdf || ""),
        code: linkFrom(fields.code || ""),
      },
      motivation: fields.motivation || "",
      method: fields.method || "",
    };
  }).filter((paper) => paper.motivation && paper.method);
}

await mkdir("data", { recursive: true });

for (const language of ["en", "zh"]) {
  const markdown = await loadMarkdown(language);
  const papers = parseMarkdown(markdown, language);
  const missing = papers.filter((paper) => !paper.title || !paper.motivation || !paper.method);
  if (missing.length) throw new Error(`${language}: parsed records are incomplete`);
  await writeFile(`data/papers.${language}.json`, `${JSON.stringify(papers)}\n`);
  console.log(`${language}: wrote ${papers.length} papers`);
}
