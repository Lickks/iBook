import { d as defineComponent, I as reactive, w as watch, g as computed, c as createElementBlock, C as withModifiers, a as createBaseVNode, b as withDirectives, e as createCommentVNode, v as vModelText, t as toDisplayString, U as vModelSelect, V as createStaticVNode, f as openBlock, _ as _export_sfc } from "./index-BGc2X9_C.js";
const _hoisted_1 = { class: "form-grid" };
const _hoisted_2 = { class: "form-field" };
const _hoisted_3 = {
  key: 0,
  class: "error"
};
const _hoisted_4 = { class: "form-field" };
const _hoisted_5 = { class: "form-field" };
const _hoisted_6 = { class: "form-field upload-field" };
const _hoisted_7 = { class: "form-field" };
const _hoisted_8 = { class: "form-field" };
const _hoisted_9 = { class: "form-field" };
const _hoisted_10 = {
  key: 0,
  class: "error"
};
const _hoisted_11 = { class: "form-field" };
const _hoisted_12 = { class: "form-field" };
const _hoisted_13 = { class: "form-actions" };
const _hoisted_14 = ["disabled"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookForm",
  props: {
    initialValue: {},
    submitting: { type: Boolean, default: false },
    submitLabel: { default: "保存书籍" }
  },
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const form = reactive({
      title: "",
      author: "",
      coverUrl: "",
      platform: "",
      category: "",
      description: "",
      wordCount: "",
      readingStatus: "unread",
      sourceUrl: ""
    });
    const errors = reactive({});
    watch(
      () => props.initialValue,
      (value) => {
        if (!value) return;
        form.title = value.title || "";
        form.author = value.author || "";
        form.coverUrl = value.coverUrl || "";
        form.platform = value.platform || "";
        form.category = value.category || "";
        form.description = value.description || "";
        form.wordCount = value.wordCountDisplay ? String(value.wordCountDisplay) : "";
        form.readingStatus = value.readingStatus || "unread";
        form.sourceUrl = value.sourceUrl || "";
      },
      { immediate: true }
    );
    const disableSubmit = computed(() => props.submitting);
    function validate() {
      errors.title = !form.title.trim() ? "书名为必填项" : "";
      if (form.wordCount) {
        const parsed = Number(form.wordCount);
        errors.wordCount = Number.isNaN(parsed) || parsed < 0 ? "字数需为非负数字" : "";
      } else {
        errors.wordCount = "";
      }
      return !errors.title && !errors.wordCount;
    }
    function handleSubmit() {
      if (!validate()) return;
      const parsedWordCount = form.wordCount ? Number(form.wordCount) : void 0;
      const payload = {
        title: form.title.trim(),
        author: form.author.trim() || void 0,
        coverUrl: form.coverUrl.trim() || void 0,
        platform: form.platform.trim() || void 0,
        category: form.category.trim() || void 0,
        description: form.description.trim() || void 0,
        wordCountDisplay: parsedWordCount !== void 0 && !Number.isNaN(parsedWordCount) ? parsedWordCount : void 0,
        readingStatus: form.readingStatus,
        sourceUrl: form.sourceUrl || void 0
      };
      if (parsedWordCount !== void 0 && !Number.isNaN(parsedWordCount)) {
        const existingSource = props.initialValue?.wordCountSource;
        if (existingSource) {
          payload.wordCountSource = existingSource;
          if (existingSource === "search") {
            payload.wordCountSearch = props.initialValue?.wordCountSearch;
          } else if (existingSource === "document") {
            payload.wordCountDocument = props.initialValue?.wordCountDocument;
          } else if (existingSource === "manual") {
            payload.wordCountManual = parsedWordCount;
          }
        } else {
          payload.wordCountSource = "manual";
          payload.wordCountManual = parsedWordCount;
        }
      }
      emit("submit", payload);
    }
    function handleCoverUpload(event) {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        form.coverUrl = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("form", {
        class: "book-form",
        onSubmit: withModifiers(handleSubmit, ["prevent"])
      }, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("label", _hoisted_2, [
            _cache[8] || (_cache[8] = createBaseVNode("span", null, "书名 *", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.title = $event),
              type: "text",
              placeholder: "请输入书名",
              required: ""
            }, null, 512), [
              [vModelText, form.title]
            ]),
            errors.title ? (openBlock(), createElementBlock("small", _hoisted_3, toDisplayString(errors.title), 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("label", _hoisted_4, [
            _cache[9] || (_cache[9] = createBaseVNode("span", null, "作者", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.author = $event),
              type: "text",
              placeholder: "作者姓名"
            }, null, 512), [
              [vModelText, form.author]
            ])
          ]),
          createBaseVNode("label", _hoisted_5, [
            _cache[10] || (_cache[10] = createBaseVNode("span", null, "封面链接", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.coverUrl = $event),
              type: "url",
              placeholder: "https://example.com/cover.jpg"
            }, null, 512), [
              [vModelText, form.coverUrl]
            ]),
            _cache[11] || (_cache[11] = createBaseVNode("small", null, "支持直接粘贴图片链接或上传文件。", -1))
          ]),
          createBaseVNode("label", _hoisted_6, [
            _cache[12] || (_cache[12] = createBaseVNode("span", null, "封面上传", -1)),
            createBaseVNode("input", {
              type: "file",
              accept: "image/*",
              onChange: handleCoverUpload
            }, null, 32)
          ]),
          createBaseVNode("label", _hoisted_7, [
            _cache[13] || (_cache[13] = createBaseVNode("span", null, "平台", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.platform = $event),
              type: "text",
              placeholder: "起点、纵横..."
            }, null, 512), [
              [vModelText, form.platform]
            ])
          ]),
          createBaseVNode("label", _hoisted_8, [
            _cache[14] || (_cache[14] = createBaseVNode("span", null, "类型", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.category = $event),
              type: "text",
              placeholder: "玄幻、都市..."
            }, null, 512), [
              [vModelText, form.category]
            ])
          ]),
          createBaseVNode("label", _hoisted_9, [
            _cache[15] || (_cache[15] = createBaseVNode("span", null, "字数", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.wordCount = $event),
              type: "number",
              min: "0",
              step: "1000",
              placeholder: "例如：1200000"
            }, null, 512), [
              [vModelText, form.wordCount]
            ]),
            errors.wordCount ? (openBlock(), createElementBlock("small", _hoisted_10, toDisplayString(errors.wordCount), 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("label", _hoisted_11, [
            _cache[17] || (_cache[17] = createBaseVNode("span", null, "阅读状态", -1)),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.readingStatus = $event)
            }, [..._cache[16] || (_cache[16] = [
              createStaticVNode('<option value="unread" data-v-7d9ac8cd>未读</option><option value="reading" data-v-7d9ac8cd>阅读中</option><option value="finished" data-v-7d9ac8cd>已读完</option><option value="dropped" data-v-7d9ac8cd>弃读</option><option value="to-read" data-v-7d9ac8cd>待读</option>', 5)
            ])], 512), [
              [vModelSelect, form.readingStatus]
            ])
          ])
        ]),
        createBaseVNode("label", _hoisted_12, [
          _cache[18] || (_cache[18] = createBaseVNode("span", null, "描述", -1)),
          withDirectives(createBaseVNode("textarea", {
            "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.description = $event),
            rows: "4",
            placeholder: "简介或个人备注"
          }, null, 512), [
            [vModelText, form.description]
          ])
        ]),
        createBaseVNode("div", _hoisted_13, [
          createBaseVNode("button", {
            class: "primary-btn",
            type: "submit",
            disabled: disableSubmit.value
          }, toDisplayString(__props.submitting ? "提交中..." : __props.submitLabel), 9, _hoisted_14)
        ])
      ], 32);
    };
  }
});
const BookForm = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7d9ac8cd"]]);
async function searchYoushu(keyword) {
  const response = await window.api.search.youshu(keyword);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || "搜索书籍失败");
}
async function downloadCover(url, title) {
  const response = await window.api.search.downloadCover(url, title);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || "封面下载失败");
}
async function fetchYoushuDetail(sourceUrl) {
  const response = await window.api.search.detail(sourceUrl);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || "获取作品详情失败");
}
export {
  BookForm as B,
  downloadCover as d,
  fetchYoushuDetail as f,
  searchYoushu as s
};
