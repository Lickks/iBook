import { d as defineComponent, u as useBookStore, r as ref, w as watch, o as onBeforeUnmount, c as createElementBlock, a as createBaseVNode, b as withDirectives, e as createCommentVNode, v as vModelText, f as openBlock, _ as _export_sfc, g as computed, R as READING_STATUS, h as READING_STATUS_LABEL, F as Fragment, i as renderList, n as normalizeClass, j as normalizeStyle, t as toDisplayString, k as onMounted, l as onUnmounted, m as createTextVNode, p as unref, q as useRouter, s as useUIStore, x as createVNode, y as createBlock } from "./index-BGc2X9_C.js";
import { E as ElMessage } from "./index-CC6Gx0up.js";
const _hoisted_1$3 = { class: "search-bar" };
const _hoisted_2$3 = ["placeholder"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SearchBar",
  props: {
    placeholder: { default: "搜索书名、作者或描述..." }
  },
  setup(__props) {
    const props = __props;
    const bookStore = useBookStore();
    const keyword = ref(bookStore.searchKeyword);
    let debounceTimer = null;
    function triggerSearch(value) {
      bookStore.searchBooks(value);
    }
    watch(
      () => keyword.value,
      (value) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          triggerSearch(value.trim());
        }, 300);
      }
    );
    watch(
      () => bookStore.searchKeyword,
      (newValue) => {
        if (newValue !== keyword.value) {
          keyword.value = newValue;
        }
      }
    );
    function clear() {
      keyword.value = "";
    }
    onBeforeUnmount(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        _cache[1] || (_cache[1] = createBaseVNode("span", { class: "icon" }, "🔍", -1)),
        withDirectives(createBaseVNode("input", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
          type: "text",
          class: "search-input",
          placeholder: props.placeholder,
          autocomplete: "off"
        }, null, 8, _hoisted_2$3), [
          [vModelText, keyword.value]
        ]),
        keyword.value ? (openBlock(), createElementBlock("button", {
          key: 0,
          class: "clear-btn",
          type: "button",
          onClick: clear
        }, " 清空 ")) : createCommentVNode("", true)
      ]);
    };
  }
});
const SearchBar = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-a51ddc33"]]);
const _hoisted_1$2 = { class: "status-stats" };
const _hoisted_2$2 = { class: "stats-grid" };
const _hoisted_3$2 = ["onClick"];
const _hoisted_4$2 = { class: "stat-label" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "StatusStats",
  props: {
    books: {},
    selectedStatus: {}
  },
  emits: ["status-click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const statusStats = computed(() => {
      const stats = {
        all: props.books.length,
        [READING_STATUS.UNREAD]: 0,
        [READING_STATUS.READING]: 0,
        [READING_STATUS.FINISHED]: 0,
        [READING_STATUS.DROPPED]: 0,
        [READING_STATUS.TO_READ]: 0
      };
      props.books.forEach((book) => {
        const status = book.readingStatus || READING_STATUS.UNREAD;
        if (status in stats) {
          stats[status]++;
        }
      });
      return stats;
    });
    const statItems = computed(() => [
      {
        key: "all",
        label: "全部",
        count: statusStats.value.all,
        color: "var(--color-text-primary)",
        active: props.selectedStatus === null
      },
      {
        key: READING_STATUS.UNREAD,
        label: READING_STATUS_LABEL[READING_STATUS.UNREAD],
        count: statusStats.value[READING_STATUS.UNREAD],
        color: "#909399",
        active: props.selectedStatus === READING_STATUS.UNREAD
      },
      {
        key: READING_STATUS.READING,
        label: READING_STATUS_LABEL[READING_STATUS.READING],
        count: statusStats.value[READING_STATUS.READING],
        color: "#409EFF",
        active: props.selectedStatus === READING_STATUS.READING
      },
      {
        key: READING_STATUS.FINISHED,
        label: READING_STATUS_LABEL[READING_STATUS.FINISHED],
        count: statusStats.value[READING_STATUS.FINISHED],
        color: "#67C23A",
        active: props.selectedStatus === READING_STATUS.FINISHED
      },
      {
        key: READING_STATUS.DROPPED,
        label: READING_STATUS_LABEL[READING_STATUS.DROPPED],
        count: statusStats.value[READING_STATUS.DROPPED],
        color: "#F56C6C",
        active: props.selectedStatus === READING_STATUS.DROPPED
      },
      {
        key: READING_STATUS.TO_READ,
        label: READING_STATUS_LABEL[READING_STATUS.TO_READ],
        count: statusStats.value[READING_STATUS.TO_READ],
        color: "#E6A23C",
        active: props.selectedStatus === READING_STATUS.TO_READ
      }
    ]);
    function handleStatClick(status) {
      emit("status-click", status);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(statItems.value, (item) => {
            return openBlock(), createElementBlock("div", {
              key: item.key,
              class: normalizeClass(["stat-item", { active: item.active }]),
              onClick: ($event) => handleStatClick(item.key === "all" ? null : item.key)
            }, [
              createBaseVNode("div", {
                class: "stat-count",
                style: normalizeStyle({ color: item.color })
              }, toDisplayString(item.count), 5),
              createBaseVNode("div", _hoisted_4$2, toDisplayString(item.label), 1)
            ], 10, _hoisted_3$2);
          }), 128))
        ])
      ]);
    };
  }
});
const StatusStats = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-5128313d"]]);
const _hoisted_1$1 = { key: 0 };
const _hoisted_2$1 = { class: "cover" };
const _hoisted_3$1 = ["src", "alt"];
const _hoisted_4$1 = { key: 1 };
const _hoisted_5$1 = { class: "info" };
const _hoisted_6$1 = ["innerHTML"];
const _hoisted_7$1 = { class: "meta" };
const _hoisted_8$1 = ["innerHTML"];
const _hoisted_9$1 = ["innerHTML"];
const _hoisted_10$1 = { class: "stats" };
const _hoisted_11$1 = { class: "status" };
const _hoisted_12$1 = { class: "status-wrapper" };
const _hoisted_13$1 = {
  key: 0,
  class: "status-dropdown"
};
const _hoisted_14$1 = ["onClick"];
const _hoisted_15$1 = {
  key: 0,
  class: "check"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BookCard",
  props: {
    book: {},
    view: { default: "grid" },
    highlight: { default: "" },
    selectable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false }
  },
  emits: ["toggle-select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const bookStore = useBookStore();
    const router = useRouter();
    const showStatusDropdown = ref(false);
    const readingStatusMap = {
      unread: "未读",
      reading: "阅读中",
      finished: "已读完",
      dropped: "弃读",
      "to-read": "待读"
    };
    function escapeHtml(text) {
      return text.replace(/[&<>"']/g, (char) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        };
        return map[char];
      });
    }
    function escapeRegExp(text) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function highlightText(text) {
      if (!text) return "";
      const safe = escapeHtml(text);
      const keyword = props.highlight.trim();
      if (!keyword) return safe;
      const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
      return safe.replace(regex, "<mark>$1</mark>");
    }
    function formatWordCount(count) {
      if (!count) return "—";
      if (count >= 1e4) {
        return `${(count / 1e4).toFixed(1)} 万字`;
      }
      return `${count.toLocaleString()} 字`;
    }
    function coverFallback(title) {
      return title.slice(0, 1).toUpperCase();
    }
    function handleCardClick(event) {
      if (props.selectable) {
        event.preventDefault();
        event.stopPropagation();
        emit("toggle-select", props.book.id);
      } else {
        router.push(`/book/${props.book.id}`);
      }
    }
    async function updateReadingStatus(status) {
      try {
        await bookStore.updateBook(props.book.id, { readingStatus: status });
        ElMessage.success(`状态已更新为：${READING_STATUS_LABEL[status]}`);
        showStatusDropdown.value = false;
      } catch (error) {
        ElMessage.error("更新状态失败");
        console.error("更新阅读状态失败:", error);
      }
    }
    function handleStatusClick(event) {
      event.preventDefault();
      event.stopPropagation();
      showStatusDropdown.value = !showStatusDropdown.value;
    }
    function handleStatusSelect(status, event) {
      event.preventDefault();
      event.stopPropagation();
      if (status !== props.book.readingStatus) {
        updateReadingStatus(status);
      } else {
        showStatusDropdown.value = false;
      }
    }
    function handleSelectIndicatorClick(event) {
      event.preventDefault();
      event.stopPropagation();
      emit("toggle-select", props.book.id);
    }
    function getStatusColor(status) {
      const colorMap = {
        unread: "#909399",
        reading: "#409EFF",
        finished: "#67C23A",
        dropped: "#F56C6C",
        "to-read": "#E6A23C"
      };
      return colorMap[status] || "#909399";
    }
    function handleClickOutside(event) {
      const target = event.target;
      if (!target.closest(".status-wrapper")) {
        showStatusDropdown.value = false;
      }
    }
    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("article", {
        class: normalizeClass(["book-card", [__props.view, { selectable: __props.selectable, selected: __props.selected, "status-dropdown-open": showStatusDropdown.value }]]),
        onClick: handleCardClick
      }, [
        __props.selectable ? (openBlock(), createElementBlock("button", {
          key: 0,
          class: normalizeClass(["select-indicator", { active: __props.selected }]),
          type: "button",
          onClick: handleSelectIndicatorClick
        }, [
          __props.selected ? (openBlock(), createElementBlock("span", _hoisted_1$1, "✔")) : createCommentVNode("", true)
        ], 2)) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_2$1, [
          __props.book.coverUrl ? (openBlock(), createElementBlock("img", {
            key: 0,
            src: __props.book.coverUrl,
            alt: __props.book.title,
            loading: "lazy"
          }, null, 8, _hoisted_3$1)) : (openBlock(), createElementBlock("span", _hoisted_4$1, toDisplayString(coverFallback(__props.book.title)), 1))
        ]),
        createBaseVNode("div", _hoisted_5$1, [
          createBaseVNode("span", {
            class: "title",
            innerHTML: highlightText(__props.book.title)
          }, null, 8, _hoisted_6$1),
          createBaseVNode("p", _hoisted_7$1, [
            createBaseVNode("span", {
              innerHTML: highlightText(__props.book.author || "未知作者")
            }, null, 8, _hoisted_8$1),
            _cache[0] || (_cache[0] = createBaseVNode("span", { class: "dot" }, "•", -1)),
            createBaseVNode("span", null, toDisplayString(__props.book.platform || "未知平台"), 1)
          ]),
          createBaseVNode("p", {
            class: "description",
            innerHTML: highlightText(__props.book.description || "暂无简介")
          }, null, 8, _hoisted_9$1),
          createBaseVNode("div", _hoisted_10$1, [
            createBaseVNode("span", null, toDisplayString(formatWordCount(__props.book.wordCountDisplay)), 1),
            _cache[1] || (_cache[1] = createBaseVNode("span", { class: "dot" }, "•", -1)),
            createBaseVNode("span", null, "评分：" + toDisplayString(__props.book.personalRating ?? "暂无"), 1)
          ])
        ]),
        createBaseVNode("div", _hoisted_11$1, [
          createBaseVNode("div", _hoisted_12$1, [
            createBaseVNode("span", {
              class: "badge clickable",
              style: normalizeStyle({ backgroundColor: getStatusColor(__props.book.readingStatus) }),
              onClick: handleStatusClick
            }, [
              createTextVNode(toDisplayString(readingStatusMap[__props.book.readingStatus]) + " ", 1),
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "arrow" }, "▼", -1))
            ], 4),
            showStatusDropdown.value ? (openBlock(), createElementBlock("div", _hoisted_13$1, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(READING_STATUS_LABEL), (label, key) => {
                return openBlock(), createElementBlock("div", {
                  key,
                  class: normalizeClass(["status-option", { active: key === __props.book.readingStatus }]),
                  style: normalizeStyle({ borderLeftColor: getStatusColor(key) }),
                  onClick: ($event) => handleStatusSelect(key, $event)
                }, [
                  createBaseVNode("span", {
                    class: "status-indicator",
                    style: normalizeStyle({ backgroundColor: getStatusColor(key) })
                  }, null, 4),
                  createTextVNode(" " + toDisplayString(label) + " ", 1),
                  key === __props.book.readingStatus ? (openBlock(), createElementBlock("span", _hoisted_15$1, "✓")) : createCommentVNode("", true)
                ], 14, _hoisted_14$1);
              }), 128))
            ])) : createCommentVNode("", true)
          ])
        ])
      ], 2);
    };
  }
});
const BookCard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ef299ec3"]]);
const _hoisted_1 = { class: "home-view" };
const _hoisted_2 = { class: "section-header" };
const _hoisted_3 = { class: "subtitle" };
const _hoisted_4 = { class: "section-actions" };
const _hoisted_5 = { class: "action-group" };
const _hoisted_6 = { class: "view-switcher" };
const _hoisted_7 = {
  key: 0,
  class: "batch-actions-toolbar"
};
const _hoisted_8 = { class: "batch-select-all" };
const _hoisted_9 = { class: "custom-checkbox" };
const _hoisted_10 = ["checked", "indeterminate"];
const _hoisted_11 = { class: "label-text" };
const _hoisted_12 = {
  key: 0,
  class: "batch-status-actions"
};
const _hoisted_13 = { class: "batch-info" };
const _hoisted_14 = { class: "custom-select-wrapper" };
const _hoisted_15 = ["value"];
const _hoisted_16 = { class: "search-filter-section" };
const _hoisted_17 = {
  key: 1,
  class: "state-card"
};
const _hoisted_18 = {
  key: 2,
  class: "state-card"
};
const _hoisted_19 = {
  key: 0,
  class: "state-card"
};
const _hoisted_20 = { key: 0 };
const _hoisted_21 = { key: 1 };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Home",
  setup(__props) {
    const bookStore = useBookStore();
    const uiStore = useUIStore();
    const router = useRouter();
    const viewMode = computed(() => uiStore.viewMode);
    const hasBooks = computed(() => bookStore.books.length > 0);
    const filteredBooks = computed(() => bookStore.filteredBooks);
    const highlight = computed(() => bookStore.searchKeyword);
    const selectedStatus = computed({
      get: () => bookStore.selectedStatus,
      set: (value) => bookStore.setSelectedStatus(value)
    });
    computed(() => bookStore.statusStats);
    const hasActiveFilters = computed(() => bookStore.hasActiveFilters);
    const selectedBooks = ref([]);
    const selectionMode = ref(false);
    computed(() => selectedBooks.value.length > 0);
    const isAllSelected = computed(() => {
      return filteredBooks.value.length > 0 && selectedBooks.value.length === filteredBooks.value.length;
    });
    const isIndeterminate = computed(() => {
      return selectedBooks.value.length > 0 && selectedBooks.value.length < filteredBooks.value.length;
    });
    function setViewMode(mode) {
      uiStore.setViewMode(mode);
    }
    function goToAdd() {
      router.push("/add");
    }
    function handleStatusClick(status) {
      selectedStatus.value = status;
    }
    function toggleSelectionMode() {
      selectionMode.value = !selectionMode.value;
      selectedBooks.value = [];
    }
    function toggleBookSelection(bookId) {
      const index = selectedBooks.value.indexOf(bookId);
      if (index === -1) {
        selectedBooks.value.push(bookId);
      } else {
        selectedBooks.value.splice(index, 1);
      }
    }
    function toggleSelectAll() {
      if (isAllSelected.value) {
        selectedBooks.value = [];
      } else {
        selectedBooks.value = filteredBooks.value.map((book) => book.id);
      }
    }
    async function handleBatchStatusUpdate(status) {
      if (selectedBooks.value.length === 0) return;
      const selectedCount = selectedBooks.value.length;
      try {
        await bookStore.batchUpdateStatus(selectedBooks.value, status);
        selectedBooks.value = [];
        selectionMode.value = false;
        ElMessage.success(`已将 ${selectedCount} 本书籍状态更新为：${READING_STATUS_LABEL[status]}`);
      } catch (error) {
        ElMessage.error("批量更新状态失败");
        console.error("批量更新阅读状态失败:", error);
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1, [
        createBaseVNode("header", _hoisted_2, [
          createBaseVNode("div", null, [
            _cache[3] || (_cache[3] = createBaseVNode("p", { class: "eyebrow" }, "我的书架", -1)),
            createBaseVNode("h2", null, "共 " + toDisplayString(unref(bookStore).books.length) + " 本书籍", 1),
            createBaseVNode("p", _hoisted_3, "总字数 " + toDisplayString(unref(bookStore).totalWordCount.toLocaleString()) + " 字", 1)
          ]),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("button", {
                type: "button",
                class: normalizeClass(["secondary-btn", { active: selectionMode.value }]),
                onClick: toggleSelectionMode
              }, toDisplayString(selectionMode.value ? "取消选择" : "批量管理"), 3),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: viewMode.value === "grid" }),
                  onClick: _cache[0] || (_cache[0] = ($event) => setViewMode("grid"))
                }, " 网格 ", 2),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: viewMode.value === "list" }),
                  onClick: _cache[1] || (_cache[1] = ($event) => setViewMode("list"))
                }, " 列表 ", 2)
              ])
            ]),
            createBaseVNode("button", {
              class: "primary-btn",
              type: "button",
              onClick: goToAdd
            }, " + 添加书籍 ")
          ])
        ]),
        createVNode(StatusStats, {
          books: unref(bookStore).books,
          "selected-status": selectedStatus.value,
          onStatusClick: handleStatusClick
        }, null, 8, ["books", "selected-status"]),
        selectionMode.value && filteredBooks.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7, [
          createBaseVNode("div", _hoisted_8, [
            createBaseVNode("label", _hoisted_9, [
              createBaseVNode("input", {
                type: "checkbox",
                checked: isAllSelected.value,
                indeterminate: isIndeterminate.value,
                onChange: toggleSelectAll
              }, null, 40, _hoisted_10),
              _cache[4] || (_cache[4] = createBaseVNode("span", { class: "checkmark" }, null, -1)),
              createBaseVNode("span", _hoisted_11, "全选 (" + toDisplayString(selectedBooks.value.length) + "/" + toDisplayString(filteredBooks.value.length) + ")", 1)
            ])
          ]),
          selectedBooks.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12, [
            createBaseVNode("span", _hoisted_13, "已选择 " + toDisplayString(selectedBooks.value.length) + " 本书籍", 1),
            createBaseVNode("div", _hoisted_14, [
              createBaseVNode("select", {
                class: "custom-select",
                onChange: _cache[2] || (_cache[2] = ($event) => handleBatchStatusUpdate($event.target.value))
              }, [
                _cache[5] || (_cache[5] = createBaseVNode("option", {
                  value: "",
                  disabled: "",
                  selected: ""
                }, "批量修改状态", -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(unref(READING_STATUS_LABEL), (label, key) => {
                  return openBlock(), createElementBlock("option", {
                    key,
                    value: key
                  }, toDisplayString(label), 9, _hoisted_15);
                }), 128))
              ], 32)
            ])
          ])) : createCommentVNode("", true)
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_16, [
          createVNode(SearchBar)
        ]),
        unref(bookStore).loading ? (openBlock(), createElementBlock("div", _hoisted_17, [..._cache[6] || (_cache[6] = [
          createBaseVNode("div", { class: "loader" }, null, -1),
          createBaseVNode("p", null, "正在加载书籍...", -1)
        ])])) : !hasBooks.value ? (openBlock(), createElementBlock("div", _hoisted_18, [..._cache[7] || (_cache[7] = [
          createBaseVNode("p", null, "当前没有书籍，点击「添加书籍」开始记录你的阅读旅程。", -1)
        ])])) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
          !filteredBooks.value.length ? (openBlock(), createElementBlock("div", _hoisted_19, [
            hasActiveFilters.value ? (openBlock(), createElementBlock("div", _hoisted_20, [..._cache[8] || (_cache[8] = [
              createBaseVNode("p", null, "没有符合筛选条件的书籍。", -1)
            ])])) : (openBlock(), createElementBlock("p", _hoisted_21, "未找到匹配的书籍，尝试调整搜索关键词。"))
          ])) : (openBlock(), createElementBlock("div", {
            key: 1,
            class: normalizeClass(["book-collection", viewMode.value])
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filteredBooks.value, (book) => {
              return openBlock(), createBlock(BookCard, {
                key: book.id,
                book,
                view: viewMode.value,
                highlight: highlight.value,
                selectable: selectionMode.value,
                selected: selectedBooks.value.includes(book.id),
                onToggleSelect: toggleBookSelection
              }, null, 8, ["book", "view", "highlight", "selectable", "selected"]);
            }), 128))
          ], 2))
        ], 64))
      ]);
    };
  }
});
const Home = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-523968c7"]]);
export {
  Home as default
};
