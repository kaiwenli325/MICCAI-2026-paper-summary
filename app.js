const translations = {
  zh: {
    explore: "论文探索", about: "关于项目", eyebrow: "MICCAI 2026 · 论文导航",
    heroTitle: "MICCAI 2026 论文总结",
    heroText: "汇集 MICCAI 2026 接收论文的中英文概述。搜索问题、方法、器官、模态与任务，快速掌握今年的研究版图。",
    startExploring: "开始探索", randomPaper: "随机一篇", acceptedPapers: "篇论文概述", openSource: "项开源代码",
    researchTopics: "个研究主题", bilingual: "中英文双语内容", library: "PAPER LIBRARY",
    findPaperText: "按标题、研究问题、方法或官方分类搜索，支持多条件组合筛选。",
    searchPlaceholder: "搜索论文标题、方法或研究问题…", saved: "已收藏", bodyPart: "身体部位", modality: "成像模态",
    application: "研究任务", methodType: "方法类型", all: "全部", clear: "清除", sortBy: "排序", paperNumber: "论文编号",
    titleAZ: "标题 A–Z", codeFirst: "开源代码优先", noResults: "没有找到匹配的论文", noResultsText: "试试更短的关键词，或清除部分筛选条件。",
    clearFilters: "清除全部筛选", loadMore: "加载更多", aboutProject: "ABOUT THE PROJECT",
    aboutCopy: "本站内容基于 MICCAI 2026 论文的 Abstract 与 Introduction 整理，帮助研究者快速了解每篇工作的核心问题与方法。原始总结开源并持续更新。",
    viewSource: "在 GitHub 查看源项目",
    result: (shown, total) => `找到 ${total.toLocaleString()} 篇论文 · 当前显示 ${shown.toLocaleString()} 篇`,
    remaining: (count) => `（剩余 ${count.toLocaleString()}）`, problem: "问题 / 动机", method: "方法概述", viewSummary: "查看总结",
    paperPage: "论文主页", pdf: "阅读 PDF", code: "查看代码", hasCode: "有开源代码", noCode: "论文总结",
    savedToast: "已加入收藏", removedToast: "已取消收藏", savePaper: "收藏论文", removeSaved: "取消收藏",
  },
  en: {
    explore: "Explore", about: "About", eyebrow: "MICCAI 2026 · PAPER GUIDE",
    heroTitle: "MICCAI 2026 Paper Summaries",
    heroText: "Bilingual summaries of accepted MICCAI 2026 papers. Search problems, methods, anatomy, modalities, and tasks to map this year’s research landscape.",
    startExploring: "Start exploring", randomPaper: "Surprise me", acceptedPapers: "paper summaries", openSource: "open-source projects",
    researchTopics: "research topics", bilingual: "Available in English & Chinese", library: "PAPER LIBRARY",
    findPaperText: "Search titles, research questions, methods, or official categories—and combine filters.",
    searchPlaceholder: "Search titles, methods, or research questions…", saved: "Saved", bodyPart: "Body", modality: "Modality",
    application: "Application", methodType: "Method", all: "All", clear: "Clear", sortBy: "Sort", paperNumber: "Paper number",
    titleAZ: "Title A–Z", codeFirst: "Code available", noResults: "No matching papers", noResultsText: "Try a shorter keyword or remove some filters.",
    clearFilters: "Clear all filters", loadMore: "Load more", aboutProject: "ABOUT THE PROJECT",
    aboutCopy: "The summaries are based on each MICCAI 2026 paper’s Abstract and Introduction, helping researchers quickly understand its central problem and approach. The source project is open and continuously updated.",
    viewSource: "View the source project on GitHub",
    result: (shown, total) => `${total.toLocaleString()} papers found · Showing ${shown.toLocaleString()}`,
    remaining: (count) => `(${count.toLocaleString()} left)`, problem: "Problem / Motivation", method: "Method overview", viewSummary: "View summary",
    paperPage: "Paper page", pdf: "Read PDF", code: "View code", hasCode: "Code available", noCode: "Paper summary",
    savedToast: "Saved to your library", removedToast: "Removed from saved", savePaper: "Save paper", removeSaved: "Remove saved",
  },
};

const groupMap = {
  body: "Body",
  modality: "Modalities",
  application: "Applications",
  ml: "Machine Learning",
};

const elements = {
  list: document.querySelector("#paper-list"),
  search: document.querySelector("#search-input"),
  body: document.querySelector("#filter-body"),
  modality: document.querySelector("#filter-modality"),
  application: document.querySelector("#filter-application"),
  ml: document.querySelector("#filter-ml"),
  sort: document.querySelector("#sort-select"),
  loadMore: document.querySelector("#load-more"),
  remaining: document.querySelector("#remaining-count"),
  resultSummary: document.querySelector("#result-summary"),
  empty: document.querySelector("#empty-state"),
  savedToggle: document.querySelector("#saved-toggle"),
  savedCount: document.querySelector("#saved-count"),
  popularTopics: document.querySelector("#popular-topics"),
  dialog: document.querySelector("#paper-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  toast: document.querySelector("#toast"),
};

const initialParams = new URLSearchParams(location.search);
const browserLanguage = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
const storedLanguage = localStorage.getItem("miccai-language");
const state = {
  language: ["zh", "en"].includes(initialParams.get("lang")) ? initialParams.get("lang") : (storedLanguage || browserLanguage),
  papers: [],
  filtered: [],
  visible: 18,
  saved: new Set(JSON.parse(localStorage.getItem("miccai-saved") || "[]")),
  savedOnly: false,
  topic: "",
};

const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const normalize = (value = "") => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
const t = (key) => translations[state.language][key];

function applyTranslations() {
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key === "heroTitle") element.innerHTML = t(key);
    else element.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-lang]").forEach((button) => button.classList.toggle("active", button.dataset.lang === state.language));
}

function categoryValues(group) {
  const values = new Set();
  state.papers.forEach((paper) => paper.categories.filter((category) => category.group === group).forEach((category) => values.add(category.value)));
  return [...values].sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, group) {
  const previous = select.value;
  select.innerHTML = `<option value="">${escapeHTML(t("all"))}</option>${categoryValues(group).map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("")}`;
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
}

function populateFilters() {
  fillSelect(elements.body, groupMap.body);
  fillSelect(elements.modality, groupMap.modality);
  fillSelect(elements.application, groupMap.application);
  fillSelect(elements.ml, groupMap.ml);
}

function renderTopics() {
  const candidates = ["Brain", "MRI", "Image Segmentation", "Deep Learning", "Foundation Models", "Computer-Aided Diagnosis"];
  elements.popularTopics.innerHTML = candidates.map((topic) => `<button type="button" class="topic-chip${state.topic === topic ? " active" : ""}" data-topic="${escapeHTML(topic)}">${escapeHTML(topic)}</button>`).join("");
}

function buildSearchIndex(paper) {
  return normalize([paper.title, paper.motivation, paper.method, ...paper.categories.map((category) => `${category.group} ${category.value}`)].join(" "));
}

function filterPapers(resetVisible = true) {
  const queryTerms = normalize(elements.search.value).trim().split(/\s+/).filter(Boolean);
  const filters = [
    [groupMap.body, elements.body.value],
    [groupMap.modality, elements.modality.value],
    [groupMap.application, elements.application.value],
    [groupMap.ml, elements.ml.value],
  ];

  state.filtered = state.papers.filter((paper) => {
    if (state.savedOnly && !state.saved.has(paper.id)) return false;
    if (state.topic && !paper.categories.some((category) => category.value === state.topic)) return false;
    if (queryTerms.length && !queryTerms.every((term) => paper._search.includes(term))) return false;
    return filters.every(([group, value]) => !value || paper.categories.some((category) => category.group === group && category.value === value));
  });

  const sort = elements.sort.value;
  if (sort === "title") state.filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "code") state.filtered.sort((a, b) => Number(Boolean(b.links.code)) - Number(Boolean(a.links.code)) || a.id - b.id);
  else state.filtered.sort((a, b) => a.id - b.id);

  if (resetVisible) state.visible = 18;
  renderPapers();
  updateURL();
}

function categoryTags(paper, limit = 2) {
  const shown = paper.categories.slice(0, limit);
  const remainder = paper.categories.length - shown.length;
  return shown.map((category) => `<span class="card-tag">${escapeHTML(category.value)}</span>`).join("") + (remainder > 0 ? `<span class="card-tag">+${remainder}</span>` : "");
}

function cardTemplate(paper, index) {
  const saved = state.saved.has(paper.id);
  return `
    <article class="paper-card" style="animation-delay:${Math.min(index, 12) * 20}ms">
      <div class="card-top">
        <span class="paper-number">PAPER ${String(paper.id).padStart(4, "0")}</span>
        <button class="card-save${saved ? " active" : ""}" type="button" data-save="${paper.id}" aria-label="${escapeHTML(saved ? t("removeSaved") : t("savePaper"))}" title="${escapeHTML(saved ? t("removeSaved") : t("savePaper"))}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z"${saved ? ' fill="currentColor"' : ""}/></svg>
        </button>
      </div>
      <h3 class="card-title">${escapeHTML(paper.title)}</h3>
      <div class="card-tags">${categoryTags(paper)}</div>
      <p class="card-summary">${escapeHTML(paper.method || paper.motivation)}</p>
      <div class="card-footer">
        <span>${paper.links.code ? escapeHTML(t("hasCode")) : escapeHTML(t("noCode"))}</span>
        <div class="card-links">
          ${paper.links.pdf ? `<a href="${escapeHTML(paper.links.pdf)}" target="_blank" rel="noreferrer">PDF</a>` : ""}
          <button class="card-open" type="button" data-open="${paper.id}">${escapeHTML(t("viewSummary"))}</button>
        </div>
      </div>
    </article>`;
}

function renderPapers() {
  const visiblePapers = state.filtered.slice(0, state.visible);
  elements.list.innerHTML = visiblePapers.map(cardTemplate).join("");
  elements.resultSummary.textContent = t("result")(visiblePapers.length, state.filtered.length);
  elements.empty.hidden = state.filtered.length !== 0;
  const remaining = Math.max(0, state.filtered.length - state.visible);
  elements.loadMore.disabled = remaining === 0;
  elements.remaining.textContent = remaining ? t("remaining")(remaining) : "";
  updateSavedUI();
}

function updateStats() {
  document.querySelector("#paper-count").textContent = state.papers.length.toLocaleString();
  document.querySelector("#code-count").textContent = state.papers.filter((paper) => paper.links.code).length.toLocaleString();
  const topics = new Set(state.papers.flatMap((paper) => paper.categories.map((category) => category.value)));
  document.querySelector("#topic-count").textContent = topics.size.toLocaleString();
}

function updateSavedUI() {
  elements.savedCount.textContent = state.saved.size;
  elements.savedToggle.classList.toggle("active", state.savedOnly);
  elements.savedToggle.setAttribute("aria-pressed", state.savedOnly);
}

function savePaper(id) {
  if (state.saved.has(id)) {
    state.saved.delete(id);
    showToast(t("removedToast"));
  } else {
    state.saved.add(id);
    showToast(t("savedToast"));
  }
  localStorage.setItem("miccai-saved", JSON.stringify([...state.saved]));
  if (state.savedOnly) filterPapers(false);
  else renderPapers();
}

function showDialog(id) {
  const paper = state.papers.find((item) => item.id === Number(id));
  if (!paper) return;
  elements.dialogContent.innerHTML = `
    <span class="dialog-number">PAPER ${String(paper.id).padStart(4, "0")}</span>
    <h2 class="dialog-title" id="dialog-title">${escapeHTML(paper.title)}</h2>
    <div class="dialog-tags">${categoryTags(paper, paper.categories.length)}</div>
    <section class="dialog-section"><h3>${escapeHTML(t("problem"))}</h3><p>${escapeHTML(paper.motivation)}</p></section>
    <section class="dialog-section"><h3>${escapeHTML(t("method"))}</h3><p>${escapeHTML(paper.method)}</p></section>
    <div class="dialog-links">
      ${paper.links.paper ? `<a href="${escapeHTML(paper.links.paper)}" target="_blank" rel="noreferrer">${escapeHTML(t("paperPage"))}</a>` : ""}
      ${paper.links.pdf ? `<a href="${escapeHTML(paper.links.pdf)}" target="_blank" rel="noreferrer">${escapeHTML(t("pdf"))}</a>` : ""}
      ${paper.links.code ? `<a href="${escapeHTML(paper.links.code)}" target="_blank" rel="noreferrer">${escapeHTML(t("code"))}</a>` : ""}
    </div>`;
  elements.dialog.showModal();
}

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function clearFilters() {
  elements.search.value = "";
  [elements.body, elements.modality, elements.application, elements.ml].forEach((select) => { select.value = ""; });
  state.topic = "";
  state.savedOnly = false;
  renderTopics();
  filterPapers();
}

function updateURL() {
  const params = new URLSearchParams();
  if (state.language !== browserLanguage) params.set("lang", state.language);
  if (elements.search.value.trim()) params.set("q", elements.search.value.trim());
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
}

async function loadLanguage(language) {
  state.language = language;
  localStorage.setItem("miccai-language", language);
  applyTranslations();
  elements.list.setAttribute("aria-busy", "true");
  try {
    const response = await fetch(`data/papers.${language}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.papers = (await response.json()).map((paper) => ({ ...paper, _search: buildSearchIndex(paper) }));
    populateFilters();
    renderTopics();
    updateStats();
    filterPapers();
  } catch (error) {
    elements.list.innerHTML = `<p>Unable to load paper data. ${escapeHTML(error.message)}</p>`;
  } finally {
    elements.list.removeAttribute("aria-busy");
  }
}

let searchTimer;
elements.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => filterPapers(), 120);
});
[elements.body, elements.modality, elements.application, elements.ml, elements.sort].forEach((control) => control.addEventListener("change", () => filterPapers()));
elements.loadMore.addEventListener("click", () => { state.visible += 18; renderPapers(); });
elements.savedToggle.addEventListener("click", () => { state.savedOnly = !state.savedOnly; filterPapers(); });
document.querySelector("#clear-filters").addEventListener("click", clearFilters);
document.querySelector("#empty-clear").addEventListener("click", clearFilters);
document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.lang !== state.language) loadLanguage(button.dataset.lang);
}));
elements.popularTopics.addEventListener("click", (event) => {
  const button = event.target.closest("[data-topic]");
  if (!button) return;
  state.topic = state.topic === button.dataset.topic ? "" : button.dataset.topic;
  renderTopics();
  filterPapers();
});
elements.list.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save]");
  const openButton = event.target.closest("[data-open]");
  if (saveButton) savePaper(Number(saveButton.dataset.save));
  if (openButton) showDialog(openButton.dataset.open);
});
document.querySelector("#random-paper").addEventListener("click", () => {
  const candidates = state.filtered.length ? state.filtered : state.papers;
  if (candidates.length) showDialog(candidates[Math.floor(Math.random() * candidates.length)].id);
});
document.querySelector(".dialog-close").addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", (event) => { if (event.target === elements.dialog) elements.dialog.close(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});

const preferredTheme = localStorage.getItem("miccai-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.dataset.theme = preferredTheme;
document.querySelector("#theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("miccai-theme", next);
});

elements.search.value = initialParams.get("q") || "";
loadLanguage(state.language);
