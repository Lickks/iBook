import { d as defineComponent, r as ref, c as createElementBlock, a as createBaseVNode, b as withDirectives, v as vModelText, E as withKeys, C as withModifiers, t as toDisplayString, m as createTextVNode, F as Fragment, i as renderList, e as createCommentVNode, f as openBlock, _ as _export_sfc, u as useBookStore, n as normalizeClass, x as createVNode, q as useRouter } from "./index-BGc2X9_C.js";
import { s as searchYoushu, B as BookForm, d as downloadCover, f as fetchYoushuDetail } from "./search-DMIniWdO.js";
const _hoisted_1$1 = { class: "network-search" };
const _hoisted_2$1 = { class: "search-controls" };
const _hoisted_3$1 = { class: "input-wrapper" };
const _hoisted_4$1 = ["onKeyup"];
const _hoisted_5 = ["disabled"];
const _hoisted_6 = {
  key: 0,
  class: "feedback error"
};
const _hoisted_7 = {
  key: 1,
  class: "state-card"
};
const _hoisted_8 = {
  key: 2,
  class: "state-card"
};
const _hoisted_9 = {
  key: 3,
  class: "results-list"
};
const _hoisted_10 = { class: "cover" };
const _hoisted_11 = ["src", "alt", "loading", "onError"];
const _hoisted_12 = { key: 1 };
const _hoisted_13 = { class: "content" };
const _hoisted_14 = { class: "meta" };
const _hoisted_15 = { class: "desc" };
const _hoisted_16 = ["href"];
const _hoisted_17 = ["disabled", "onClick"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NetworkSearch",
  props: {
    importing: { type: Boolean, default: false }
  },
  emits: ["import"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const keyword = ref("");
    const loading = ref(false);
    const error = ref("");
    const hasSearched = ref(false);
    const results = ref([]);
    async function handleSearch() {
      if (!keyword.value.trim() || loading.value) return;
      loading.value = true;
      error.value = "";
      try {
        const data = await searchYoushu(keyword.value.trim());
        results.value = data;
        hasSearched.value = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "搜索失败，请稍后重试";
        error.value = message;
        results.value = [];
        hasSearched.value = true;
      } finally {
        loading.value = false;
      }
    }
    function handleImport(result) {
      emit("import", result);
    }
    function formatWordCount(wordCount) {
      if (!wordCount) return "未知字数";
      return wordCount >= 1e4 ? `${(wordCount / 1e4).toFixed(1)} 万字` : `${wordCount.toLocaleString()} 字`;
    }
    function handleCoverError(result) {
      result.cover = "";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3$1, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
              type: "text",
              placeholder: "输入书名或作者，例如：诡秘之主",
              onKeyup: withKeys(withModifiers(handleSearch, ["prevent"]), ["enter"])
            }, null, 40, _hoisted_4$1), [
              [vModelText, keyword.value]
            ])
          ]),
          createBaseVNode("button", {
            type: "button",
            class: "primary-btn",
            disabled: loading.value || !keyword.value.trim(),
            onClick: handleSearch
          }, toDisplayString(loading.value ? "检索中..." : "开始搜索"), 9, _hoisted_5)
        ]),
        _cache[4] || (_cache[4] = createBaseVNode("p", { class: "hint" }, "数据来源：youshu.me，仅供学习交流使用。", -1)),
        error.value ? (openBlock(), createElementBlock("div", _hoisted_6, toDisplayString(error.value), 1)) : loading.value ? (openBlock(), createElementBlock("div", _hoisted_7, [..._cache[1] || (_cache[1] = [
          createBaseVNode("div", { class: "loader" }, null, -1),
          createTextVNode(" 正在爬取搜索结果... ", -1)
        ])])) : !results.value.length && hasSearched.value ? (openBlock(), createElementBlock("div", _hoisted_8, " 暂无搜索结果，尝试更换关键词或缩短关键词长度。 ")) : (openBlock(), createElementBlock("div", _hoisted_9, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(results.value, (result, index) => {
            return openBlock(), createElementBlock("article", {
              key: result.sourceUrl || result.title,
              class: "result-card"
            }, [
              createBaseVNode("div", _hoisted_10, [
                result.cover ? (openBlock(), createElementBlock("img", {
                  key: 0,
                  src: result.cover,
                  alt: result.title,
                  loading: index < 3 ? "eager" : "lazy",
                  onError: ($event) => handleCoverError(result)
                }, null, 40, _hoisted_11)) : (openBlock(), createElementBlock("span", _hoisted_12, toDisplayString(result.title.slice(0, 1).toUpperCase()), 1))
              ]),
              createBaseVNode("div", _hoisted_13, [
                createBaseVNode("header", null, [
                  createBaseVNode("h3", null, toDisplayString(result.title), 1),
                  createBaseVNode("p", _hoisted_14, [
                    createBaseVNode("span", null, toDisplayString(result.author || "未知作者"), 1),
                    _cache[2] || (_cache[2] = createBaseVNode("span", { class: "dot" }, "•", -1)),
                    createBaseVNode("span", null, toDisplayString(result.category || "未知类型"), 1),
                    _cache[3] || (_cache[3] = createBaseVNode("span", { class: "dot" }, "•", -1)),
                    createBaseVNode("span", null, toDisplayString(formatWordCount(result.wordCount)), 1)
                  ])
                ]),
                createBaseVNode("p", _hoisted_15, toDisplayString(result.description || "暂无简介"), 1),
                createBaseVNode("footer", null, [
                  result.sourceUrl ? (openBlock(), createElementBlock("a", {
                    key: 0,
                    class: "ghost-btn",
                    href: result.sourceUrl,
                    target: "_blank",
                    rel: "noreferrer"
                  }, " 查看原站 ", 8, _hoisted_16)) : createCommentVNode("", true),
                  createBaseVNode("button", {
                    class: "primary-btn",
                    type: "button",
                    disabled: props.importing,
                    onClick: ($event) => handleImport(result)
                  }, toDisplayString(props.importing ? "导入中..." : "填充到表单"), 9, _hoisted_17)
                ])
              ])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
});
const NetworkSearch = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4e51ee46"]]);
const _hoisted_1 = { class: "add-book" };
const _hoisted_2 = { class: "tab-switcher" };
const _hoisted_3 = { key: 1 };
const _hoisted_4 = {
  key: 2,
  class: "network-panel"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AddBook",
  setup(__props) {
    const bookStore = useBookStore();
    const router = useRouter();
    const submitting = ref(false);
    const importing = ref(false);
    const feedback = ref(null);
    const activeTab = ref("manual");
    const formInitialValue = ref();
    function switchTab(tab) {
      activeTab.value = tab;
    }
    function roundWordCount(wordCount, step = 1e3) {
      if (!wordCount) return void 0;
      return Math.round(wordCount / step) * step;
    }
    async function handleSubmit(payload) {
      try {
        submitting.value = true;
        const book = await bookStore.createBook(payload);
        feedback.value = { type: "success", message: "书籍创建成功，正在跳转..." };
        setTimeout(() => {
          router.push(`/book/${book.id}`);
        }, 600);
      } catch (error) {
        const message = error instanceof Error ? error.message : "创建书籍失败，请稍后重试";
        feedback.value = {
          type: "error",
          message
        };
      } finally {
        submitting.value = false;
      }
    }
    async function handleImportFromSearch(result) {
      try {
        importing.value = true;
        let coverUrl = result.cover;
        let platform = result.platform;
        let category = result.category;
        if (result.cover) {
          try {
            coverUrl = await downloadCover(result.cover, result.title);
          } catch (coverError) {
            console.warn("封面下载失败，使用原始链接", coverError);
          }
        }
        if ((!platform || platform === "未知平台") && result.sourceUrl) {
          try {
            const detail = await fetchYoushuDetail(result.sourceUrl);
            platform = detail.platform || platform;
            category = category || detail.category;
          } catch (detailError) {
            console.warn("获取作品平台信息失败，保留默认值", detailError);
          }
        }
        formInitialValue.value = {
          title: result.title,
          author: result.author,
          coverUrl,
          platform,
          category,
          description: result.description,
          wordCountDisplay: roundWordCount(result.wordCount),
          wordCountSearch: roundWordCount(result.wordCount),
          sourceUrl: result.sourceUrl,
          wordCountSource: "search"
        };
        feedback.value = {
          type: "success",
          message: "已填充搜索结果，请核对信息后保存。"
        };
        activeTab.value = "manual";
      } catch (error) {
        const message = error instanceof Error ? error.message : "导入搜索结果失败";
        feedback.value = {
          type: "error",
          message
        };
      } finally {
        importing.value = false;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1, [
        _cache[3] || (_cache[3] = createBaseVNode("header", { class: "page-header" }, [
          createBaseVNode("div", null, [
            createBaseVNode("p", { class: "eyebrow" }, "新增书籍"),
            createBaseVNode("h2", null, "手动录入书籍信息"),
            createBaseVNode("p", { class: "subtitle" }, "完善书籍信息，方便后续检索与管理。")
          ])
        ], -1)),
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["tab-btn", { active: activeTab.value === "manual" }]),
            onClick: _cache[0] || (_cache[0] = ($event) => switchTab("manual"))
          }, " 手动录入 ", 2),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["tab-btn", { active: activeTab.value === "online" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => switchTab("online"))
          }, " 从网络检索 ", 2)
        ]),
        feedback.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["feedback", feedback.value.type])
        }, toDisplayString(feedback.value.message), 3)) : createCommentVNode("", true),
        activeTab.value === "manual" ? (openBlock(), createElementBlock("div", _hoisted_3, [
          createVNode(BookForm, {
            "initial-value": formInitialValue.value,
            submitting: submitting.value,
            "submit-label": "保存书籍",
            onSubmit: handleSubmit
          }, null, 8, ["initial-value", "submitting"])
        ])) : (openBlock(), createElementBlock("div", _hoisted_4, [
          createVNode(NetworkSearch, {
            importing: importing.value,
            onImport: handleImportFromSearch
          }, null, 8, ["importing"]),
          _cache[2] || (_cache[2] = createBaseVNode("p", { class: "tip" }, "选择搜索结果后系统会自动下载封面并填充表单。", -1))
        ]))
      ]);
    };
  }
});
const AddBook = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-16013da3"]]);
export {
  AddBook as default
};
