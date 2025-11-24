import { z as nextTick, d as defineComponent, A as resolveComponent, y as createBlock, f as openBlock, B as withCtx, b as withDirectives, x as createVNode, a as createBaseVNode, n as normalizeClass, C as withModifiers, j as normalizeStyle, c as createElementBlock, e as createCommentVNode, D as resolveDynamicComponent, t as toDisplayString, E as withKeys, G as renderSlot, H as vShow, m as createTextVNode, T as Transition, g as computed, r as ref, I as reactive, J as markRaw, w as watch, k as onMounted, o as onBeforeUnmount, K as toRefs, L as isFunction, M as isString, N as isVNode, O as render, P as hasOwn, Q as isObject, u as useBookStore, S as useRoute, F as Fragment, i as renderList, q as useRouter, _ as _export_sfc$1 } from "./index-BGc2X9_C.js";
import { B as BookForm, f as fetchYoushuDetail } from "./search-DMIniWdO.js";
import { c as componentSizes, g as getEventCode, a as EVENT_CODE, _ as _export_sfc, T as TypeComponents, b as ElIcon, u as useGlobalComponentSettings, l as loading_default, d as TypeComponentsMap, i as isClient, e as isElement, f as isUndefined, E as ElMessage } from "./index-CC6Gx0up.js";
import { o as obtainAllFocusableElements, E as ElOverlay, a as ElInput, b as ElFocusTrap, c as ElButton, u as useId, d as useDraggable, e as useLockscreen, f as useSameTarget } from "./index-CUCe2A1O.js";
const isValidComponentSize = (val) => ["", ...componentSizes].includes(val);
const FOCUSABLE_CHILDREN = "_trap-focus-children";
const FOCUS_STACK = [];
const FOCUS_HANDLER = (e) => {
  if (FOCUS_STACK.length === 0)
    return;
  const code = getEventCode(e);
  const focusableElement = FOCUS_STACK[FOCUS_STACK.length - 1][FOCUSABLE_CHILDREN];
  if (focusableElement.length > 0 && code === EVENT_CODE.tab) {
    if (focusableElement.length === 1) {
      e.preventDefault();
      if (document.activeElement !== focusableElement[0]) {
        focusableElement[0].focus();
      }
      return;
    }
    const goingBackward = e.shiftKey;
    const isFirst = e.target === focusableElement[0];
    const isLast = e.target === focusableElement[focusableElement.length - 1];
    if (isFirst && goingBackward) {
      e.preventDefault();
      focusableElement[focusableElement.length - 1].focus();
    }
    if (isLast && !goingBackward) {
      e.preventDefault();
      focusableElement[0].focus();
    }
  }
};
const TrapFocus = {
  beforeMount(el) {
    el[FOCUSABLE_CHILDREN] = obtainAllFocusableElements(el);
    FOCUS_STACK.push(el);
    if (FOCUS_STACK.length <= 1) {
      document.addEventListener("keydown", FOCUS_HANDLER);
    }
  },
  updated(el) {
    nextTick(() => {
      el[FOCUSABLE_CHILDREN] = obtainAllFocusableElements(el);
    });
  },
  unmounted() {
    FOCUS_STACK.shift();
    if (FOCUS_STACK.length === 0) {
      document.removeEventListener("keydown", FOCUS_HANDLER);
    }
  }
};
const _sfc_main$1 = defineComponent({
  name: "ElMessageBox",
  directives: {
    TrapFocus
  },
  components: {
    ElButton,
    ElFocusTrap,
    ElInput,
    ElOverlay,
    ElIcon,
    ...TypeComponents
  },
  inheritAttrs: false,
  props: {
    buttonSize: {
      type: String,
      validator: isValidComponentSize
    },
    modal: {
      type: Boolean,
      default: true
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    closeOnHashChange: {
      type: Boolean,
      default: true
    },
    center: Boolean,
    draggable: Boolean,
    overflow: Boolean,
    roundButton: Boolean,
    container: {
      type: String,
      default: "body"
    },
    boxType: {
      type: String,
      default: ""
    }
  },
  emits: ["vanish", "action"],
  setup(props, { emit }) {
    const {
      locale,
      zIndex,
      ns,
      size: btnSize
    } = useGlobalComponentSettings("message-box", computed(() => props.buttonSize));
    const { t } = locale;
    const { nextZIndex } = zIndex;
    const visible = ref(false);
    const state = reactive({
      autofocus: true,
      beforeClose: null,
      callback: null,
      cancelButtonText: "",
      cancelButtonClass: "",
      confirmButtonText: "",
      confirmButtonClass: "",
      customClass: "",
      customStyle: {},
      dangerouslyUseHTMLString: false,
      distinguishCancelAndClose: false,
      icon: "",
      closeIcon: "",
      inputPattern: null,
      inputPlaceholder: "",
      inputType: "text",
      inputValue: "",
      inputValidator: void 0,
      inputErrorMessage: "",
      message: "",
      modalFade: true,
      modalClass: "",
      showCancelButton: false,
      showConfirmButton: true,
      type: "",
      title: void 0,
      showInput: false,
      action: "",
      confirmButtonLoading: false,
      cancelButtonLoading: false,
      confirmButtonLoadingIcon: markRaw(loading_default),
      cancelButtonLoadingIcon: markRaw(loading_default),
      confirmButtonDisabled: false,
      editorErrorMessage: "",
      validateError: false,
      zIndex: nextZIndex()
    });
    const typeClass = computed(() => {
      const type = state.type;
      return { [ns.bm("icon", type)]: type && TypeComponentsMap[type] };
    });
    const contentId = useId();
    const inputId = useId();
    const iconComponent = computed(() => {
      const type = state.type;
      return state.icon || type && TypeComponentsMap[type] || "";
    });
    const hasMessage = computed(() => !!state.message);
    const rootRef = ref();
    const headerRef = ref();
    const focusStartRef = ref();
    const inputRef = ref();
    const confirmRef = ref();
    const confirmButtonClasses = computed(() => state.confirmButtonClass);
    watch(() => state.inputValue, async (val) => {
      await nextTick();
      if (props.boxType === "prompt" && val) {
        validate();
      }
    }, { immediate: true });
    watch(() => visible.value, (val) => {
      var _a, _b;
      if (val) {
        if (props.boxType !== "prompt") {
          if (state.autofocus) {
            focusStartRef.value = (_b = (_a = confirmRef.value) == null ? void 0 : _a.$el) != null ? _b : rootRef.value;
          } else {
            focusStartRef.value = rootRef.value;
          }
        }
        state.zIndex = nextZIndex();
      }
      if (props.boxType !== "prompt")
        return;
      if (val) {
        nextTick().then(() => {
          var _a2;
          if (inputRef.value && inputRef.value.$el) {
            if (state.autofocus) {
              focusStartRef.value = (_a2 = getInputElement()) != null ? _a2 : rootRef.value;
            } else {
              focusStartRef.value = rootRef.value;
            }
          }
        });
      } else {
        state.editorErrorMessage = "";
        state.validateError = false;
      }
    });
    const draggable = computed(() => props.draggable);
    const overflow = computed(() => props.overflow);
    const { isDragging } = useDraggable(rootRef, headerRef, draggable, overflow);
    onMounted(async () => {
      await nextTick();
      if (props.closeOnHashChange) {
        window.addEventListener("hashchange", doClose);
      }
    });
    onBeforeUnmount(() => {
      if (props.closeOnHashChange) {
        window.removeEventListener("hashchange", doClose);
      }
    });
    function doClose() {
      if (!visible.value)
        return;
      visible.value = false;
      nextTick(() => {
        if (state.action)
          emit("action", state.action);
      });
    }
    const handleWrapperClick = () => {
      if (props.closeOnClickModal) {
        handleAction(state.distinguishCancelAndClose ? "close" : "cancel");
      }
    };
    const overlayEvent = useSameTarget(handleWrapperClick);
    const handleInputEnter = (e) => {
      if (state.inputType !== "textarea") {
        e.preventDefault();
        return handleAction("confirm");
      }
    };
    const handleAction = (action) => {
      var _a;
      if (props.boxType === "prompt" && action === "confirm" && !validate()) {
        return;
      }
      state.action = action;
      if (state.beforeClose) {
        (_a = state.beforeClose) == null ? void 0 : _a.call(state, action, state, doClose);
      } else {
        doClose();
      }
    };
    const validate = () => {
      if (props.boxType === "prompt") {
        const inputPattern = state.inputPattern;
        if (inputPattern && !inputPattern.test(state.inputValue || "")) {
          state.editorErrorMessage = state.inputErrorMessage || t("el.messagebox.error");
          state.validateError = true;
          return false;
        }
        const inputValidator = state.inputValidator;
        if (isFunction(inputValidator)) {
          const validateResult = inputValidator(state.inputValue);
          if (validateResult === false) {
            state.editorErrorMessage = state.inputErrorMessage || t("el.messagebox.error");
            state.validateError = true;
            return false;
          }
          if (isString(validateResult)) {
            state.editorErrorMessage = validateResult;
            state.validateError = true;
            return false;
          }
        }
      }
      state.editorErrorMessage = "";
      state.validateError = false;
      return true;
    };
    const getInputElement = () => {
      var _a, _b;
      const inputRefs = (_a = inputRef.value) == null ? void 0 : _a.$refs;
      return (_b = inputRefs == null ? void 0 : inputRefs.input) != null ? _b : inputRefs == null ? void 0 : inputRefs.textarea;
    };
    const handleClose = () => {
      handleAction("close");
    };
    const onCloseRequested = () => {
      if (props.closeOnPressEscape) {
        handleClose();
      }
    };
    if (props.lockScroll) {
      useLockscreen(visible, { ns });
    }
    return {
      ...toRefs(state),
      ns,
      overlayEvent,
      visible,
      hasMessage,
      typeClass,
      contentId,
      inputId,
      btnSize,
      iconComponent,
      confirmButtonClasses,
      rootRef,
      focusStartRef,
      headerRef,
      inputRef,
      isDragging,
      confirmRef,
      doClose,
      handleClose,
      onCloseRequested,
      handleWrapperClick,
      handleInputEnter,
      handleAction,
      t
    };
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_el_icon = resolveComponent("el-icon");
  const _component_el_input = resolveComponent("el-input");
  const _component_el_button = resolveComponent("el-button");
  const _component_el_focus_trap = resolveComponent("el-focus-trap");
  const _component_el_overlay = resolveComponent("el-overlay");
  return openBlock(), createBlock(Transition, {
    name: "fade-in-linear",
    onAfterLeave: ($event) => _ctx.$emit("vanish"),
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createVNode(_component_el_overlay, {
        "z-index": _ctx.zIndex,
        "overlay-class": [_ctx.ns.is("message-box"), _ctx.modalClass],
        mask: _ctx.modal
      }, {
        default: withCtx(() => [
          createBaseVNode("div", {
            role: "dialog",
            "aria-label": _ctx.title,
            "aria-modal": "true",
            "aria-describedby": !_ctx.showInput ? _ctx.contentId : void 0,
            class: normalizeClass(`${_ctx.ns.namespace.value}-overlay-message-box`),
            onClick: _ctx.overlayEvent.onClick,
            onMousedown: _ctx.overlayEvent.onMousedown,
            onMouseup: _ctx.overlayEvent.onMouseup
          }, [
            createVNode(_component_el_focus_trap, {
              loop: "",
              trapped: _ctx.visible,
              "focus-trap-el": _ctx.rootRef,
              "focus-start-el": _ctx.focusStartRef,
              onReleaseRequested: _ctx.onCloseRequested
            }, {
              default: withCtx(() => [
                createBaseVNode("div", {
                  ref: "rootRef",
                  class: normalizeClass([
                    _ctx.ns.b(),
                    _ctx.customClass,
                    _ctx.ns.is("draggable", _ctx.draggable),
                    _ctx.ns.is("dragging", _ctx.isDragging),
                    { [_ctx.ns.m("center")]: _ctx.center }
                  ]),
                  style: normalizeStyle(_ctx.customStyle),
                  tabindex: "-1",
                  onClick: withModifiers(() => {
                  }, ["stop"])
                }, [
                  _ctx.title !== null && _ctx.title !== void 0 ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    ref: "headerRef",
                    class: normalizeClass([_ctx.ns.e("header"), { "show-close": _ctx.showClose }])
                  }, [
                    createBaseVNode("div", {
                      class: normalizeClass(_ctx.ns.e("title"))
                    }, [
                      _ctx.iconComponent && _ctx.center ? (openBlock(), createBlock(_component_el_icon, {
                        key: 0,
                        class: normalizeClass([_ctx.ns.e("status"), _ctx.typeClass])
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(resolveDynamicComponent(_ctx.iconComponent)))
                        ]),
                        _: 1
                      }, 8, ["class"])) : createCommentVNode("v-if", true),
                      createBaseVNode("span", null, toDisplayString(_ctx.title), 1)
                    ], 2),
                    _ctx.showClose ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: normalizeClass(_ctx.ns.e("headerbtn")),
                      "aria-label": _ctx.t("el.messagebox.close"),
                      onClick: ($event) => _ctx.handleAction(_ctx.distinguishCancelAndClose ? "close" : "cancel"),
                      onKeydown: withKeys(withModifiers(($event) => _ctx.handleAction(_ctx.distinguishCancelAndClose ? "close" : "cancel"), ["prevent"]), ["enter"])
                    }, [
                      createVNode(_component_el_icon, {
                        class: normalizeClass(_ctx.ns.e("close"))
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(resolveDynamicComponent(_ctx.closeIcon || "close")))
                        ]),
                        _: 1
                      }, 8, ["class"])
                    ], 42, ["aria-label", "onClick", "onKeydown"])) : createCommentVNode("v-if", true)
                  ], 2)) : createCommentVNode("v-if", true),
                  createBaseVNode("div", {
                    id: _ctx.contentId,
                    class: normalizeClass(_ctx.ns.e("content"))
                  }, [
                    createBaseVNode("div", {
                      class: normalizeClass(_ctx.ns.e("container"))
                    }, [
                      _ctx.iconComponent && !_ctx.center && _ctx.hasMessage ? (openBlock(), createBlock(_component_el_icon, {
                        key: 0,
                        class: normalizeClass([_ctx.ns.e("status"), _ctx.typeClass])
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(resolveDynamicComponent(_ctx.iconComponent)))
                        ]),
                        _: 1
                      }, 8, ["class"])) : createCommentVNode("v-if", true),
                      _ctx.hasMessage ? (openBlock(), createElementBlock("div", {
                        key: 1,
                        class: normalizeClass(_ctx.ns.e("message"))
                      }, [
                        renderSlot(_ctx.$slots, "default", {}, () => [
                          !_ctx.dangerouslyUseHTMLString ? (openBlock(), createBlock(resolveDynamicComponent(_ctx.showInput ? "label" : "p"), {
                            key: 0,
                            for: _ctx.showInput ? _ctx.inputId : void 0,
                            textContent: toDisplayString(_ctx.message)
                          }, null, 8, ["for", "textContent"])) : (openBlock(), createBlock(resolveDynamicComponent(_ctx.showInput ? "label" : "p"), {
                            key: 1,
                            for: _ctx.showInput ? _ctx.inputId : void 0,
                            innerHTML: _ctx.message
                          }, null, 8, ["for", "innerHTML"]))
                        ])
                      ], 2)) : createCommentVNode("v-if", true)
                    ], 2),
                    withDirectives(createBaseVNode("div", {
                      class: normalizeClass(_ctx.ns.e("input"))
                    }, [
                      createVNode(_component_el_input, {
                        id: _ctx.inputId,
                        ref: "inputRef",
                        modelValue: _ctx.inputValue,
                        "onUpdate:modelValue": ($event) => _ctx.inputValue = $event,
                        type: _ctx.inputType,
                        placeholder: _ctx.inputPlaceholder,
                        "aria-invalid": _ctx.validateError,
                        class: normalizeClass({ invalid: _ctx.validateError }),
                        onKeydown: withKeys(_ctx.handleInputEnter, ["enter"])
                      }, null, 8, ["id", "modelValue", "onUpdate:modelValue", "type", "placeholder", "aria-invalid", "class", "onKeydown"]),
                      createBaseVNode("div", {
                        class: normalizeClass(_ctx.ns.e("errormsg")),
                        style: normalizeStyle({
                          visibility: !!_ctx.editorErrorMessage ? "visible" : "hidden"
                        })
                      }, toDisplayString(_ctx.editorErrorMessage), 7)
                    ], 2), [
                      [vShow, _ctx.showInput]
                    ])
                  ], 10, ["id"]),
                  createBaseVNode("div", {
                    class: normalizeClass(_ctx.ns.e("btns"))
                  }, [
                    _ctx.showCancelButton ? (openBlock(), createBlock(_component_el_button, {
                      key: 0,
                      loading: _ctx.cancelButtonLoading,
                      "loading-icon": _ctx.cancelButtonLoadingIcon,
                      class: normalizeClass([_ctx.cancelButtonClass]),
                      round: _ctx.roundButton,
                      size: _ctx.btnSize,
                      onClick: ($event) => _ctx.handleAction("cancel"),
                      onKeydown: withKeys(withModifiers(($event) => _ctx.handleAction("cancel"), ["prevent"]), ["enter"])
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(_ctx.cancelButtonText || _ctx.t("el.messagebox.cancel")), 1)
                      ]),
                      _: 1
                    }, 8, ["loading", "loading-icon", "class", "round", "size", "onClick", "onKeydown"])) : createCommentVNode("v-if", true),
                    withDirectives(createVNode(_component_el_button, {
                      ref: "confirmRef",
                      type: "primary",
                      loading: _ctx.confirmButtonLoading,
                      "loading-icon": _ctx.confirmButtonLoadingIcon,
                      class: normalizeClass([_ctx.confirmButtonClasses]),
                      round: _ctx.roundButton,
                      disabled: _ctx.confirmButtonDisabled,
                      size: _ctx.btnSize,
                      onClick: ($event) => _ctx.handleAction("confirm"),
                      onKeydown: withKeys(withModifiers(($event) => _ctx.handleAction("confirm"), ["prevent"]), ["enter"])
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(_ctx.confirmButtonText || _ctx.t("el.messagebox.confirm")), 1)
                      ]),
                      _: 1
                    }, 8, ["loading", "loading-icon", "class", "round", "disabled", "size", "onClick", "onKeydown"]), [
                      [vShow, _ctx.showConfirmButton]
                    ])
                  ], 2)
                ], 14, ["onClick"])
              ]),
              _: 3
            }, 8, ["trapped", "focus-trap-el", "focus-start-el", "onReleaseRequested"])
          ], 42, ["aria-label", "aria-describedby", "onClick", "onMousedown", "onMouseup"])
        ]),
        _: 3
      }, 8, ["z-index", "overlay-class", "mask"]), [
        [vShow, _ctx.visible]
      ])
    ]),
    _: 3
  }, 8, ["onAfterLeave"]);
}
var MessageBoxConstructor = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "index.vue"]]);
const messageInstance = /* @__PURE__ */ new Map();
const getAppendToElement = (props) => {
  let appendTo = document.body;
  if (props.appendTo) {
    if (isString(props.appendTo)) {
      appendTo = document.querySelector(props.appendTo);
    }
    if (isElement(props.appendTo)) {
      appendTo = props.appendTo;
    }
    if (!isElement(appendTo)) {
      appendTo = document.body;
    }
  }
  return appendTo;
};
const initInstance = (props, container, appContext = null) => {
  const vnode = createVNode(MessageBoxConstructor, props, isFunction(props.message) || isVNode(props.message) ? {
    default: isFunction(props.message) ? props.message : () => props.message
  } : null);
  vnode.appContext = appContext;
  render(vnode, container);
  getAppendToElement(props).appendChild(container.firstElementChild);
  return vnode.component;
};
const genContainer = () => {
  return document.createElement("div");
};
const showMessage = (options, appContext) => {
  const container = genContainer();
  options.onVanish = () => {
    render(null, container);
    messageInstance.delete(vm);
  };
  options.onAction = (action) => {
    const currentMsg = messageInstance.get(vm);
    let resolve;
    if (options.showInput) {
      resolve = { value: vm.inputValue, action };
    } else {
      resolve = action;
    }
    if (options.callback) {
      options.callback(resolve, instance.proxy);
    } else {
      if (action === "cancel" || action === "close") {
        if (options.distinguishCancelAndClose && action !== "cancel") {
          currentMsg.reject("close");
        } else {
          currentMsg.reject("cancel");
        }
      } else {
        currentMsg.resolve(resolve);
      }
    }
  };
  const instance = initInstance(options, container, appContext);
  const vm = instance.proxy;
  for (const prop in options) {
    if (hasOwn(options, prop) && !hasOwn(vm.$props, prop)) {
      if (prop === "closeIcon" && isObject(options[prop])) {
        vm[prop] = markRaw(options[prop]);
      } else {
        vm[prop] = options[prop];
      }
    }
  }
  vm.visible = true;
  return vm;
};
function MessageBox(options, appContext = null) {
  if (!isClient)
    return Promise.reject();
  let callback;
  if (isString(options) || isVNode(options)) {
    options = {
      message: options
    };
  } else {
    callback = options.callback;
  }
  return new Promise((resolve, reject) => {
    const vm = showMessage(options, appContext != null ? appContext : MessageBox._context);
    messageInstance.set(vm, {
      options,
      callback,
      resolve,
      reject
    });
  });
}
const MESSAGE_BOX_VARIANTS = ["alert", "confirm", "prompt"];
const MESSAGE_BOX_DEFAULT_OPTS = {
  alert: { closeOnPressEscape: false, closeOnClickModal: false },
  confirm: { showCancelButton: true },
  prompt: { showCancelButton: true, showInput: true }
};
MESSAGE_BOX_VARIANTS.forEach((boxType) => {
  MessageBox[boxType] = messageBoxFactory(boxType);
});
function messageBoxFactory(boxType) {
  return (message, title, options, appContext) => {
    let titleOrOpts = "";
    if (isObject(title)) {
      options = title;
      titleOrOpts = "";
    } else if (isUndefined(title)) {
      titleOrOpts = "";
    } else {
      titleOrOpts = title;
    }
    return MessageBox(Object.assign({
      title: titleOrOpts,
      message,
      type: "",
      ...MESSAGE_BOX_DEFAULT_OPTS[boxType]
    }, options, {
      boxType
    }), appContext);
  };
}
MessageBox.close = () => {
  messageInstance.forEach((_, vm) => {
    vm.doClose();
  });
  messageInstance.clear();
};
MessageBox._context = null;
const _MessageBox = MessageBox;
_MessageBox.install = (app) => {
  _MessageBox._context = app._context;
  app.config.globalProperties.$msgbox = _MessageBox;
  app.config.globalProperties.$messageBox = _MessageBox;
  app.config.globalProperties.$alert = _MessageBox.alert;
  app.config.globalProperties.$confirm = _MessageBox.confirm;
  app.config.globalProperties.$prompt = _MessageBox.prompt;
};
const ElMessageBox = _MessageBox;
const _hoisted_1 = {
  key: 0,
  class: "book-detail"
};
const _hoisted_2 = { class: "detail-header" };
const _hoisted_3 = { class: "subtitle" };
const _hoisted_4 = { class: "header-actions" };
const _hoisted_5 = {
  key: 0,
  class: "detail-content"
};
const _hoisted_6 = {
  key: 0,
  class: "cover"
};
const _hoisted_7 = ["src", "alt"];
const _hoisted_8 = { class: "info-grid" };
const _hoisted_9 = { class: "description" };
const _hoisted_10 = { class: "document-section" };
const _hoisted_11 = { class: "section-header" };
const _hoisted_12 = ["disabled"];
const _hoisted_13 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_14 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_15 = {
  key: 2,
  class: "documents-list"
};
const _hoisted_16 = { class: "doc-icon" };
const _hoisted_17 = { class: "doc-info" };
const _hoisted_18 = { class: "doc-name" };
const _hoisted_19 = { class: "doc-meta" };
const _hoisted_20 = { class: "doc-actions" };
const _hoisted_21 = ["onClick"];
const _hoisted_22 = ["disabled", "onClick"];
const _hoisted_23 = ["onClick"];
const _hoisted_24 = {
  key: 3,
  class: "word-count-selector"
};
const _hoisted_25 = { class: "word-sources" };
const _hoisted_26 = { class: "source-value" };
const _hoisted_27 = { class: "source-value" };
const _hoisted_28 = { class: "source-value" };
const _hoisted_29 = { class: "word-count-hint" };
const _hoisted_30 = { key: 1 };
const _hoisted_31 = {
  key: 2,
  class: "modal-backdrop"
};
const _hoisted_32 = { class: "modal" };
const _hoisted_33 = { class: "modal-actions" };
const _hoisted_34 = ["disabled"];
const _hoisted_35 = {
  key: 1,
  class: "state-card"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookDetail",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bookStore = useBookStore();
    const isEditing = ref(false);
    const confirmDelete = ref(false);
    const updating = ref(false);
    const deleting = ref(false);
    const detailEnriched = ref(false);
    const documents = ref([]);
    const loadingDocuments = ref(false);
    const uploadingDocument = ref(false);
    const countingWords = ref(false);
    const showWordCountDialog = ref(false);
    ref("manual");
    const bookId = computed(() => Number(route.params.id));
    const statusMap = {
      unread: "未读",
      reading: "阅读中",
      finished: "已读完",
      dropped: "弃读",
      "to-read": "待读"
    };
    function formatWordCount(count) {
      if (!count) return "未知";
      if (count >= 1e4) {
        return `${(count / 1e4).toFixed(1)} 万字`;
      }
      return `${count.toLocaleString()} 字`;
    }
    function roundWordCount(wordCount, step = 1e3) {
      if (!wordCount) return void 0;
      return Math.round(wordCount / step) * step;
    }
    const book = computed(
      () => bookStore.books.find((item) => item.id === bookId.value) || bookStore.currentBook
    );
    async function loadBook() {
      if (!book.value) {
        await bookStore.fetchBookById(bookId.value);
      }
    }
    async function handleUpdate(payload) {
      updating.value = true;
      try {
        await bookStore.updateBook(bookId.value, payload);
        isEditing.value = false;
      } catch (error) {
        console.error(error);
      } finally {
        updating.value = false;
      }
    }
    async function handleDelete() {
      deleting.value = true;
      try {
        await bookStore.deleteBook(bookId.value);
        router.push("/");
      } catch (error) {
        console.error(error);
      } finally {
        deleting.value = false;
        confirmDelete.value = false;
      }
    }
    async function enrichBookFromSource(current) {
      if (!current || detailEnriched.value) {
        return;
      }
      if (current.platform || !current.sourceUrl) {
        detailEnriched.value = true;
        return;
      }
      try {
        const detail = await fetchYoushuDetail(current.sourceUrl);
        const payload = {};
        if (detail.platform) {
          payload.platform = detail.platform;
        }
        if (detail.category && !current.category) {
          payload.category = detail.category;
        }
        if (Object.keys(payload).length > 0) {
          await bookStore.updateBook(current.id, payload);
        }
      } catch (error) {
        console.warn("自动补全平台信息失败", error);
      } finally {
        detailEnriched.value = true;
      }
    }
    async function loadDocuments() {
      if (!book.value) return;
      loadingDocuments.value = true;
      try {
        const result = await window.api.document.getByBookId(bookId.value);
        if (result.success) {
          documents.value = result.data || [];
        }
      } catch (error) {
        console.error("加载文档列表失败:", error);
      } finally {
        loadingDocuments.value = false;
      }
    }
    async function handleUploadDocument() {
      uploadingDocument.value = true;
      try {
        const fileResult = await window.api.document.selectFile();
        if (!fileResult.success || !fileResult.data) {
          return;
        }
        const filePath = fileResult.data;
        const uploadResult = await window.api.document.upload(filePath, bookId.value);
        if (uploadResult.success) {
          ElMessage.success("文档上传成功");
          await loadDocuments();
          const document2 = uploadResult.data;
          if (document2 && document2.wordCount > 0) {
            const roundedWordCount = roundWordCount(document2.wordCount);
            if (roundedWordCount) {
              await ElMessageBox.confirm(
                `检测到文档字数为 ${formatWordCount(roundedWordCount)}，是否使用此字数作为书籍字数？`,
                "提示",
                {
                  confirmButtonText: "是",
                  cancelButtonText: "否",
                  type: "info"
                }
              ).then(async () => {
                await handleSetWordCountSource("document", roundedWordCount);
              }).catch(() => {
              });
            }
          }
        } else {
          ElMessage.error(uploadResult.error || "文档上传失败");
        }
      } catch (error) {
        console.error("上传文档失败:", error);
        ElMessage.error(error?.message || "上传文档失败");
      } finally {
        uploadingDocument.value = false;
      }
    }
    async function handleDeleteDocument(document2) {
      try {
        await ElMessageBox.confirm(`确定删除文档 "${document2.fileName}" 吗？此操作不可恢复。`, "确认删除", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning"
        });
        const result = await window.api.document.delete(document2.id);
        if (result.success) {
          ElMessage.success("文档删除成功");
          await loadDocuments();
        } else {
          ElMessage.error(result.error || "文档删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除文档失败:", error);
          ElMessage.error(error?.message || "删除文档失败");
        }
      }
    }
    async function handleOpenDocument(document2) {
      try {
        const result = await window.api.document.open(document2.filePath);
        if (!result.success) {
          ElMessage.error(result.error || "打开文档失败");
        }
      } catch (error) {
        console.error("打开文档失败:", error);
        ElMessage.error(error?.message || "打开文档失败");
      }
    }
    async function handleCountWords(document2) {
      countingWords.value = true;
      try {
        const result = await window.api.document.countWords(document2.filePath);
        if (result.success) {
          ElMessage.success(`字数统计完成：${formatWordCount(result.data)}`);
          await loadDocuments();
        } else {
          ElMessage.error(result.error || "字数统计失败");
        }
      } catch (error) {
        console.error("字数统计失败:", error);
        ElMessage.error(error?.message || "字数统计失败");
      } finally {
        countingWords.value = false;
      }
    }
    async function handleSetWordCountSource(source, wordCount) {
      if (!book.value) return;
      try {
        const updateData = {
          wordCountSource: source,
          wordCountDisplay: wordCount
        };
        if (source === "document") {
          updateData.wordCountDocument = wordCount;
        } else if (source === "manual") {
          updateData.wordCountManual = wordCount;
        } else if (source === "search") {
          updateData.wordCountSearch = wordCount;
        }
        await bookStore.updateBook(bookId.value, updateData);
        ElMessage.success("字数来源已更新");
        showWordCountDialog.value = false;
      } catch (error) {
        console.error("更新字数来源失败:", error);
        ElMessage.error("更新字数来源失败");
      }
    }
    function formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    const wordCountInfo = computed(() => {
      if (!book.value) return null;
      const docWordCount = documents.value.reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
      const searchWordCount = book.value.wordCountSearch || 0;
      const manualWordCount = book.value.wordCountManual || 0;
      const currentSource = book.value.wordCountSource || "manual";
      return {
        document: docWordCount,
        search: searchWordCount,
        manual: manualWordCount,
        current: book.value.wordCountDisplay || 0,
        source: currentSource
      };
    });
    onMounted(() => {
      loadBook();
      loadDocuments();
    });
    watch(
      () => book.value,
      (current) => {
        void enrichBookFromSource(current);
      },
      { immediate: true }
    );
    watch(
      () => bookId.value,
      () => {
        loadDocuments();
      }
    );
    return (_ctx, _cache) => {
      return book.value ? (openBlock(), createElementBlock("section", _hoisted_1, [
        createBaseVNode("header", _hoisted_2, [
          createBaseVNode("div", null, [
            _cache[6] || (_cache[6] = createBaseVNode("p", { class: "eyebrow" }, "书籍详情", -1)),
            createBaseVNode("h2", null, toDisplayString(book.value.title), 1),
            createBaseVNode("p", _hoisted_3, toDisplayString(book.value.author || "未知作者") + " · " + toDisplayString(book.value.platform || "未知平台"), 1)
          ]),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("button", {
              class: "ghost-btn",
              type: "button",
              onClick: _cache[0] || (_cache[0] = ($event) => isEditing.value = !isEditing.value)
            }, toDisplayString(isEditing.value ? "取消编辑" : "编辑"), 1),
            createBaseVNode("button", {
              class: "danger-btn",
              type: "button",
              onClick: _cache[1] || (_cache[1] = ($event) => confirmDelete.value = true)
            }, "删除")
          ])
        ]),
        !isEditing.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
          book.value.coverUrl ? (openBlock(), createElementBlock("div", _hoisted_6, [
            createBaseVNode("img", {
              src: book.value.coverUrl,
              alt: book.value.title
            }, null, 8, _hoisted_7)
          ])) : createCommentVNode("", true),
          createBaseVNode("ul", _hoisted_8, [
            createBaseVNode("li", null, [
              _cache[7] || (_cache[7] = createBaseVNode("span", null, "分类", -1)),
              createTextVNode(toDisplayString(book.value.category || "未设置"), 1)
            ]),
            createBaseVNode("li", null, [
              _cache[8] || (_cache[8] = createBaseVNode("span", null, "字数", -1)),
              createTextVNode(toDisplayString(formatWordCount(book.value.wordCountDisplay)), 1)
            ]),
            createBaseVNode("li", null, [
              _cache[9] || (_cache[9] = createBaseVNode("span", null, "阅读状态", -1)),
              createTextVNode(toDisplayString(statusMap[book.value.readingStatus] || book.value.readingStatus), 1)
            ]),
            createBaseVNode("li", null, [
              _cache[10] || (_cache[10] = createBaseVNode("span", null, "评分", -1)),
              createTextVNode(toDisplayString(book.value.personalRating ?? "暂无"), 1)
            ]),
            createBaseVNode("li", null, [
              _cache[11] || (_cache[11] = createBaseVNode("span", null, "创建时间", -1)),
              createTextVNode(toDisplayString(book.value.createdAt), 1)
            ]),
            createBaseVNode("li", null, [
              _cache[12] || (_cache[12] = createBaseVNode("span", null, "更新时间", -1)),
              createTextVNode(toDisplayString(book.value.updatedAt), 1)
            ])
          ]),
          createBaseVNode("article", _hoisted_9, [
            _cache[13] || (_cache[13] = createBaseVNode("h3", null, "简介", -1)),
            createBaseVNode("p", null, toDisplayString(book.value.description || "暂无简介"), 1)
          ]),
          createBaseVNode("section", _hoisted_10, [
            createBaseVNode("div", _hoisted_11, [
              _cache[14] || (_cache[14] = createBaseVNode("h3", null, "文档管理", -1)),
              createBaseVNode("button", {
                class: "primary-btn",
                type: "button",
                disabled: uploadingDocument.value,
                onClick: handleUploadDocument
              }, toDisplayString(uploadingDocument.value ? "上传中..." : "上传文档"), 9, _hoisted_12)
            ]),
            loadingDocuments.value ? (openBlock(), createElementBlock("div", _hoisted_13, "加载中...")) : documents.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_14, [..._cache[15] || (_cache[15] = [
              createBaseVNode("p", null, "暂无文档，点击上方按钮上传", -1),
              createBaseVNode("p", { class: "hint" }, "支持 TXT、EPUB、PDF、DOCX 格式", -1)
            ])])) : (openBlock(), createElementBlock("div", _hoisted_15, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(documents.value, (doc) => {
                return openBlock(), createElementBlock("div", {
                  key: doc.id,
                  class: "document-item"
                }, [
                  createBaseVNode("div", _hoisted_16, [
                    createBaseVNode("span", null, toDisplayString(doc.fileType.toUpperCase()), 1)
                  ]),
                  createBaseVNode("div", _hoisted_17, [
                    createBaseVNode("p", _hoisted_18, toDisplayString(doc.fileName), 1),
                    createBaseVNode("p", _hoisted_19, toDisplayString(formatFileSize(doc.fileSize)) + " · " + toDisplayString(formatWordCount(doc.wordCount)) + " · " + toDisplayString(doc.uploadedAt), 1)
                  ]),
                  createBaseVNode("div", _hoisted_20, [
                    createBaseVNode("button", {
                      class: "action-btn",
                      type: "button",
                      onClick: ($event) => handleOpenDocument(doc)
                    }, " 打开 ", 8, _hoisted_21),
                    createBaseVNode("button", {
                      class: "action-btn",
                      type: "button",
                      disabled: countingWords.value,
                      onClick: ($event) => handleCountWords(doc)
                    }, " 统计字数 ", 8, _hoisted_22),
                    createBaseVNode("button", {
                      class: "action-btn danger",
                      type: "button",
                      onClick: ($event) => handleDeleteDocument(doc)
                    }, " 删除 ", 8, _hoisted_23)
                  ])
                ]);
              }), 128))
            ])),
            wordCountInfo.value ? (openBlock(), createElementBlock("div", _hoisted_24, [
              _cache[19] || (_cache[19] = createBaseVNode("h4", null, "字数来源选择", -1)),
              createBaseVNode("div", _hoisted_25, [
                createBaseVNode("div", {
                  class: normalizeClass(["source-item", { active: wordCountInfo.value.source === "manual" }]),
                  onClick: _cache[2] || (_cache[2] = ($event) => handleSetWordCountSource("manual", wordCountInfo.value.manual))
                }, [
                  _cache[16] || (_cache[16] = createBaseVNode("span", { class: "source-label" }, "手动输入", -1)),
                  createBaseVNode("span", _hoisted_26, toDisplayString(formatWordCount(wordCountInfo.value.manual)), 1)
                ], 2),
                createBaseVNode("div", {
                  class: normalizeClass(["source-item", { active: wordCountInfo.value.source === "search" }]),
                  onClick: _cache[3] || (_cache[3] = ($event) => handleSetWordCountSource("search", wordCountInfo.value.search))
                }, [
                  _cache[17] || (_cache[17] = createBaseVNode("span", { class: "source-label" }, "网络检索", -1)),
                  createBaseVNode("span", _hoisted_27, toDisplayString(formatWordCount(wordCountInfo.value.search)), 1)
                ], 2),
                createBaseVNode("div", {
                  class: normalizeClass(["source-item", { active: wordCountInfo.value.source === "document" }]),
                  onClick: _cache[4] || (_cache[4] = ($event) => handleSetWordCountSource("document", wordCountInfo.value.document))
                }, [
                  _cache[18] || (_cache[18] = createBaseVNode("span", { class: "source-label" }, "文档统计", -1)),
                  createBaseVNode("span", _hoisted_28, toDisplayString(formatWordCount(wordCountInfo.value.document)), 1)
                ], 2)
              ]),
              createBaseVNode("p", _hoisted_29, " 当前使用: " + toDisplayString(wordCountInfo.value.source === "manual" ? "手动输入" : wordCountInfo.value.source === "search" ? "网络检索" : "文档统计") + " (" + toDisplayString(formatWordCount(wordCountInfo.value.current)) + ") ", 1)
            ])) : createCommentVNode("", true)
          ])
        ])) : (openBlock(), createElementBlock("div", _hoisted_30, [
          createVNode(BookForm, {
            "initial-value": book.value,
            submitting: updating.value,
            "submit-label": "保存修改",
            onSubmit: handleUpdate
          }, null, 8, ["initial-value", "submitting"])
        ])),
        confirmDelete.value ? (openBlock(), createElementBlock("div", _hoisted_31, [
          createBaseVNode("div", _hoisted_32, [
            _cache[20] || (_cache[20] = createBaseVNode("h3", null, "删除书籍", -1)),
            _cache[21] || (_cache[21] = createBaseVNode("p", null, "确定删除该书籍？此操作不可恢复。", -1)),
            createBaseVNode("div", _hoisted_33, [
              createBaseVNode("button", {
                class: "ghost-btn",
                type: "button",
                onClick: _cache[5] || (_cache[5] = ($event) => confirmDelete.value = false)
              }, "取消"),
              createBaseVNode("button", {
                class: "danger-btn",
                type: "button",
                disabled: deleting.value,
                onClick: handleDelete
              }, toDisplayString(deleting.value ? "删除中..." : "确认删除"), 9, _hoisted_34)
            ])
          ])
        ])) : createCommentVNode("", true)
      ])) : (openBlock(), createElementBlock("div", _hoisted_35, " 正在加载书籍信息... "));
    };
  }
});
const BookDetail = /* @__PURE__ */ _export_sfc$1(_sfc_main, [["__scopeId", "data-v-11be3c83"]]);
export {
  BookDetail as default
};
