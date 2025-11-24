import { p as unref, d as defineComponent, W as inject, r as ref, g as computed, o as onBeforeUnmount, X as toRef, y as createBlock, f as openBlock, B as withCtx, b as withDirectives, a as createBaseVNode, C as withModifiers, n as normalizeClass, j as normalizeStyle, H as vShow, T as Transition, c as createElementBlock, x as createVNode, F as Fragment, w as watch, z as nextTick, Y as provide, I as reactive, Z as onActivated, k as onMounted, $ as onUpdated, e as createCommentVNode, G as renderSlot, D as resolveDynamicComponent, Q as isObject$1, a0 as NOOP, a1 as cloneVNode, a2 as Comment, a3 as Text, a4 as mergeProps, a5 as shallowRef, a6 as getCurrentInstance, L as isFunction, a7 as isArray$1, a8 as Teleport$1, a9 as onBeforeMount, aa as readonly, ab as onDeactivated, t as toDisplayString, ac as isDate, M as isString, ad as toRaw, ae as useSlots, af as isRef, ag as vModelCheckbox, m as createTextVNode, K as toRefs, i as renderList, ah as vModelRadio, ai as useAttrs$1, E as withKeys, N as isVNode, aj as createSlots, ak as __vitePreload, _ as _export_sfc$1 } from "./index-BGc2X9_C.js";
import { h as isSymbol, j as isObject, k as isPrototype, m as arrayLikeKeys, n as isArrayLike, o as overArg, p as isObjectLike, q as baseGetTag, r as root, s as stubArray, t as arrayPush, v as getSymbols, w as baseGetAllKeys, U as Uint8Array, S as Symbol$1, x as getTag, y as baseUnary, z as nodeUtil, A as isBuffer, B as Stack, C as isArray, D as baseGet, F as castPath, G as toKey, H as arrayMap, I as tryOnScopeDispose, J as buildProps, K as isNumber, _ as _export_sfc, L as useNamespace, M as useEventListener, i as isClient, N as definePropType, O as addUnit, P as useResizeObserver, Q as withInstall, e as isElement, R as unrefElement, V as isNil, W as fromPairs, X as useZIndex, a as EVENT_CODE, Y as buildProp, Z as isBoolean, $ as composeEventHandlers, g as getEventCode, a0 as useGetDerivedNamespace, a1 as computedEager, a2 as onClickOutside, a3 as isEmpty, a4 as useSizeProp, f as isUndefined$1, a5 as isPropAbsent, a6 as isEqual, a7 as withNoopInstall, a8 as useLocale, a9 as useEmptyValuesProps, aa as circle_close_default, ab as useEmptyValues, ac as clock_default, ad as calendar_default, b as ElIcon, ae as arrow_up_default, af as arrow_down_default, ag as getStyle, ah as hasClass, ai as d_arrow_left_default, aj as arrow_left_default, ak as arrow_right_default, al as d_arrow_right_default, am as iconPropType, an as CloseComponents, ao as useGlobalConfig, ap as defaultNamespace, aq as useTimeoutFn, E as ElMessage, l as loading_default } from "./index-CC6Gx0up.js";
import { g as baseAssignValue, h as assignValue, i as flatRest, t as throwError, j as useAriaProps, k as isFocusable, l as formItemContextKey, b as ElFocusTrap, m as focusElement, n as useIdInjection, u as useId, U as UPDATE_MODEL_EVENT, p as useFormDisabled, q as useFormItem, C as CHANGE_EVENT, r as debugWarn, s as useFormSize, v as useFormItemInputId, w as useDeprecated, x as pick, y as useAttrs, z as useFocusController, a as ElInput, A as flatten, c as ElButton, d as useDraggable, F as FOCUS_TRAP_INJECTION_KEY, e as useLockscreen, E as ElOverlay, f as useSameTarget } from "./index-CUCe2A1O.js";
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
function arrayEach(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty$2.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
var getPrototype = overArg(Object.getPrototypeOf, Object);
var objectTag$1 = "[object Object]";
var funcProto = Function.prototype, objectProto$1 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag$1) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$1.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
function baseSlice(array, start, end) {
  var index = -1, length = array.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root.Buffer : void 0;
Buffer ? Buffer.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
  {
    return buffer.slice();
  }
}
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function initCloneArray(array) {
  var length = array.length, result = new array.constructor(length);
  if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}
function cloneDataView(dataView, isDeep) {
  var buffer = cloneArrayBuffer(dataView.buffer);
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var reFlags = /\w*$/;
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}
function cloneTypedArray(typedArray, isDeep) {
  var buffer = cloneArrayBuffer(typedArray.buffer);
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", symbolTag$1 = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag$1 = "[object Float32Array]", float64Tag$1 = "[object Float64Array]", int8Tag$1 = "[object Int8Array]", int16Tag$1 = "[object Int16Array]", int32Tag$1 = "[object Int32Array]", uint8Tag$1 = "[object Uint8Array]", uint8ClampedTag$1 = "[object Uint8ClampedArray]", uint16Tag$1 = "[object Uint16Array]", uint32Tag$1 = "[object Uint32Array]";
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);
    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);
    case dataViewTag$1:
      return cloneDataView(object);
    case float32Tag$1:
    case float64Tag$1:
    case int8Tag$1:
    case int16Tag$1:
    case int32Tag$1:
    case uint8Tag$1:
    case uint8ClampedTag$1:
    case uint16Tag$1:
    case uint32Tag$1:
      return cloneTypedArray(object);
    case mapTag$2:
      return new Ctor();
    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);
    case regexpTag$1:
      return cloneRegExp(object);
    case setTag$2:
      return new Ctor();
    case symbolTag$1:
      return cloneSymbol(object);
  }
}
var mapTag$1 = "[object Map]";
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag$1;
}
var nodeIsMap = nodeUtil && nodeUtil.isMap;
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
var setTag$1 = "[object Set]";
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag$1;
}
var nodeIsSet = nodeUtil && nodeUtil.isSet;
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== void 0) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
  } else {
    var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
    if (isBuffer(value)) {
      return cloneBuffer(value);
    }
    if (tag == objectTag || tag == argsTag || isFunc && !object) {
      result = {};
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag);
    }
  }
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key2) {
      result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
  }
  var keysFunc = getAllKeysIn;
  var props = isArr ? void 0 : keysFunc(value);
  arrayEach(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
  });
  return result;
}
var now = function() {
  return root.Date.now();
};
var FUNC_ERROR_TEXT = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now());
  }
  function debounced() {
    var time = now(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : void 0;
}
function parent(object, path) {
  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}
function isUndefined(value) {
  return value === void 0;
}
function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}
function customOmitClone(value) {
  return isPlainObject(value) ? void 0 : value;
}
var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
var omit = flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = arrayMap(paths, function(path) {
    path = castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object, getAllKeysIn(object), result);
  if (isDeep) {
    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    baseUnset(result, paths[length]);
  }
  return result;
});
function useTimeout() {
  let timeoutHandle;
  const registerTimeout = (fn2, delay) => {
    cancelTimeout();
    timeoutHandle = window.setTimeout(fn2, delay);
  };
  const cancelTimeout = () => window.clearTimeout(timeoutHandle);
  tryOnScopeDispose(() => cancelTimeout());
  return {
    registerTimeout,
    cancelTimeout
  };
}
const useDelayedToggleProps = buildProps({
  showAfter: {
    type: Number,
    default: 0
  },
  hideAfter: {
    type: Number,
    default: 200
  },
  autoClose: {
    type: Number,
    default: 0
  }
});
const useDelayedToggle = ({
  showAfter,
  hideAfter,
  autoClose,
  open,
  close
}) => {
  const { registerTimeout } = useTimeout();
  const {
    registerTimeout: registerTimeoutForAutoClose,
    cancelTimeout: cancelTimeoutForAutoClose
  } = useTimeout();
  const onOpen = (event, delay = unref(showAfter)) => {
    registerTimeout(() => {
      open(event);
      const _autoClose = unref(autoClose);
      if (isNumber(_autoClose) && _autoClose > 0) {
        registerTimeoutForAutoClose(() => {
          close(event);
        }, _autoClose);
      }
    }, delay);
  };
  const onClose = (event, delay = unref(hideAfter)) => {
    cancelTimeoutForAutoClose();
    registerTimeout(() => {
      close(event);
    }, delay);
  };
  return {
    onOpen,
    onClose
  };
};
const GAP = 4;
const BAR_MAP = {
  vertical: {
    offset: "offsetHeight",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    size: "height",
    key: "vertical",
    axis: "Y",
    client: "clientY",
    direction: "top"
  },
  horizontal: {
    offset: "offsetWidth",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    size: "width",
    key: "horizontal",
    axis: "X",
    client: "clientX",
    direction: "left"
  }
};
const renderThumbStyle = ({
  move,
  size,
  bar
}) => ({
  [bar.size]: size,
  transform: `translate${bar.axis}(${move}%)`
});
const scrollbarContextKey = Symbol("scrollbarContextKey");
const thumbProps = buildProps({
  vertical: Boolean,
  size: String,
  move: Number,
  ratio: {
    type: Number,
    required: true
  },
  always: Boolean
});
const COMPONENT_NAME$1 = "Thumb";
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "thumb",
  props: thumbProps,
  setup(__props) {
    const props = __props;
    const scrollbar = inject(scrollbarContextKey);
    const ns = useNamespace("scrollbar");
    if (!scrollbar)
      throwError(COMPONENT_NAME$1, "can not inject scrollbar context");
    const instance = ref();
    const thumb = ref();
    const thumbState = ref({});
    const visible = ref(false);
    let cursorDown = false;
    let cursorLeave = false;
    let baseScrollHeight = 0;
    let baseScrollWidth = 0;
    let originalOnSelectStart = isClient ? document.onselectstart : null;
    const bar = computed(() => BAR_MAP[props.vertical ? "vertical" : "horizontal"]);
    const thumbStyle = computed(() => renderThumbStyle({
      size: props.size,
      move: props.move,
      bar: bar.value
    }));
    const offsetRatio = computed(() => instance.value[bar.value.offset] ** 2 / scrollbar.wrapElement[bar.value.scrollSize] / props.ratio / thumb.value[bar.value.offset]);
    const clickThumbHandler = (e) => {
      var _a;
      e.stopPropagation();
      if (e.ctrlKey || [1, 2].includes(e.button))
        return;
      (_a = window.getSelection()) == null ? void 0 : _a.removeAllRanges();
      startDrag(e);
      const el = e.currentTarget;
      if (!el)
        return;
      thumbState.value[bar.value.axis] = el[bar.value.offset] - (e[bar.value.client] - el.getBoundingClientRect()[bar.value.direction]);
    };
    const clickTrackHandler = (e) => {
      if (!thumb.value || !instance.value || !scrollbar.wrapElement)
        return;
      const offset = Math.abs(e.target.getBoundingClientRect()[bar.value.direction] - e[bar.value.client]);
      const thumbHalf = thumb.value[bar.value.offset] / 2;
      const thumbPositionPercentage = (offset - thumbHalf) * 100 * offsetRatio.value / instance.value[bar.value.offset];
      scrollbar.wrapElement[bar.value.scroll] = thumbPositionPercentage * scrollbar.wrapElement[bar.value.scrollSize] / 100;
    };
    const startDrag = (e) => {
      e.stopImmediatePropagation();
      cursorDown = true;
      baseScrollHeight = scrollbar.wrapElement.scrollHeight;
      baseScrollWidth = scrollbar.wrapElement.scrollWidth;
      document.addEventListener("mousemove", mouseMoveDocumentHandler);
      document.addEventListener("mouseup", mouseUpDocumentHandler);
      originalOnSelectStart = document.onselectstart;
      document.onselectstart = () => false;
    };
    const mouseMoveDocumentHandler = (e) => {
      if (!instance.value || !thumb.value)
        return;
      if (cursorDown === false)
        return;
      const prevPage = thumbState.value[bar.value.axis];
      if (!prevPage)
        return;
      const offset = (instance.value.getBoundingClientRect()[bar.value.direction] - e[bar.value.client]) * -1;
      const thumbClickPosition = thumb.value[bar.value.offset] - prevPage;
      const thumbPositionPercentage = (offset - thumbClickPosition) * 100 * offsetRatio.value / instance.value[bar.value.offset];
      if (bar.value.scroll === "scrollLeft") {
        scrollbar.wrapElement[bar.value.scroll] = thumbPositionPercentage * baseScrollWidth / 100;
      } else {
        scrollbar.wrapElement[bar.value.scroll] = thumbPositionPercentage * baseScrollHeight / 100;
      }
    };
    const mouseUpDocumentHandler = () => {
      cursorDown = false;
      thumbState.value[bar.value.axis] = 0;
      document.removeEventListener("mousemove", mouseMoveDocumentHandler);
      document.removeEventListener("mouseup", mouseUpDocumentHandler);
      restoreOnselectstart();
      if (cursorLeave)
        visible.value = false;
    };
    const mouseMoveScrollbarHandler = () => {
      cursorLeave = false;
      visible.value = !!props.size;
    };
    const mouseLeaveScrollbarHandler = () => {
      cursorLeave = true;
      visible.value = cursorDown;
    };
    onBeforeUnmount(() => {
      restoreOnselectstart();
      document.removeEventListener("mouseup", mouseUpDocumentHandler);
    });
    const restoreOnselectstart = () => {
      if (document.onselectstart !== originalOnSelectStart)
        document.onselectstart = originalOnSelectStart;
    };
    useEventListener(toRef(scrollbar, "scrollbarElement"), "mousemove", mouseMoveScrollbarHandler);
    useEventListener(toRef(scrollbar, "scrollbarElement"), "mouseleave", mouseLeaveScrollbarHandler);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: unref(ns).b("fade"),
        persisted: ""
      }, {
        default: withCtx(() => [
          withDirectives(createBaseVNode("div", {
            ref_key: "instance",
            ref: instance,
            class: normalizeClass([unref(ns).e("bar"), unref(ns).is(unref(bar).key)]),
            onMousedown: clickTrackHandler,
            onClick: withModifiers(() => {
            }, ["stop"])
          }, [
            createBaseVNode("div", {
              ref_key: "thumb",
              ref: thumb,
              class: normalizeClass(unref(ns).e("thumb")),
              style: normalizeStyle(unref(thumbStyle)),
              onMousedown: clickThumbHandler
            }, null, 38)
          ], 42, ["onClick"]), [
            [vShow, _ctx.always || visible.value]
          ])
        ]),
        _: 1
      }, 8, ["name"]);
    };
  }
});
var Thumb = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["__file", "thumb.vue"]]);
const barProps = buildProps({
  always: {
    type: Boolean,
    default: true
  },
  minSize: {
    type: Number,
    required: true
  }
});
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "bar",
  props: barProps,
  setup(__props, { expose }) {
    const props = __props;
    const scrollbar = inject(scrollbarContextKey);
    const moveX = ref(0);
    const moveY = ref(0);
    const sizeWidth = ref("");
    const sizeHeight = ref("");
    const ratioY = ref(1);
    const ratioX = ref(1);
    const handleScroll = (wrap) => {
      if (wrap) {
        const offsetHeight = wrap.offsetHeight - GAP;
        const offsetWidth = wrap.offsetWidth - GAP;
        moveY.value = wrap.scrollTop * 100 / offsetHeight * ratioY.value;
        moveX.value = wrap.scrollLeft * 100 / offsetWidth * ratioX.value;
      }
    };
    const update = () => {
      const wrap = scrollbar == null ? void 0 : scrollbar.wrapElement;
      if (!wrap)
        return;
      const offsetHeight = wrap.offsetHeight - GAP;
      const offsetWidth = wrap.offsetWidth - GAP;
      const originalHeight = offsetHeight ** 2 / wrap.scrollHeight;
      const originalWidth = offsetWidth ** 2 / wrap.scrollWidth;
      const height = Math.max(originalHeight, props.minSize);
      const width = Math.max(originalWidth, props.minSize);
      ratioY.value = originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height));
      ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width));
      sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : "";
      sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : "";
    };
    expose({
      handleScroll,
      update
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(Thumb, {
          move: moveX.value,
          ratio: ratioX.value,
          size: sizeWidth.value,
          always: _ctx.always
        }, null, 8, ["move", "ratio", "size", "always"]),
        createVNode(Thumb, {
          move: moveY.value,
          ratio: ratioY.value,
          size: sizeHeight.value,
          vertical: "",
          always: _ctx.always
        }, null, 8, ["move", "ratio", "size", "always"])
      ], 64);
    };
  }
});
var Bar = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["__file", "bar.vue"]]);
const scrollbarProps = buildProps({
  distance: {
    type: Number,
    default: 0
  },
  height: {
    type: [String, Number],
    default: ""
  },
  maxHeight: {
    type: [String, Number],
    default: ""
  },
  native: Boolean,
  wrapStyle: {
    type: definePropType([String, Object, Array]),
    default: ""
  },
  wrapClass: {
    type: [String, Array],
    default: ""
  },
  viewClass: {
    type: [String, Array],
    default: ""
  },
  viewStyle: {
    type: [String, Array, Object],
    default: ""
  },
  noresize: Boolean,
  tag: {
    type: String,
    default: "div"
  },
  always: Boolean,
  minSize: {
    type: Number,
    default: 20
  },
  tabindex: {
    type: [String, Number],
    default: void 0
  },
  id: String,
  role: String,
  ...useAriaProps(["ariaLabel", "ariaOrientation"])
});
const scrollbarEmits = {
  "end-reached": (direction) => ["left", "right", "top", "bottom"].includes(direction),
  scroll: ({
    scrollTop,
    scrollLeft
  }) => [scrollTop, scrollLeft].every(isNumber)
};
const COMPONENT_NAME = "ElScrollbar";
const __default__$l = defineComponent({
  name: COMPONENT_NAME
});
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  ...__default__$l,
  props: scrollbarProps,
  emits: scrollbarEmits,
  setup(__props, { expose, emit }) {
    const props = __props;
    const ns = useNamespace("scrollbar");
    let stopResizeObserver = void 0;
    let stopWrapResizeObserver = void 0;
    let stopResizeListener = void 0;
    let wrapScrollTop = 0;
    let wrapScrollLeft = 0;
    let direction = "";
    const distanceScrollState = {
      bottom: false,
      top: false,
      right: false,
      left: false
    };
    const scrollbarRef = ref();
    const wrapRef = ref();
    const resizeRef = ref();
    const barRef = ref();
    const wrapStyle = computed(() => {
      const style = {};
      if (props.height)
        style.height = addUnit(props.height);
      if (props.maxHeight)
        style.maxHeight = addUnit(props.maxHeight);
      return [props.wrapStyle, style];
    });
    const wrapKls = computed(() => {
      return [
        props.wrapClass,
        ns.e("wrap"),
        { [ns.em("wrap", "hidden-default")]: !props.native }
      ];
    });
    const resizeKls = computed(() => {
      return [ns.e("view"), props.viewClass];
    });
    const shouldSkipDirection = (direction2) => {
      var _a;
      return (_a = distanceScrollState[direction2]) != null ? _a : false;
    };
    const DIRECTION_PAIRS = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left"
    };
    const updateTriggerStatus = (arrivedStates) => {
      const oppositeDirection = DIRECTION_PAIRS[direction];
      if (!oppositeDirection)
        return;
      const arrived = arrivedStates[direction];
      const oppositeArrived = arrivedStates[oppositeDirection];
      if (arrived && !distanceScrollState[direction]) {
        distanceScrollState[direction] = true;
      }
      if (!oppositeArrived && distanceScrollState[oppositeDirection]) {
        distanceScrollState[oppositeDirection] = false;
      }
    };
    const handleScroll = () => {
      var _a;
      if (wrapRef.value) {
        (_a = barRef.value) == null ? void 0 : _a.handleScroll(wrapRef.value);
        const prevTop = wrapScrollTop;
        const prevLeft = wrapScrollLeft;
        wrapScrollTop = wrapRef.value.scrollTop;
        wrapScrollLeft = wrapRef.value.scrollLeft;
        const arrivedStates = {
          bottom: wrapScrollTop + wrapRef.value.clientHeight >= wrapRef.value.scrollHeight - props.distance,
          top: wrapScrollTop <= props.distance && prevTop !== 0,
          right: wrapScrollLeft + wrapRef.value.clientWidth >= wrapRef.value.scrollWidth - props.distance && prevLeft !== wrapScrollLeft,
          left: wrapScrollLeft <= props.distance && prevLeft !== 0
        };
        emit("scroll", {
          scrollTop: wrapScrollTop,
          scrollLeft: wrapScrollLeft
        });
        if (prevTop !== wrapScrollTop) {
          direction = wrapScrollTop > prevTop ? "bottom" : "top";
        }
        if (prevLeft !== wrapScrollLeft) {
          direction = wrapScrollLeft > prevLeft ? "right" : "left";
        }
        if (props.distance > 0) {
          if (shouldSkipDirection(direction)) {
            return;
          }
          updateTriggerStatus(arrivedStates);
        }
        if (arrivedStates[direction])
          emit("end-reached", direction);
      }
    };
    function scrollTo(arg1, arg2) {
      if (isObject$1(arg1)) {
        wrapRef.value.scrollTo(arg1);
      } else if (isNumber(arg1) && isNumber(arg2)) {
        wrapRef.value.scrollTo(arg1, arg2);
      }
    }
    const setScrollTop = (value) => {
      if (!isNumber(value)) {
        return;
      }
      wrapRef.value.scrollTop = value;
    };
    const setScrollLeft = (value) => {
      if (!isNumber(value)) {
        return;
      }
      wrapRef.value.scrollLeft = value;
    };
    const update = () => {
      var _a;
      (_a = barRef.value) == null ? void 0 : _a.update();
      distanceScrollState[direction] = false;
    };
    watch(() => props.noresize, (noresize) => {
      if (noresize) {
        stopResizeObserver == null ? void 0 : stopResizeObserver();
        stopWrapResizeObserver == null ? void 0 : stopWrapResizeObserver();
        stopResizeListener == null ? void 0 : stopResizeListener();
      } else {
        ({ stop: stopResizeObserver } = useResizeObserver(resizeRef, update));
        ({ stop: stopWrapResizeObserver } = useResizeObserver(wrapRef, update));
        stopResizeListener = useEventListener("resize", update);
      }
    }, { immediate: true });
    watch(() => [props.maxHeight, props.height], () => {
      if (!props.native)
        nextTick(() => {
          var _a;
          update();
          if (wrapRef.value) {
            (_a = barRef.value) == null ? void 0 : _a.handleScroll(wrapRef.value);
          }
        });
    });
    provide(scrollbarContextKey, reactive({
      scrollbarElement: scrollbarRef,
      wrapElement: wrapRef
    }));
    onActivated(() => {
      if (wrapRef.value) {
        wrapRef.value.scrollTop = wrapScrollTop;
        wrapRef.value.scrollLeft = wrapScrollLeft;
      }
    });
    onMounted(() => {
      if (!props.native)
        nextTick(() => {
          update();
        });
    });
    onUpdated(() => update());
    expose({
      wrapRef,
      update,
      scrollTo,
      setScrollTop,
      setScrollLeft,
      handleScroll
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "scrollbarRef",
        ref: scrollbarRef,
        class: normalizeClass(unref(ns).b())
      }, [
        createBaseVNode("div", {
          ref_key: "wrapRef",
          ref: wrapRef,
          class: normalizeClass(unref(wrapKls)),
          style: normalizeStyle(unref(wrapStyle)),
          tabindex: _ctx.tabindex,
          onScroll: handleScroll
        }, [
          (openBlock(), createBlock(resolveDynamicComponent(_ctx.tag), {
            id: _ctx.id,
            ref_key: "resizeRef",
            ref: resizeRef,
            class: normalizeClass(unref(resizeKls)),
            style: normalizeStyle(_ctx.viewStyle),
            role: _ctx.role,
            "aria-label": _ctx.ariaLabel,
            "aria-orientation": _ctx.ariaOrientation
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "default")
            ]),
            _: 3
          }, 8, ["id", "class", "style", "role", "aria-label", "aria-orientation"]))
        ], 46, ["tabindex"]),
        !_ctx.native ? (openBlock(), createBlock(Bar, {
          key: 0,
          ref_key: "barRef",
          ref: barRef,
          always: _ctx.always,
          "min-size": _ctx.minSize
        }, null, 8, ["always", "min-size"])) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var Scrollbar = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["__file", "scrollbar.vue"]]);
const ElScrollbar = withInstall(Scrollbar);
const POPPER_INJECTION_KEY = Symbol("popper");
const POPPER_CONTENT_INJECTION_KEY = Symbol("popperContent");
const roleTypes = [
  "dialog",
  "grid",
  "group",
  "listbox",
  "menu",
  "navigation",
  "tooltip",
  "tree"
];
const popperProps = buildProps({
  role: {
    type: String,
    values: roleTypes,
    default: "tooltip"
  }
});
const __default__$k = defineComponent({
  name: "ElPopper",
  inheritAttrs: false
});
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  ...__default__$k,
  props: popperProps,
  setup(__props, { expose }) {
    const props = __props;
    const triggerRef = ref();
    const popperInstanceRef = ref();
    const contentRef = ref();
    const referenceRef = ref();
    const role = computed(() => props.role);
    const popperProvides = {
      triggerRef,
      popperInstanceRef,
      contentRef,
      referenceRef,
      role
    };
    expose(popperProvides);
    provide(POPPER_INJECTION_KEY, popperProvides);
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});
var Popper = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["__file", "popper.vue"]]);
const __default__$j = defineComponent({
  name: "ElPopperArrow",
  inheritAttrs: false
});
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  ...__default__$j,
  setup(__props, { expose }) {
    const ns = useNamespace("popper");
    const { arrowRef, arrowStyle } = inject(POPPER_CONTENT_INJECTION_KEY, void 0);
    onBeforeUnmount(() => {
      arrowRef.value = void 0;
    });
    expose({
      arrowRef
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        ref_key: "arrowRef",
        ref: arrowRef,
        class: normalizeClass(unref(ns).e("arrow")),
        style: normalizeStyle(unref(arrowStyle)),
        "data-popper-arrow": ""
      }, null, 6);
    };
  }
});
var ElPopperArrow = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["__file", "arrow.vue"]]);
const popperTriggerProps = buildProps({
  virtualRef: {
    type: definePropType(Object)
  },
  virtualTriggering: Boolean,
  onMouseenter: {
    type: definePropType(Function)
  },
  onMouseleave: {
    type: definePropType(Function)
  },
  onClick: {
    type: definePropType(Function)
  },
  onKeydown: {
    type: definePropType(Function)
  },
  onFocus: {
    type: definePropType(Function)
  },
  onBlur: {
    type: definePropType(Function)
  },
  onContextmenu: {
    type: definePropType(Function)
  },
  id: String,
  open: Boolean
});
const FORWARD_REF_INJECTION_KEY = Symbol("elForwardRef");
const useForwardRef = (forwardRef) => {
  const setForwardRef = (el) => {
    forwardRef.value = el;
  };
  provide(FORWARD_REF_INJECTION_KEY, {
    setForwardRef
  });
};
const useForwardRefDirective = (setForwardRef) => {
  return {
    mounted(el) {
      setForwardRef(el);
    },
    updated(el) {
      setForwardRef(el);
    },
    unmounted() {
      setForwardRef(null);
    }
  };
};
const NAME = "ElOnlyChild";
const OnlyChild = defineComponent({
  name: NAME,
  setup(_, {
    slots,
    attrs
  }) {
    var _a;
    const forwardRefInjection = inject(FORWARD_REF_INJECTION_KEY);
    const forwardRefDirective = useForwardRefDirective((_a = forwardRefInjection == null ? void 0 : forwardRefInjection.setForwardRef) != null ? _a : NOOP);
    return () => {
      var _a2;
      const defaultSlot = (_a2 = slots.default) == null ? void 0 : _a2.call(slots, attrs);
      if (!defaultSlot)
        return null;
      const [firstLegitNode, length] = findFirstLegitChild(defaultSlot);
      if (!firstLegitNode) {
        return null;
      }
      return withDirectives(cloneVNode(firstLegitNode, attrs), [[forwardRefDirective]]);
    };
  }
});
function findFirstLegitChild(node) {
  if (!node)
    return [null, 0];
  const children = node;
  const len = children.filter((c) => c.type !== Comment).length;
  for (const child of children) {
    if (isObject$1(child)) {
      switch (child.type) {
        case Comment:
          continue;
        case Text:
        case "svg":
          return [wrapTextContent(child), len];
        case Fragment:
          return findFirstLegitChild(child.children);
        default:
          return [child, len];
      }
    }
    return [wrapTextContent(child), len];
  }
  return [null, 0];
}
function wrapTextContent(s) {
  const ns = useNamespace("only-child");
  return createVNode("span", {
    "class": ns.e("content")
  }, [s]);
}
const __default__$i = defineComponent({
  name: "ElPopperTrigger",
  inheritAttrs: false
});
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  ...__default__$i,
  props: popperTriggerProps,
  setup(__props, { expose }) {
    const props = __props;
    const { role, triggerRef } = inject(POPPER_INJECTION_KEY, void 0);
    useForwardRef(triggerRef);
    const ariaControls = computed(() => {
      return ariaHaspopup.value ? props.id : void 0;
    });
    const ariaDescribedby = computed(() => {
      if (role && role.value === "tooltip") {
        return props.open && props.id ? props.id : void 0;
      }
      return void 0;
    });
    const ariaHaspopup = computed(() => {
      if (role && role.value !== "tooltip") {
        return role.value;
      }
      return void 0;
    });
    const ariaExpanded = computed(() => {
      return ariaHaspopup.value ? `${props.open}` : void 0;
    });
    let virtualTriggerAriaStopWatch = void 0;
    const TRIGGER_ELE_EVENTS = [
      "onMouseenter",
      "onMouseleave",
      "onClick",
      "onKeydown",
      "onFocus",
      "onBlur",
      "onContextmenu"
    ];
    onMounted(() => {
      watch(() => props.virtualRef, (virtualEl) => {
        if (virtualEl) {
          triggerRef.value = unrefElement(virtualEl);
        }
      }, {
        immediate: true
      });
      watch(triggerRef, (el, prevEl) => {
        virtualTriggerAriaStopWatch == null ? void 0 : virtualTriggerAriaStopWatch();
        virtualTriggerAriaStopWatch = void 0;
        if (isElement(prevEl)) {
          TRIGGER_ELE_EVENTS.forEach((eventName) => {
            const handler = props[eventName];
            if (handler) {
              prevEl.removeEventListener(eventName.slice(2).toLowerCase(), handler, ["onFocus", "onBlur"].includes(eventName));
            }
          });
        }
        if (isElement(el)) {
          TRIGGER_ELE_EVENTS.forEach((eventName) => {
            const handler = props[eventName];
            if (handler) {
              el.addEventListener(eventName.slice(2).toLowerCase(), handler, ["onFocus", "onBlur"].includes(eventName));
            }
          });
          if (isFocusable(el)) {
            virtualTriggerAriaStopWatch = watch([ariaControls, ariaDescribedby, ariaHaspopup, ariaExpanded], (watches) => {
              [
                "aria-controls",
                "aria-describedby",
                "aria-haspopup",
                "aria-expanded"
              ].forEach((key, idx) => {
                isNil(watches[idx]) ? el.removeAttribute(key) : el.setAttribute(key, watches[idx]);
              });
            }, { immediate: true });
          }
        }
        if (isElement(prevEl) && isFocusable(prevEl)) {
          [
            "aria-controls",
            "aria-describedby",
            "aria-haspopup",
            "aria-expanded"
          ].forEach((key) => prevEl.removeAttribute(key));
        }
      }, {
        immediate: true
      });
    });
    onBeforeUnmount(() => {
      virtualTriggerAriaStopWatch == null ? void 0 : virtualTriggerAriaStopWatch();
      virtualTriggerAriaStopWatch = void 0;
      if (triggerRef.value && isElement(triggerRef.value)) {
        const el = triggerRef.value;
        TRIGGER_ELE_EVENTS.forEach((eventName) => {
          const handler = props[eventName];
          if (handler) {
            el.removeEventListener(eventName.slice(2).toLowerCase(), handler, ["onFocus", "onBlur"].includes(eventName));
          }
        });
        triggerRef.value = void 0;
      }
    });
    expose({
      triggerRef
    });
    return (_ctx, _cache) => {
      return !_ctx.virtualTriggering ? (openBlock(), createBlock(unref(OnlyChild), mergeProps({ key: 0 }, _ctx.$attrs, {
        "aria-controls": unref(ariaControls),
        "aria-describedby": unref(ariaDescribedby),
        "aria-expanded": unref(ariaExpanded),
        "aria-haspopup": unref(ariaHaspopup)
      }), {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
      }, 16, ["aria-controls", "aria-describedby", "aria-expanded", "aria-haspopup"])) : createCommentVNode("v-if", true);
    };
  }
});
var ElPopperTrigger = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["__file", "trigger.vue"]]);
var E = "top", R = "bottom", W = "right", P = "left", me = "auto", G = [E, R, W, P], U = "start", J = "end", Xe = "clippingParents", je = "viewport", K = "popper", Ye = "reference", De = G.reduce(function(t, e) {
  return t.concat([e + "-" + U, e + "-" + J]);
}, []), Ee = [].concat(G, [me]).reduce(function(t, e) {
  return t.concat([e, e + "-" + U, e + "-" + J]);
}, []), Ge = "beforeRead", Je = "read", Ke = "afterRead", Qe = "beforeMain", Ze = "main", et = "afterMain", tt = "beforeWrite", nt = "write", rt = "afterWrite", ot = [Ge, Je, Ke, Qe, Ze, et, tt, nt, rt];
function C(t) {
  return t ? (t.nodeName || "").toLowerCase() : null;
}
function H(t) {
  if (t == null) return window;
  if (t.toString() !== "[object Window]") {
    var e = t.ownerDocument;
    return e && e.defaultView || window;
  }
  return t;
}
function Q(t) {
  var e = H(t).Element;
  return t instanceof e || t instanceof Element;
}
function B(t) {
  var e = H(t).HTMLElement;
  return t instanceof e || t instanceof HTMLElement;
}
function Pe(t) {
  if (typeof ShadowRoot == "undefined") return false;
  var e = H(t).ShadowRoot;
  return t instanceof e || t instanceof ShadowRoot;
}
function Mt(t) {
  var e = t.state;
  Object.keys(e.elements).forEach(function(n) {
    var r = e.styles[n] || {}, o = e.attributes[n] || {}, i = e.elements[n];
    !B(i) || !C(i) || (Object.assign(i.style, r), Object.keys(o).forEach(function(a) {
      var s = o[a];
      s === false ? i.removeAttribute(a) : i.setAttribute(a, s === true ? "" : s);
    }));
  });
}
function Rt(t) {
  var e = t.state, n = { popper: { position: e.options.strategy, left: "0", top: "0", margin: "0" }, arrow: { position: "absolute" }, reference: {} };
  return Object.assign(e.elements.popper.style, n.popper), e.styles = n, e.elements.arrow && Object.assign(e.elements.arrow.style, n.arrow), function() {
    Object.keys(e.elements).forEach(function(r) {
      var o = e.elements[r], i = e.attributes[r] || {}, a = Object.keys(e.styles.hasOwnProperty(r) ? e.styles[r] : n[r]), s = a.reduce(function(f, c) {
        return f[c] = "", f;
      }, {});
      !B(o) || !C(o) || (Object.assign(o.style, s), Object.keys(i).forEach(function(f) {
        o.removeAttribute(f);
      }));
    });
  };
}
var Ae = { name: "applyStyles", enabled: true, phase: "write", fn: Mt, effect: Rt, requires: ["computeStyles"] };
function q(t) {
  return t.split("-")[0];
}
var X = Math.max, ve = Math.min, Z = Math.round;
function ee(t, e) {
  e === void 0 && (e = false);
  var n = t.getBoundingClientRect(), r = 1, o = 1;
  if (B(t) && e) {
    var i = t.offsetHeight, a = t.offsetWidth;
    a > 0 && (r = Z(n.width) / a || 1), i > 0 && (o = Z(n.height) / i || 1);
  }
  return { width: n.width / r, height: n.height / o, top: n.top / o, right: n.right / r, bottom: n.bottom / o, left: n.left / r, x: n.left / r, y: n.top / o };
}
function ke(t) {
  var e = ee(t), n = t.offsetWidth, r = t.offsetHeight;
  return Math.abs(e.width - n) <= 1 && (n = e.width), Math.abs(e.height - r) <= 1 && (r = e.height), { x: t.offsetLeft, y: t.offsetTop, width: n, height: r };
}
function it(t, e) {
  var n = e.getRootNode && e.getRootNode();
  if (t.contains(e)) return true;
  if (n && Pe(n)) {
    var r = e;
    do {
      if (r && t.isSameNode(r)) return true;
      r = r.parentNode || r.host;
    } while (r);
  }
  return false;
}
function N(t) {
  return H(t).getComputedStyle(t);
}
function Wt(t) {
  return ["table", "td", "th"].indexOf(C(t)) >= 0;
}
function I(t) {
  return ((Q(t) ? t.ownerDocument : t.document) || window.document).documentElement;
}
function ge(t) {
  return C(t) === "html" ? t : t.assignedSlot || t.parentNode || (Pe(t) ? t.host : null) || I(t);
}
function at(t) {
  return !B(t) || N(t).position === "fixed" ? null : t.offsetParent;
}
function Bt(t) {
  var e = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1, n = navigator.userAgent.indexOf("Trident") !== -1;
  if (n && B(t)) {
    var r = N(t);
    if (r.position === "fixed") return null;
  }
  var o = ge(t);
  for (Pe(o) && (o = o.host); B(o) && ["html", "body"].indexOf(C(o)) < 0; ) {
    var i = N(o);
    if (i.transform !== "none" || i.perspective !== "none" || i.contain === "paint" || ["transform", "perspective"].indexOf(i.willChange) !== -1 || e && i.willChange === "filter" || e && i.filter && i.filter !== "none") return o;
    o = o.parentNode;
  }
  return null;
}
function se(t) {
  for (var e = H(t), n = at(t); n && Wt(n) && N(n).position === "static"; ) n = at(n);
  return n && (C(n) === "html" || C(n) === "body" && N(n).position === "static") ? e : n || Bt(t) || e;
}
function Le(t) {
  return ["top", "bottom"].indexOf(t) >= 0 ? "x" : "y";
}
function fe(t, e, n) {
  return X(t, ve(e, n));
}
function St(t, e, n) {
  var r = fe(t, e, n);
  return r > n ? n : r;
}
function st() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
function ft(t) {
  return Object.assign({}, st(), t);
}
function ct(t, e) {
  return e.reduce(function(n, r) {
    return n[r] = t, n;
  }, {});
}
var Tt = function(t, e) {
  return t = typeof t == "function" ? t(Object.assign({}, e.rects, { placement: e.placement })) : t, ft(typeof t != "number" ? t : ct(t, G));
};
function Ht(t) {
  var e, n = t.state, r = t.name, o = t.options, i = n.elements.arrow, a = n.modifiersData.popperOffsets, s = q(n.placement), f = Le(s), c = [P, W].indexOf(s) >= 0, u = c ? "height" : "width";
  if (!(!i || !a)) {
    var m = Tt(o.padding, n), v = ke(i), l = f === "y" ? E : P, h = f === "y" ? R : W, p = n.rects.reference[u] + n.rects.reference[f] - a[f] - n.rects.popper[u], g = a[f] - n.rects.reference[f], x = se(i), y = x ? f === "y" ? x.clientHeight || 0 : x.clientWidth || 0 : 0, $ = p / 2 - g / 2, d = m[l], b = y - v[u] - m[h], w = y / 2 - v[u] / 2 + $, O = fe(d, w, b), j = f;
    n.modifiersData[r] = (e = {}, e[j] = O, e.centerOffset = O - w, e);
  }
}
function Ct(t) {
  var e = t.state, n = t.options, r = n.element, o = r === void 0 ? "[data-popper-arrow]" : r;
  o != null && (typeof o == "string" && (o = e.elements.popper.querySelector(o), !o) || !it(e.elements.popper, o) || (e.elements.arrow = o));
}
var pt = { name: "arrow", enabled: true, phase: "main", fn: Ht, effect: Ct, requires: ["popperOffsets"], requiresIfExists: ["preventOverflow"] };
function te(t) {
  return t.split("-")[1];
}
var qt = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
function Vt(t) {
  var e = t.x, n = t.y, r = window, o = r.devicePixelRatio || 1;
  return { x: Z(e * o) / o || 0, y: Z(n * o) / o || 0 };
}
function ut(t) {
  var e, n = t.popper, r = t.popperRect, o = t.placement, i = t.variation, a = t.offsets, s = t.position, f = t.gpuAcceleration, c = t.adaptive, u = t.roundOffsets, m = t.isFixed, v = a.x, l = v === void 0 ? 0 : v, h = a.y, p = h === void 0 ? 0 : h, g = typeof u == "function" ? u({ x: l, y: p }) : { x: l, y: p };
  l = g.x, p = g.y;
  var x = a.hasOwnProperty("x"), y = a.hasOwnProperty("y"), $ = P, d = E, b = window;
  if (c) {
    var w = se(n), O = "clientHeight", j = "clientWidth";
    if (w === H(n) && (w = I(n), N(w).position !== "static" && s === "absolute" && (O = "scrollHeight", j = "scrollWidth")), w = w, o === E || (o === P || o === W) && i === J) {
      d = R;
      var A = m && w === b && b.visualViewport ? b.visualViewport.height : w[O];
      p -= A - r.height, p *= f ? 1 : -1;
    }
    if (o === P || (o === E || o === R) && i === J) {
      $ = W;
      var k = m && w === b && b.visualViewport ? b.visualViewport.width : w[j];
      l -= k - r.width, l *= f ? 1 : -1;
    }
  }
  var D = Object.assign({ position: s }, c && qt), S = u === true ? Vt({ x: l, y: p }) : { x: l, y: p };
  if (l = S.x, p = S.y, f) {
    var L;
    return Object.assign({}, D, (L = {}, L[d] = y ? "0" : "", L[$] = x ? "0" : "", L.transform = (b.devicePixelRatio || 1) <= 1 ? "translate(" + l + "px, " + p + "px)" : "translate3d(" + l + "px, " + p + "px, 0)", L));
  }
  return Object.assign({}, D, (e = {}, e[d] = y ? p + "px" : "", e[$] = x ? l + "px" : "", e.transform = "", e));
}
function Nt(t) {
  var e = t.state, n = t.options, r = n.gpuAcceleration, o = r === void 0 ? true : r, i = n.adaptive, a = i === void 0 ? true : i, s = n.roundOffsets, f = s === void 0 ? true : s, c = { placement: q(e.placement), variation: te(e.placement), popper: e.elements.popper, popperRect: e.rects.popper, gpuAcceleration: o, isFixed: e.options.strategy === "fixed" };
  e.modifiersData.popperOffsets != null && (e.styles.popper = Object.assign({}, e.styles.popper, ut(Object.assign({}, c, { offsets: e.modifiersData.popperOffsets, position: e.options.strategy, adaptive: a, roundOffsets: f })))), e.modifiersData.arrow != null && (e.styles.arrow = Object.assign({}, e.styles.arrow, ut(Object.assign({}, c, { offsets: e.modifiersData.arrow, position: "absolute", adaptive: false, roundOffsets: f })))), e.attributes.popper = Object.assign({}, e.attributes.popper, { "data-popper-placement": e.placement });
}
var Me = { name: "computeStyles", enabled: true, phase: "beforeWrite", fn: Nt, data: {} }, ye = { passive: true };
function It(t) {
  var e = t.state, n = t.instance, r = t.options, o = r.scroll, i = o === void 0 ? true : o, a = r.resize, s = a === void 0 ? true : a, f = H(e.elements.popper), c = [].concat(e.scrollParents.reference, e.scrollParents.popper);
  return i && c.forEach(function(u) {
    u.addEventListener("scroll", n.update, ye);
  }), s && f.addEventListener("resize", n.update, ye), function() {
    i && c.forEach(function(u) {
      u.removeEventListener("scroll", n.update, ye);
    }), s && f.removeEventListener("resize", n.update, ye);
  };
}
var Re = { name: "eventListeners", enabled: true, phase: "write", fn: function() {
}, effect: It, data: {} }, _t = { left: "right", right: "left", bottom: "top", top: "bottom" };
function be(t) {
  return t.replace(/left|right|bottom|top/g, function(e) {
    return _t[e];
  });
}
var zt = { start: "end", end: "start" };
function lt(t) {
  return t.replace(/start|end/g, function(e) {
    return zt[e];
  });
}
function We(t) {
  var e = H(t), n = e.pageXOffset, r = e.pageYOffset;
  return { scrollLeft: n, scrollTop: r };
}
function Be(t) {
  return ee(I(t)).left + We(t).scrollLeft;
}
function Ft(t) {
  var e = H(t), n = I(t), r = e.visualViewport, o = n.clientWidth, i = n.clientHeight, a = 0, s = 0;
  return r && (o = r.width, i = r.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (a = r.offsetLeft, s = r.offsetTop)), { width: o, height: i, x: a + Be(t), y: s };
}
function Ut(t) {
  var e, n = I(t), r = We(t), o = (e = t.ownerDocument) == null ? void 0 : e.body, i = X(n.scrollWidth, n.clientWidth, o ? o.scrollWidth : 0, o ? o.clientWidth : 0), a = X(n.scrollHeight, n.clientHeight, o ? o.scrollHeight : 0, o ? o.clientHeight : 0), s = -r.scrollLeft + Be(t), f = -r.scrollTop;
  return N(o || n).direction === "rtl" && (s += X(n.clientWidth, o ? o.clientWidth : 0) - i), { width: i, height: a, x: s, y: f };
}
function Se(t) {
  var e = N(t), n = e.overflow, r = e.overflowX, o = e.overflowY;
  return /auto|scroll|overlay|hidden/.test(n + o + r);
}
function dt(t) {
  return ["html", "body", "#document"].indexOf(C(t)) >= 0 ? t.ownerDocument.body : B(t) && Se(t) ? t : dt(ge(t));
}
function ce(t, e) {
  var n;
  e === void 0 && (e = []);
  var r = dt(t), o = r === ((n = t.ownerDocument) == null ? void 0 : n.body), i = H(r), a = o ? [i].concat(i.visualViewport || [], Se(r) ? r : []) : r, s = e.concat(a);
  return o ? s : s.concat(ce(ge(a)));
}
function Te(t) {
  return Object.assign({}, t, { left: t.x, top: t.y, right: t.x + t.width, bottom: t.y + t.height });
}
function Xt(t) {
  var e = ee(t);
  return e.top = e.top + t.clientTop, e.left = e.left + t.clientLeft, e.bottom = e.top + t.clientHeight, e.right = e.left + t.clientWidth, e.width = t.clientWidth, e.height = t.clientHeight, e.x = e.left, e.y = e.top, e;
}
function ht(t, e) {
  return e === je ? Te(Ft(t)) : Q(e) ? Xt(e) : Te(Ut(I(t)));
}
function Yt(t) {
  var e = ce(ge(t)), n = ["absolute", "fixed"].indexOf(N(t).position) >= 0, r = n && B(t) ? se(t) : t;
  return Q(r) ? e.filter(function(o) {
    return Q(o) && it(o, r) && C(o) !== "body";
  }) : [];
}
function Gt(t, e, n) {
  var r = e === "clippingParents" ? Yt(t) : [].concat(e), o = [].concat(r, [n]), i = o[0], a = o.reduce(function(s, f) {
    var c = ht(t, f);
    return s.top = X(c.top, s.top), s.right = ve(c.right, s.right), s.bottom = ve(c.bottom, s.bottom), s.left = X(c.left, s.left), s;
  }, ht(t, i));
  return a.width = a.right - a.left, a.height = a.bottom - a.top, a.x = a.left, a.y = a.top, a;
}
function mt(t) {
  var e = t.reference, n = t.element, r = t.placement, o = r ? q(r) : null, i = r ? te(r) : null, a = e.x + e.width / 2 - n.width / 2, s = e.y + e.height / 2 - n.height / 2, f;
  switch (o) {
    case E:
      f = { x: a, y: e.y - n.height };
      break;
    case R:
      f = { x: a, y: e.y + e.height };
      break;
    case W:
      f = { x: e.x + e.width, y: s };
      break;
    case P:
      f = { x: e.x - n.width, y: s };
      break;
    default:
      f = { x: e.x, y: e.y };
  }
  var c = o ? Le(o) : null;
  if (c != null) {
    var u = c === "y" ? "height" : "width";
    switch (i) {
      case U:
        f[c] = f[c] - (e[u] / 2 - n[u] / 2);
        break;
      case J:
        f[c] = f[c] + (e[u] / 2 - n[u] / 2);
        break;
    }
  }
  return f;
}
function ne(t, e) {
  e === void 0 && (e = {});
  var n = e, r = n.placement, o = r === void 0 ? t.placement : r, i = n.boundary, a = i === void 0 ? Xe : i, s = n.rootBoundary, f = s === void 0 ? je : s, c = n.elementContext, u = c === void 0 ? K : c, m = n.altBoundary, v = m === void 0 ? false : m, l = n.padding, h = l === void 0 ? 0 : l, p = ft(typeof h != "number" ? h : ct(h, G)), g = u === K ? Ye : K, x = t.rects.popper, y = t.elements[v ? g : u], $ = Gt(Q(y) ? y : y.contextElement || I(t.elements.popper), a, f), d = ee(t.elements.reference), b = mt({ reference: d, element: x, placement: o }), w = Te(Object.assign({}, x, b)), O = u === K ? w : d, j = { top: $.top - O.top + p.top, bottom: O.bottom - $.bottom + p.bottom, left: $.left - O.left + p.left, right: O.right - $.right + p.right }, A = t.modifiersData.offset;
  if (u === K && A) {
    var k = A[o];
    Object.keys(j).forEach(function(D) {
      var S = [W, R].indexOf(D) >= 0 ? 1 : -1, L = [E, R].indexOf(D) >= 0 ? "y" : "x";
      j[D] += k[L] * S;
    });
  }
  return j;
}
function Jt(t, e) {
  e === void 0 && (e = {});
  var n = e, r = n.placement, o = n.boundary, i = n.rootBoundary, a = n.padding, s = n.flipVariations, f = n.allowedAutoPlacements, c = f === void 0 ? Ee : f, u = te(r), m = u ? s ? De : De.filter(function(h) {
    return te(h) === u;
  }) : G, v = m.filter(function(h) {
    return c.indexOf(h) >= 0;
  });
  v.length === 0 && (v = m);
  var l = v.reduce(function(h, p) {
    return h[p] = ne(t, { placement: p, boundary: o, rootBoundary: i, padding: a })[q(p)], h;
  }, {});
  return Object.keys(l).sort(function(h, p) {
    return l[h] - l[p];
  });
}
function Kt(t) {
  if (q(t) === me) return [];
  var e = be(t);
  return [lt(t), e, lt(e)];
}
function Qt(t) {
  var e = t.state, n = t.options, r = t.name;
  if (!e.modifiersData[r]._skip) {
    for (var o = n.mainAxis, i = o === void 0 ? true : o, a = n.altAxis, s = a === void 0 ? true : a, f = n.fallbackPlacements, c = n.padding, u = n.boundary, m = n.rootBoundary, v = n.altBoundary, l = n.flipVariations, h = l === void 0 ? true : l, p = n.allowedAutoPlacements, g = e.options.placement, x = q(g), y = x === g, $ = f || (y || !h ? [be(g)] : Kt(g)), d = [g].concat($).reduce(function(z, V) {
      return z.concat(q(V) === me ? Jt(e, { placement: V, boundary: u, rootBoundary: m, padding: c, flipVariations: h, allowedAutoPlacements: p }) : V);
    }, []), b = e.rects.reference, w = e.rects.popper, O = /* @__PURE__ */ new Map(), j = true, A = d[0], k = 0; k < d.length; k++) {
      var D = d[k], S = q(D), L = te(D) === U, re = [E, R].indexOf(S) >= 0, oe = re ? "width" : "height", M = ne(e, { placement: D, boundary: u, rootBoundary: m, altBoundary: v, padding: c }), T = re ? L ? W : P : L ? R : E;
      b[oe] > w[oe] && (T = be(T));
      var pe = be(T), _ = [];
      if (i && _.push(M[S] <= 0), s && _.push(M[T] <= 0, M[pe] <= 0), _.every(function(z) {
        return z;
      })) {
        A = D, j = false;
        break;
      }
      O.set(D, _);
    }
    if (j) for (var ue = h ? 3 : 1, xe = function(z) {
      var V = d.find(function(de) {
        var ae = O.get(de);
        if (ae) return ae.slice(0, z).every(function(Y) {
          return Y;
        });
      });
      if (V) return A = V, "break";
    }, ie = ue; ie > 0; ie--) {
      var le = xe(ie);
      if (le === "break") break;
    }
    e.placement !== A && (e.modifiersData[r]._skip = true, e.placement = A, e.reset = true);
  }
}
var vt = { name: "flip", enabled: true, phase: "main", fn: Qt, requiresIfExists: ["offset"], data: { _skip: false } };
function gt(t, e, n) {
  return n === void 0 && (n = { x: 0, y: 0 }), { top: t.top - e.height - n.y, right: t.right - e.width + n.x, bottom: t.bottom - e.height + n.y, left: t.left - e.width - n.x };
}
function yt(t) {
  return [E, W, R, P].some(function(e) {
    return t[e] >= 0;
  });
}
function Zt(t) {
  var e = t.state, n = t.name, r = e.rects.reference, o = e.rects.popper, i = e.modifiersData.preventOverflow, a = ne(e, { elementContext: "reference" }), s = ne(e, { altBoundary: true }), f = gt(a, r), c = gt(s, o, i), u = yt(f), m = yt(c);
  e.modifiersData[n] = { referenceClippingOffsets: f, popperEscapeOffsets: c, isReferenceHidden: u, hasPopperEscaped: m }, e.attributes.popper = Object.assign({}, e.attributes.popper, { "data-popper-reference-hidden": u, "data-popper-escaped": m });
}
var bt = { name: "hide", enabled: true, phase: "main", requiresIfExists: ["preventOverflow"], fn: Zt };
function en(t, e, n) {
  var r = q(t), o = [P, E].indexOf(r) >= 0 ? -1 : 1, i = typeof n == "function" ? n(Object.assign({}, e, { placement: t })) : n, a = i[0], s = i[1];
  return a = a || 0, s = (s || 0) * o, [P, W].indexOf(r) >= 0 ? { x: s, y: a } : { x: a, y: s };
}
function tn(t) {
  var e = t.state, n = t.options, r = t.name, o = n.offset, i = o === void 0 ? [0, 0] : o, a = Ee.reduce(function(u, m) {
    return u[m] = en(m, e.rects, i), u;
  }, {}), s = a[e.placement], f = s.x, c = s.y;
  e.modifiersData.popperOffsets != null && (e.modifiersData.popperOffsets.x += f, e.modifiersData.popperOffsets.y += c), e.modifiersData[r] = a;
}
var wt = { name: "offset", enabled: true, phase: "main", requires: ["popperOffsets"], fn: tn };
function nn(t) {
  var e = t.state, n = t.name;
  e.modifiersData[n] = mt({ reference: e.rects.reference, element: e.rects.popper, placement: e.placement });
}
var He = { name: "popperOffsets", enabled: true, phase: "read", fn: nn, data: {} };
function rn(t) {
  return t === "x" ? "y" : "x";
}
function on(t) {
  var e = t.state, n = t.options, r = t.name, o = n.mainAxis, i = o === void 0 ? true : o, a = n.altAxis, s = a === void 0 ? false : a, f = n.boundary, c = n.rootBoundary, u = n.altBoundary, m = n.padding, v = n.tether, l = v === void 0 ? true : v, h = n.tetherOffset, p = h === void 0 ? 0 : h, g = ne(e, { boundary: f, rootBoundary: c, padding: m, altBoundary: u }), x = q(e.placement), y = te(e.placement), $ = !y, d = Le(x), b = rn(d), w = e.modifiersData.popperOffsets, O = e.rects.reference, j = e.rects.popper, A = typeof p == "function" ? p(Object.assign({}, e.rects, { placement: e.placement })) : p, k = typeof A == "number" ? { mainAxis: A, altAxis: A } : Object.assign({ mainAxis: 0, altAxis: 0 }, A), D = e.modifiersData.offset ? e.modifiersData.offset[e.placement] : null, S = { x: 0, y: 0 };
  if (w) {
    if (i) {
      var L, re = d === "y" ? E : P, oe = d === "y" ? R : W, M = d === "y" ? "height" : "width", T = w[d], pe = T + g[re], _ = T - g[oe], ue = l ? -j[M] / 2 : 0, xe = y === U ? O[M] : j[M], ie = y === U ? -j[M] : -O[M], le = e.elements.arrow, z = l && le ? ke(le) : { width: 0, height: 0 }, V = e.modifiersData["arrow#persistent"] ? e.modifiersData["arrow#persistent"].padding : st(), de = V[re], ae = V[oe], Y = fe(0, O[M], z[M]), jt = $ ? O[M] / 2 - ue - Y - de - k.mainAxis : xe - Y - de - k.mainAxis, Dt = $ ? -O[M] / 2 + ue + Y + ae + k.mainAxis : ie + Y + ae + k.mainAxis, Oe = e.elements.arrow && se(e.elements.arrow), Et = Oe ? d === "y" ? Oe.clientTop || 0 : Oe.clientLeft || 0 : 0, Ce = (L = D == null ? void 0 : D[d]) != null ? L : 0, Pt = T + jt - Ce - Et, At = T + Dt - Ce, qe = fe(l ? ve(pe, Pt) : pe, T, l ? X(_, At) : _);
      w[d] = qe, S[d] = qe - T;
    }
    if (s) {
      var Ve, kt = d === "x" ? E : P, Lt = d === "x" ? R : W, F = w[b], he = b === "y" ? "height" : "width", Ne = F + g[kt], Ie = F - g[Lt], $e = [E, P].indexOf(x) !== -1, _e = (Ve = D == null ? void 0 : D[b]) != null ? Ve : 0, ze = $e ? Ne : F - O[he] - j[he] - _e + k.altAxis, Fe = $e ? F + O[he] + j[he] - _e - k.altAxis : Ie, Ue = l && $e ? St(ze, F, Fe) : fe(l ? ze : Ne, F, l ? Fe : Ie);
      w[b] = Ue, S[b] = Ue - F;
    }
    e.modifiersData[r] = S;
  }
}
var xt = { name: "preventOverflow", enabled: true, phase: "main", fn: on, requiresIfExists: ["offset"] };
function an(t) {
  return { scrollLeft: t.scrollLeft, scrollTop: t.scrollTop };
}
function sn(t) {
  return t === H(t) || !B(t) ? We(t) : an(t);
}
function fn(t) {
  var e = t.getBoundingClientRect(), n = Z(e.width) / t.offsetWidth || 1, r = Z(e.height) / t.offsetHeight || 1;
  return n !== 1 || r !== 1;
}
function cn(t, e, n) {
  n === void 0 && (n = false);
  var r = B(e), o = B(e) && fn(e), i = I(e), a = ee(t, o), s = { scrollLeft: 0, scrollTop: 0 }, f = { x: 0, y: 0 };
  return (r || !r && !n) && ((C(e) !== "body" || Se(i)) && (s = sn(e)), B(e) ? (f = ee(e, true), f.x += e.clientLeft, f.y += e.clientTop) : i && (f.x = Be(i))), { x: a.left + s.scrollLeft - f.x, y: a.top + s.scrollTop - f.y, width: a.width, height: a.height };
}
function pn(t) {
  var e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = [];
  t.forEach(function(i) {
    e.set(i.name, i);
  });
  function o(i) {
    n.add(i.name);
    var a = [].concat(i.requires || [], i.requiresIfExists || []);
    a.forEach(function(s) {
      if (!n.has(s)) {
        var f = e.get(s);
        f && o(f);
      }
    }), r.push(i);
  }
  return t.forEach(function(i) {
    n.has(i.name) || o(i);
  }), r;
}
function un(t) {
  var e = pn(t);
  return ot.reduce(function(n, r) {
    return n.concat(e.filter(function(o) {
      return o.phase === r;
    }));
  }, []);
}
function ln(t) {
  var e;
  return function() {
    return e || (e = new Promise(function(n) {
      Promise.resolve().then(function() {
        e = void 0, n(t());
      });
    })), e;
  };
}
function dn(t) {
  var e = t.reduce(function(n, r) {
    var o = n[r.name];
    return n[r.name] = o ? Object.assign({}, o, r, { options: Object.assign({}, o.options, r.options), data: Object.assign({}, o.data, r.data) }) : r, n;
  }, {});
  return Object.keys(e).map(function(n) {
    return e[n];
  });
}
var Ot = { placement: "bottom", modifiers: [], strategy: "absolute" };
function $t() {
  for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) e[n] = arguments[n];
  return !e.some(function(r) {
    return !(r && typeof r.getBoundingClientRect == "function");
  });
}
function we(t) {
  t === void 0 && (t = {});
  var e = t, n = e.defaultModifiers, r = n === void 0 ? [] : n, o = e.defaultOptions, i = o === void 0 ? Ot : o;
  return function(a, s, f) {
    f === void 0 && (f = i);
    var c = { placement: "bottom", orderedModifiers: [], options: Object.assign({}, Ot, i), modifiersData: {}, elements: { reference: a, popper: s }, attributes: {}, styles: {} }, u = [], m = false, v = { state: c, setOptions: function(p) {
      var g = typeof p == "function" ? p(c.options) : p;
      h(), c.options = Object.assign({}, i, c.options, g), c.scrollParents = { reference: Q(a) ? ce(a) : a.contextElement ? ce(a.contextElement) : [], popper: ce(s) };
      var x = un(dn([].concat(r, c.options.modifiers)));
      return c.orderedModifiers = x.filter(function(y) {
        return y.enabled;
      }), l(), v.update();
    }, forceUpdate: function() {
      if (!m) {
        var p = c.elements, g = p.reference, x = p.popper;
        if ($t(g, x)) {
          c.rects = { reference: cn(g, se(x), c.options.strategy === "fixed"), popper: ke(x) }, c.reset = false, c.placement = c.options.placement, c.orderedModifiers.forEach(function(j) {
            return c.modifiersData[j.name] = Object.assign({}, j.data);
          });
          for (var y = 0; y < c.orderedModifiers.length; y++) {
            if (c.reset === true) {
              c.reset = false, y = -1;
              continue;
            }
            var $ = c.orderedModifiers[y], d = $.fn, b = $.options, w = b === void 0 ? {} : b, O = $.name;
            typeof d == "function" && (c = d({ state: c, options: w, name: O, instance: v }) || c);
          }
        }
      }
    }, update: ln(function() {
      return new Promise(function(p) {
        v.forceUpdate(), p(c);
      });
    }), destroy: function() {
      h(), m = true;
    } };
    if (!$t(a, s)) return v;
    v.setOptions(f).then(function(p) {
      !m && f.onFirstUpdate && f.onFirstUpdate(p);
    });
    function l() {
      c.orderedModifiers.forEach(function(p) {
        var g = p.name, x = p.options, y = x === void 0 ? {} : x, $ = p.effect;
        if (typeof $ == "function") {
          var d = $({ state: c, name: g, instance: v, options: y }), b = function() {
          };
          u.push(d || b);
        }
      });
    }
    function h() {
      u.forEach(function(p) {
        return p();
      }), u = [];
    }
    return v;
  };
}
we();
var mn = [Re, He, Me, Ae];
we({ defaultModifiers: mn });
var gn = [Re, He, Me, Ae, wt, vt, xt, pt, bt], yn = we({ defaultModifiers: gn });
const popperArrowProps = buildProps({
  arrowOffset: {
    type: Number,
    default: 5
  }
});
const POSITIONING_STRATEGIES = ["fixed", "absolute"];
const popperCoreConfigProps = buildProps({
  boundariesPadding: {
    type: Number,
    default: 0
  },
  fallbackPlacements: {
    type: definePropType(Array),
    default: void 0
  },
  gpuAcceleration: {
    type: Boolean,
    default: true
  },
  offset: {
    type: Number,
    default: 12
  },
  placement: {
    type: String,
    values: Ee,
    default: "bottom"
  },
  popperOptions: {
    type: definePropType(Object),
    default: () => ({})
  },
  strategy: {
    type: String,
    values: POSITIONING_STRATEGIES,
    default: "absolute"
  }
});
const popperContentProps = buildProps({
  ...popperCoreConfigProps,
  ...popperArrowProps,
  id: String,
  style: {
    type: definePropType([String, Array, Object])
  },
  className: {
    type: definePropType([String, Array, Object])
  },
  effect: {
    type: definePropType(String),
    default: "dark"
  },
  visible: Boolean,
  enterable: {
    type: Boolean,
    default: true
  },
  pure: Boolean,
  focusOnShow: Boolean,
  trapping: Boolean,
  popperClass: {
    type: definePropType([String, Array, Object])
  },
  popperStyle: {
    type: definePropType([String, Array, Object])
  },
  referenceEl: {
    type: definePropType(Object)
  },
  triggerTargetEl: {
    type: definePropType(Object)
  },
  stopPopperMouseEvent: {
    type: Boolean,
    default: true
  },
  virtualTriggering: Boolean,
  zIndex: Number,
  ...useAriaProps(["ariaLabel"]),
  loop: Boolean
});
const popperContentEmits = {
  mouseenter: (evt) => evt instanceof MouseEvent,
  mouseleave: (evt) => evt instanceof MouseEvent,
  focus: () => true,
  blur: () => true,
  close: () => true
};
const usePopperContentFocusTrap = (props, emit) => {
  const trapped = ref(false);
  const focusStartRef = ref();
  const onFocusAfterTrapped = () => {
    emit("focus");
  };
  const onFocusAfterReleased = (event) => {
    var _a;
    if (((_a = event.detail) == null ? void 0 : _a.focusReason) !== "pointer") {
      focusStartRef.value = "first";
      emit("blur");
    }
  };
  const onFocusInTrap = (event) => {
    if (props.visible && !trapped.value) {
      if (event.target) {
        focusStartRef.value = event.target;
      }
      trapped.value = true;
    }
  };
  const onFocusoutPrevented = (event) => {
    if (!props.trapping) {
      if (event.detail.focusReason === "pointer") {
        event.preventDefault();
      }
      trapped.value = false;
    }
  };
  const onReleaseRequested = () => {
    trapped.value = false;
    emit("close");
  };
  return {
    focusStartRef,
    trapped,
    onFocusAfterReleased,
    onFocusAfterTrapped,
    onFocusInTrap,
    onFocusoutPrevented,
    onReleaseRequested
  };
};
const buildPopperOptions = (props, modifiers = []) => {
  const { placement, strategy, popperOptions } = props;
  const options = {
    placement,
    strategy,
    ...popperOptions,
    modifiers: [...genModifiers(props), ...modifiers]
  };
  deriveExtraModifiers(options, popperOptions == null ? void 0 : popperOptions.modifiers);
  return options;
};
const unwrapMeasurableEl = ($el) => {
  if (!isClient)
    return;
  return unrefElement($el);
};
function genModifiers(options) {
  const { offset, gpuAcceleration, fallbackPlacements } = options;
  return [
    {
      name: "offset",
      options: {
        offset: [0, offset != null ? offset : 12]
      }
    },
    {
      name: "preventOverflow",
      options: {
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      }
    },
    {
      name: "flip",
      options: {
        padding: 5,
        fallbackPlacements
      }
    },
    {
      name: "computeStyles",
      options: {
        gpuAcceleration
      }
    }
  ];
}
function deriveExtraModifiers(options, modifiers) {
  if (modifiers) {
    options.modifiers = [...options.modifiers, ...modifiers != null ? modifiers : []];
  }
}
const usePopper = (referenceElementRef, popperElementRef, opts = {}) => {
  const stateUpdater = {
    name: "updateState",
    enabled: true,
    phase: "write",
    fn: ({ state }) => {
      const derivedState = deriveState(state);
      Object.assign(states.value, derivedState);
    },
    requires: ["computeStyles"]
  };
  const options = computed(() => {
    const { onFirstUpdate, placement, strategy, modifiers } = unref(opts);
    return {
      onFirstUpdate,
      placement: placement || "bottom",
      strategy: strategy || "absolute",
      modifiers: [
        ...modifiers || [],
        stateUpdater,
        { name: "applyStyles", enabled: false }
      ]
    };
  });
  const instanceRef = shallowRef();
  const states = ref({
    styles: {
      popper: {
        position: unref(options).strategy,
        left: "0",
        top: "0"
      },
      arrow: {
        position: "absolute"
      }
    },
    attributes: {}
  });
  const destroy = () => {
    if (!instanceRef.value)
      return;
    instanceRef.value.destroy();
    instanceRef.value = void 0;
  };
  watch(options, (newOptions) => {
    const instance = unref(instanceRef);
    if (instance) {
      instance.setOptions(newOptions);
    }
  }, {
    deep: true
  });
  watch([referenceElementRef, popperElementRef], ([referenceElement, popperElement]) => {
    destroy();
    if (!referenceElement || !popperElement)
      return;
    instanceRef.value = yn(referenceElement, popperElement, unref(options));
  });
  onBeforeUnmount(() => {
    destroy();
  });
  return {
    state: computed(() => {
      var _a;
      return { ...((_a = unref(instanceRef)) == null ? void 0 : _a.state) || {} };
    }),
    styles: computed(() => unref(states).styles),
    attributes: computed(() => unref(states).attributes),
    update: () => {
      var _a;
      return (_a = unref(instanceRef)) == null ? void 0 : _a.update();
    },
    forceUpdate: () => {
      var _a;
      return (_a = unref(instanceRef)) == null ? void 0 : _a.forceUpdate();
    },
    instanceRef: computed(() => unref(instanceRef))
  };
};
function deriveState(state) {
  const elements = Object.keys(state.elements);
  const styles = fromPairs(elements.map((element) => [element, state.styles[element] || {}]));
  const attributes = fromPairs(elements.map((element) => [element, state.attributes[element]]));
  return {
    styles,
    attributes
  };
}
const DEFAULT_ARROW_OFFSET = 0;
const usePopperContent = (props) => {
  const { popperInstanceRef, contentRef, triggerRef, role } = inject(POPPER_INJECTION_KEY, void 0);
  const arrowRef = ref();
  const arrowOffset = computed(() => props.arrowOffset);
  const eventListenerModifier = computed(() => {
    return {
      name: "eventListeners",
      enabled: !!props.visible
    };
  });
  const arrowModifier = computed(() => {
    var _a;
    const arrowEl = unref(arrowRef);
    const offset = (_a = unref(arrowOffset)) != null ? _a : DEFAULT_ARROW_OFFSET;
    return {
      name: "arrow",
      enabled: !isUndefined(arrowEl),
      options: {
        element: arrowEl,
        padding: offset
      }
    };
  });
  const options = computed(() => {
    return {
      onFirstUpdate: () => {
        update();
      },
      ...buildPopperOptions(props, [
        unref(arrowModifier),
        unref(eventListenerModifier)
      ])
    };
  });
  const computedReference = computed(() => unwrapMeasurableEl(props.referenceEl) || unref(triggerRef));
  const { attributes, state, styles, update, forceUpdate, instanceRef } = usePopper(computedReference, contentRef, options);
  watch(instanceRef, (instance) => popperInstanceRef.value = instance, {
    flush: "sync"
  });
  onMounted(() => {
    watch(() => {
      var _a, _b;
      return (_b = (_a = unref(computedReference)) == null ? void 0 : _a.getBoundingClientRect) == null ? void 0 : _b.call(_a);
    }, () => {
      update();
    });
  });
  return {
    attributes,
    arrowRef,
    contentRef,
    instanceRef,
    state,
    styles,
    role,
    forceUpdate,
    update
  };
};
const usePopperContentDOM = (props, {
  attributes,
  styles,
  role
}) => {
  const { nextZIndex } = useZIndex();
  const ns = useNamespace("popper");
  const contentAttrs = computed(() => unref(attributes).popper);
  const contentZIndex = ref(isNumber(props.zIndex) ? props.zIndex : nextZIndex());
  const contentClass = computed(() => [
    ns.b(),
    ns.is("pure", props.pure),
    ns.is(props.effect),
    props.popperClass
  ]);
  const contentStyle = computed(() => {
    return [
      { zIndex: unref(contentZIndex) },
      unref(styles).popper,
      props.popperStyle || {}
    ];
  });
  const ariaModal = computed(() => role.value === "dialog" ? "false" : void 0);
  const arrowStyle = computed(() => unref(styles).arrow || {});
  const updateZIndex = () => {
    contentZIndex.value = isNumber(props.zIndex) ? props.zIndex : nextZIndex();
  };
  return {
    ariaModal,
    arrowStyle,
    contentAttrs,
    contentClass,
    contentStyle,
    contentZIndex,
    updateZIndex
  };
};
const __default__$h = defineComponent({
  name: "ElPopperContent"
});
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  ...__default__$h,
  props: popperContentProps,
  emits: popperContentEmits,
  setup(__props, { expose, emit }) {
    const props = __props;
    const {
      focusStartRef,
      trapped,
      onFocusAfterReleased,
      onFocusAfterTrapped,
      onFocusInTrap,
      onFocusoutPrevented,
      onReleaseRequested
    } = usePopperContentFocusTrap(props, emit);
    const { attributes, arrowRef, contentRef, styles, instanceRef, role, update } = usePopperContent(props);
    const {
      ariaModal,
      arrowStyle,
      contentAttrs,
      contentClass,
      contentStyle,
      updateZIndex
    } = usePopperContentDOM(props, {
      styles,
      attributes,
      role
    });
    const formItemContext = inject(formItemContextKey, void 0);
    provide(POPPER_CONTENT_INJECTION_KEY, {
      arrowStyle,
      arrowRef
    });
    if (formItemContext) {
      provide(formItemContextKey, {
        ...formItemContext,
        addInputId: NOOP,
        removeInputId: NOOP
      });
    }
    let triggerTargetAriaStopWatch = void 0;
    const updatePopper = (shouldUpdateZIndex = true) => {
      update();
      shouldUpdateZIndex && updateZIndex();
    };
    const togglePopperAlive = () => {
      updatePopper(false);
      if (props.visible && props.focusOnShow) {
        trapped.value = true;
      } else if (props.visible === false) {
        trapped.value = false;
      }
    };
    onMounted(() => {
      watch(() => props.triggerTargetEl, (triggerTargetEl, prevTriggerTargetEl) => {
        triggerTargetAriaStopWatch == null ? void 0 : triggerTargetAriaStopWatch();
        triggerTargetAriaStopWatch = void 0;
        const el = unref(triggerTargetEl || contentRef.value);
        const prevEl = unref(prevTriggerTargetEl || contentRef.value);
        if (isElement(el)) {
          triggerTargetAriaStopWatch = watch([role, () => props.ariaLabel, ariaModal, () => props.id], (watches) => {
            ["role", "aria-label", "aria-modal", "id"].forEach((key, idx) => {
              isNil(watches[idx]) ? el.removeAttribute(key) : el.setAttribute(key, watches[idx]);
            });
          }, { immediate: true });
        }
        if (prevEl !== el && isElement(prevEl)) {
          ["role", "aria-label", "aria-modal", "id"].forEach((key) => {
            prevEl.removeAttribute(key);
          });
        }
      }, { immediate: true });
      watch(() => props.visible, togglePopperAlive, { immediate: true });
    });
    onBeforeUnmount(() => {
      triggerTargetAriaStopWatch == null ? void 0 : triggerTargetAriaStopWatch();
      triggerTargetAriaStopWatch = void 0;
    });
    expose({
      popperContentRef: contentRef,
      popperInstanceRef: instanceRef,
      updatePopper,
      contentStyle
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "contentRef",
        ref: contentRef
      }, unref(contentAttrs), {
        style: unref(contentStyle),
        class: unref(contentClass),
        tabindex: "-1",
        onMouseenter: (e) => _ctx.$emit("mouseenter", e),
        onMouseleave: (e) => _ctx.$emit("mouseleave", e)
      }), [
        createVNode(unref(ElFocusTrap), {
          loop: _ctx.loop,
          trapped: unref(trapped),
          "trap-on-focus-in": true,
          "focus-trap-el": unref(contentRef),
          "focus-start-el": unref(focusStartRef),
          onFocusAfterTrapped: unref(onFocusAfterTrapped),
          onFocusAfterReleased: unref(onFocusAfterReleased),
          onFocusin: unref(onFocusInTrap),
          onFocusoutPrevented: unref(onFocusoutPrevented),
          onReleaseRequested: unref(onReleaseRequested)
        }, {
          default: withCtx(() => [
            renderSlot(_ctx.$slots, "default")
          ]),
          _: 3
        }, 8, ["loop", "trapped", "focus-trap-el", "focus-start-el", "onFocusAfterTrapped", "onFocusAfterReleased", "onFocusin", "onFocusoutPrevented", "onReleaseRequested"])
      ], 16, ["onMouseenter", "onMouseleave"]);
    };
  }
});
var ElPopperContent = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["__file", "content.vue"]]);
const ElPopper = withInstall(Popper);
const TOOLTIP_INJECTION_KEY = Symbol("elTooltip");
const teleportProps = buildProps({
  to: {
    type: definePropType([String, Object]),
    required: true
  },
  disabled: Boolean
});
const useTooltipContentProps = buildProps({
  ...useDelayedToggleProps,
  ...popperContentProps,
  appendTo: {
    type: teleportProps.to.type
  },
  content: {
    type: String,
    default: ""
  },
  rawContent: Boolean,
  persistent: Boolean,
  visible: {
    type: definePropType(Boolean),
    default: null
  },
  transition: String,
  teleported: {
    type: Boolean,
    default: true
  },
  disabled: Boolean,
  ...useAriaProps(["ariaLabel"])
});
const useTooltipTriggerProps = buildProps({
  ...popperTriggerProps,
  disabled: Boolean,
  trigger: {
    type: definePropType([String, Array]),
    default: "hover"
  },
  triggerKeys: {
    type: definePropType(Array),
    default: () => [EVENT_CODE.enter, EVENT_CODE.numpadEnter, EVENT_CODE.space]
  },
  focusOnTarget: Boolean
});
const _prop = buildProp({
  type: definePropType(Boolean),
  default: null
});
const _event = buildProp({
  type: definePropType(Function)
});
const createModelToggleComposable = (name) => {
  const updateEventKey = `update:${name}`;
  const updateEventKeyRaw = `onUpdate:${name}`;
  const useModelToggleEmits2 = [updateEventKey];
  const useModelToggleProps2 = {
    [name]: _prop,
    [updateEventKeyRaw]: _event
  };
  const useModelToggle2 = ({
    indicator,
    toggleReason,
    shouldHideWhenRouteChanges,
    shouldProceed,
    onShow,
    onHide
  }) => {
    const instance = getCurrentInstance();
    const { emit } = instance;
    const props = instance.props;
    const hasUpdateHandler = computed(() => isFunction(props[updateEventKeyRaw]));
    const isModelBindingAbsent = computed(() => props[name] === null);
    const doShow = (event) => {
      if (indicator.value === true) {
        return;
      }
      indicator.value = true;
      if (toggleReason) {
        toggleReason.value = event;
      }
      if (isFunction(onShow)) {
        onShow(event);
      }
    };
    const doHide = (event) => {
      if (indicator.value === false) {
        return;
      }
      indicator.value = false;
      if (toggleReason) {
        toggleReason.value = event;
      }
      if (isFunction(onHide)) {
        onHide(event);
      }
    };
    const show = (event) => {
      if (props.disabled === true || isFunction(shouldProceed) && !shouldProceed())
        return;
      const shouldEmit = hasUpdateHandler.value && isClient;
      if (shouldEmit) {
        emit(updateEventKey, true);
      }
      if (isModelBindingAbsent.value || !shouldEmit) {
        doShow(event);
      }
    };
    const hide = (event) => {
      if (props.disabled === true || !isClient)
        return;
      const shouldEmit = hasUpdateHandler.value && isClient;
      if (shouldEmit) {
        emit(updateEventKey, false);
      }
      if (isModelBindingAbsent.value || !shouldEmit) {
        doHide(event);
      }
    };
    const onChange = (val) => {
      if (!isBoolean(val))
        return;
      if (props.disabled && val) {
        if (hasUpdateHandler.value) {
          emit(updateEventKey, false);
        }
      } else if (indicator.value !== val) {
        if (val) {
          doShow();
        } else {
          doHide();
        }
      }
    };
    const toggle = () => {
      if (indicator.value) {
        hide();
      } else {
        show();
      }
    };
    watch(() => props[name], onChange);
    if (shouldHideWhenRouteChanges && instance.appContext.config.globalProperties.$route !== void 0) {
      watch(() => ({
        ...instance.proxy.$route
      }), () => {
        if (shouldHideWhenRouteChanges.value && indicator.value) {
          hide();
        }
      });
    }
    onMounted(() => {
      onChange(props[name]);
    });
    return {
      hide,
      show,
      toggle,
      hasUpdateHandler
    };
  };
  return {
    useModelToggle: useModelToggle2,
    useModelToggleProps: useModelToggleProps2,
    useModelToggleEmits: useModelToggleEmits2
  };
};
const {
  useModelToggleProps: useTooltipModelToggleProps,
  useModelToggleEmits: useTooltipModelToggleEmits,
  useModelToggle: useTooltipModelToggle
} = createModelToggleComposable("visible");
const useTooltipProps = buildProps({
  ...popperProps,
  ...useTooltipModelToggleProps,
  ...useTooltipContentProps,
  ...useTooltipTriggerProps,
  ...popperArrowProps,
  showArrow: {
    type: Boolean,
    default: true
  }
});
const tooltipEmits = [
  ...useTooltipModelToggleEmits,
  "before-show",
  "before-hide",
  "show",
  "hide",
  "open",
  "close"
];
const isTriggerType = (trigger, type) => {
  if (isArray$1(trigger)) {
    return trigger.includes(type);
  }
  return trigger === type;
};
const whenTrigger = (trigger, type, handler) => {
  return (e) => {
    isTriggerType(unref(trigger), type) && handler(e);
  };
};
const __default__$g = defineComponent({
  name: "ElTooltipTrigger"
});
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  ...__default__$g,
  props: useTooltipTriggerProps,
  setup(__props, { expose }) {
    const props = __props;
    const ns = useNamespace("tooltip");
    const { controlled, id, open, onOpen, onClose, onToggle } = inject(TOOLTIP_INJECTION_KEY, void 0);
    const triggerRef = ref(null);
    const stopWhenControlledOrDisabled = () => {
      if (unref(controlled) || props.disabled) {
        return true;
      }
    };
    const trigger = toRef(props, "trigger");
    const onMouseenter = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "hover", (e) => {
      onOpen(e);
      if (props.focusOnTarget && e.target) {
        nextTick(() => {
          focusElement(e.target, { preventScroll: true });
        });
      }
    }));
    const onMouseleave = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "hover", onClose));
    const onClick = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "click", (e) => {
      if (e.button === 0) {
        onToggle(e);
      }
    }));
    const onFocus = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "focus", onOpen));
    const onBlur = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "focus", onClose));
    const onContextMenu = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "contextmenu", (e) => {
      e.preventDefault();
      onToggle(e);
    }));
    const onKeydown = composeEventHandlers(stopWhenControlledOrDisabled, (e) => {
      const code = getEventCode(e);
      if (props.triggerKeys.includes(code)) {
        e.preventDefault();
        onToggle(e);
      }
    });
    expose({
      triggerRef
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElPopperTrigger), {
        id: unref(id),
        "virtual-ref": _ctx.virtualRef,
        open: unref(open),
        "virtual-triggering": _ctx.virtualTriggering,
        class: normalizeClass(unref(ns).e("trigger")),
        onBlur: unref(onBlur),
        onClick: unref(onClick),
        onContextmenu: unref(onContextMenu),
        onFocus: unref(onFocus),
        onMouseenter: unref(onMouseenter),
        onMouseleave: unref(onMouseleave),
        onKeydown: unref(onKeydown)
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
      }, 8, ["id", "virtual-ref", "open", "virtual-triggering", "class", "onBlur", "onClick", "onContextmenu", "onFocus", "onMouseenter", "onMouseleave", "onKeydown"]);
    };
  }
});
var ElTooltipTrigger = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__file", "trigger.vue"]]);
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "teleport",
  props: teleportProps,
  setup(__props) {
    return (_ctx, _cache) => {
      return _ctx.disabled ? renderSlot(_ctx.$slots, "default", { key: 0 }) : (openBlock(), createBlock(Teleport$1, {
        key: 1,
        to: _ctx.to
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 8, ["to"]));
    };
  }
});
var Teleport = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["__file", "teleport.vue"]]);
const ElTeleport = withInstall(Teleport);
const usePopperContainerId = () => {
  const namespace = useGetDerivedNamespace();
  const idInjection = useIdInjection();
  const id = computed(() => {
    return `${namespace.value}-popper-container-${idInjection.prefix}`;
  });
  const selector = computed(() => `#${id.value}`);
  return {
    id,
    selector
  };
};
const createContainer = (id) => {
  const container = document.createElement("div");
  container.id = id;
  document.body.appendChild(container);
  return container;
};
const usePopperContainer = () => {
  const { id, selector } = usePopperContainerId();
  onBeforeMount(() => {
    if (!isClient)
      return;
    if (!document.body.querySelector(selector.value)) {
      createContainer(id.value);
    }
  });
  return {
    id,
    selector
  };
};
const extractFirst = (arr) => {
  return isArray$1(arr) ? arr[0] : arr;
};
const castArray = (arr) => {
  if (!arr && arr !== 0)
    return [];
  return isArray$1(arr) ? arr : [arr];
};
const __default__$f = defineComponent({
  name: "ElTooltipContent",
  inheritAttrs: false
});
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  ...__default__$f,
  props: useTooltipContentProps,
  setup(__props, { expose }) {
    const props = __props;
    const { selector } = usePopperContainerId();
    const ns = useNamespace("tooltip");
    const contentRef = ref();
    const popperContentRef = computedEager(() => {
      var _a;
      return (_a = contentRef.value) == null ? void 0 : _a.popperContentRef;
    });
    let stopHandle;
    const {
      controlled,
      id,
      open,
      trigger,
      onClose,
      onOpen,
      onShow,
      onHide,
      onBeforeShow,
      onBeforeHide
    } = inject(TOOLTIP_INJECTION_KEY, void 0);
    const transitionClass = computed(() => {
      return props.transition || `${ns.namespace.value}-fade-in-linear`;
    });
    const persistentRef = computed(() => {
      return props.persistent;
    });
    onBeforeUnmount(() => {
      stopHandle == null ? void 0 : stopHandle();
    });
    const shouldRender = computed(() => {
      return unref(persistentRef) ? true : unref(open);
    });
    const shouldShow = computed(() => {
      return props.disabled ? false : unref(open);
    });
    const appendTo = computed(() => {
      return props.appendTo || selector.value;
    });
    const contentStyle = computed(() => {
      var _a;
      return (_a = props.style) != null ? _a : {};
    });
    const ariaHidden = ref(true);
    const onTransitionLeave = () => {
      onHide();
      isFocusInsideContent() && focusElement(document.body, { preventScroll: true });
      ariaHidden.value = true;
    };
    const stopWhenControlled = () => {
      if (unref(controlled))
        return true;
    };
    const onContentEnter = composeEventHandlers(stopWhenControlled, () => {
      if (props.enterable && isTriggerType(unref(trigger), "hover")) {
        onOpen();
      }
    });
    const onContentLeave = composeEventHandlers(stopWhenControlled, () => {
      if (isTriggerType(unref(trigger), "hover")) {
        onClose();
      }
    });
    const onBeforeEnter = () => {
      var _a, _b;
      (_b = (_a = contentRef.value) == null ? void 0 : _a.updatePopper) == null ? void 0 : _b.call(_a);
      onBeforeShow == null ? void 0 : onBeforeShow();
    };
    const onBeforeLeave = () => {
      onBeforeHide == null ? void 0 : onBeforeHide();
    };
    const onAfterShow = () => {
      onShow();
    };
    const onBlur = () => {
      if (!props.virtualTriggering) {
        onClose();
      }
    };
    const isFocusInsideContent = (event) => {
      var _a;
      const popperContent = (_a = contentRef.value) == null ? void 0 : _a.popperContentRef;
      const activeElement = (event == null ? void 0 : event.relatedTarget) || document.activeElement;
      return popperContent == null ? void 0 : popperContent.contains(activeElement);
    };
    watch(() => unref(open), (val) => {
      if (!val) {
        stopHandle == null ? void 0 : stopHandle();
      } else {
        ariaHidden.value = false;
        stopHandle = onClickOutside(popperContentRef, () => {
          if (unref(controlled))
            return;
          const needClose = castArray(unref(trigger)).every((item) => {
            return item !== "hover" && item !== "focus";
          });
          if (needClose) {
            onClose();
          }
        }, { detectIframe: true });
      }
    }, {
      flush: "post"
    });
    watch(() => props.content, () => {
      var _a, _b;
      (_b = (_a = contentRef.value) == null ? void 0 : _a.updatePopper) == null ? void 0 : _b.call(_a);
    });
    expose({
      contentRef,
      isFocusInsideContent
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElTeleport), {
        disabled: !_ctx.teleported,
        to: unref(appendTo)
      }, {
        default: withCtx(() => [
          unref(shouldRender) || !ariaHidden.value ? (openBlock(), createBlock(Transition, {
            key: 0,
            name: unref(transitionClass),
            appear: !unref(persistentRef),
            onAfterLeave: onTransitionLeave,
            onBeforeEnter,
            onAfterEnter: onAfterShow,
            onBeforeLeave,
            persisted: ""
          }, {
            default: withCtx(() => [
              withDirectives(createVNode(unref(ElPopperContent), mergeProps({
                id: unref(id),
                ref_key: "contentRef",
                ref: contentRef
              }, _ctx.$attrs, {
                "aria-label": _ctx.ariaLabel,
                "aria-hidden": ariaHidden.value,
                "boundaries-padding": _ctx.boundariesPadding,
                "fallback-placements": _ctx.fallbackPlacements,
                "gpu-acceleration": _ctx.gpuAcceleration,
                offset: _ctx.offset,
                placement: _ctx.placement,
                "popper-options": _ctx.popperOptions,
                "arrow-offset": _ctx.arrowOffset,
                strategy: _ctx.strategy,
                effect: _ctx.effect,
                enterable: _ctx.enterable,
                pure: _ctx.pure,
                "popper-class": _ctx.popperClass,
                "popper-style": [_ctx.popperStyle, unref(contentStyle)],
                "reference-el": _ctx.referenceEl,
                "trigger-target-el": _ctx.triggerTargetEl,
                visible: unref(shouldShow),
                "z-index": _ctx.zIndex,
                loop: _ctx.loop,
                onMouseenter: unref(onContentEnter),
                onMouseleave: unref(onContentLeave),
                onBlur,
                onClose: unref(onClose)
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default")
                ]),
                _: 3
              }, 16, ["id", "aria-label", "aria-hidden", "boundaries-padding", "fallback-placements", "gpu-acceleration", "offset", "placement", "popper-options", "arrow-offset", "strategy", "effect", "enterable", "pure", "popper-class", "popper-style", "reference-el", "trigger-target-el", "visible", "z-index", "loop", "onMouseenter", "onMouseleave", "onClose"]), [
                [vShow, unref(shouldShow)]
              ])
            ]),
            _: 3
          }, 8, ["name", "appear"])) : createCommentVNode("v-if", true)
        ]),
        _: 3
      }, 8, ["disabled", "to"]);
    };
  }
});
var ElTooltipContent = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["__file", "content.vue"]]);
const __default__$e = defineComponent({
  name: "ElTooltip"
});
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  ...__default__$e,
  props: useTooltipProps,
  emits: tooltipEmits,
  setup(__props, { expose, emit }) {
    const props = __props;
    usePopperContainer();
    const ns = useNamespace("tooltip");
    const id = useId();
    const popperRef = ref();
    const contentRef = ref();
    const updatePopper = () => {
      var _a;
      const popperComponent = unref(popperRef);
      if (popperComponent) {
        (_a = popperComponent.popperInstanceRef) == null ? void 0 : _a.update();
      }
    };
    const open = ref(false);
    const toggleReason = ref();
    const { show, hide, hasUpdateHandler } = useTooltipModelToggle({
      indicator: open,
      toggleReason
    });
    const { onOpen, onClose } = useDelayedToggle({
      showAfter: toRef(props, "showAfter"),
      hideAfter: toRef(props, "hideAfter"),
      autoClose: toRef(props, "autoClose"),
      open: show,
      close: hide
    });
    const controlled = computed(() => isBoolean(props.visible) && !hasUpdateHandler.value);
    const kls = computed(() => {
      return [ns.b(), props.popperClass];
    });
    provide(TOOLTIP_INJECTION_KEY, {
      controlled,
      id,
      open: readonly(open),
      trigger: toRef(props, "trigger"),
      onOpen,
      onClose,
      onToggle: (event) => {
        if (unref(open)) {
          onClose(event);
        } else {
          onOpen(event);
        }
      },
      onShow: () => {
        emit("show", toggleReason.value);
      },
      onHide: () => {
        emit("hide", toggleReason.value);
      },
      onBeforeShow: () => {
        emit("before-show", toggleReason.value);
      },
      onBeforeHide: () => {
        emit("before-hide", toggleReason.value);
      },
      updatePopper
    });
    watch(() => props.disabled, (disabled) => {
      if (disabled && open.value) {
        open.value = false;
      }
    });
    const isFocusInsideContent = (event) => {
      var _a;
      return (_a = contentRef.value) == null ? void 0 : _a.isFocusInsideContent(event);
    };
    onDeactivated(() => open.value && hide());
    expose({
      popperRef,
      contentRef,
      isFocusInsideContent,
      updatePopper,
      onOpen,
      onClose,
      hide
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElPopper), {
        ref_key: "popperRef",
        ref: popperRef,
        role: _ctx.role
      }, {
        default: withCtx(() => [
          createVNode(ElTooltipTrigger, {
            disabled: _ctx.disabled,
            trigger: _ctx.trigger,
            "trigger-keys": _ctx.triggerKeys,
            "virtual-ref": _ctx.virtualRef,
            "virtual-triggering": _ctx.virtualTriggering,
            "focus-on-target": _ctx.focusOnTarget
          }, {
            default: withCtx(() => [
              _ctx.$slots.default ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("v-if", true)
            ]),
            _: 3
          }, 8, ["disabled", "trigger", "trigger-keys", "virtual-ref", "virtual-triggering", "focus-on-target"]),
          createVNode(ElTooltipContent, {
            ref_key: "contentRef",
            ref: contentRef,
            "aria-label": _ctx.ariaLabel,
            "boundaries-padding": _ctx.boundariesPadding,
            content: _ctx.content,
            disabled: _ctx.disabled,
            effect: _ctx.effect,
            enterable: _ctx.enterable,
            "fallback-placements": _ctx.fallbackPlacements,
            "hide-after": _ctx.hideAfter,
            "gpu-acceleration": _ctx.gpuAcceleration,
            offset: _ctx.offset,
            persistent: _ctx.persistent,
            "popper-class": unref(kls),
            "popper-style": _ctx.popperStyle,
            placement: _ctx.placement,
            "popper-options": _ctx.popperOptions,
            "arrow-offset": _ctx.arrowOffset,
            pure: _ctx.pure,
            "raw-content": _ctx.rawContent,
            "reference-el": _ctx.referenceEl,
            "trigger-target-el": _ctx.triggerTargetEl,
            "show-after": _ctx.showAfter,
            strategy: _ctx.strategy,
            teleported: _ctx.teleported,
            transition: _ctx.transition,
            "virtual-triggering": _ctx.virtualTriggering,
            "z-index": _ctx.zIndex,
            "append-to": _ctx.appendTo,
            loop: _ctx.loop
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "content", {}, () => [
                _ctx.rawContent ? (openBlock(), createElementBlock("span", {
                  key: 0,
                  innerHTML: _ctx.content
                }, null, 8, ["innerHTML"])) : (openBlock(), createElementBlock("span", { key: 1 }, toDisplayString(_ctx.content), 1))
              ]),
              _ctx.showArrow ? (openBlock(), createBlock(unref(ElPopperArrow), { key: 0 })) : createCommentVNode("v-if", true)
            ]),
            _: 3
          }, 8, ["aria-label", "boundaries-padding", "content", "disabled", "effect", "enterable", "fallback-placements", "hide-after", "gpu-acceleration", "offset", "persistent", "popper-class", "popper-style", "placement", "popper-options", "arrow-offset", "pure", "raw-content", "reference-el", "trigger-target-el", "show-after", "strategy", "teleported", "transition", "virtual-triggering", "z-index", "append-to", "loop"])
        ]),
        _: 3
      }, 8, ["role"]);
    };
  }
});
var Tooltip = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["__file", "tooltip.vue"]]);
const ElTooltip = withInstall(Tooltip);
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dayjs_min$1 = { exports: {} };
var dayjs_min = dayjs_min$1.exports;
var hasRequiredDayjs_min;
function requireDayjs_min() {
  if (hasRequiredDayjs_min) return dayjs_min$1.exports;
  hasRequiredDayjs_min = 1;
  (function(module2, exports$1) {
    !(function(t, e) {
      module2.exports = e();
    })(dayjs_min, (function() {
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = (function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = (function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          })(t2), this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m2.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[b.p(t2)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, (function(t3, r3) {
            return r3 || (function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            })(t3) || i2.replace(":", "");
          }));
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      })(), k = _.prototype;
      return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach((function(t2) {
        k[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      })), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    }));
  })(dayjs_min$1);
  return dayjs_min$1.exports;
}
var dayjs_minExports = requireDayjs_min();
const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
const buildTimeList = (value, bound) => {
  return [
    value > 0 ? value - 1 : void 0,
    value,
    value < bound ? value + 1 : void 0
  ];
};
const rangeArr = (n) => Array.from(Array.from({ length: n }).keys());
const extractDateFormat = (format) => {
  return format.replace(/\W?m{1,2}|\W?ZZ/g, "").replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, "").trim();
};
const extractTimeFormat = (format) => {
  return format.replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?Y{2,4}/g, "").trim();
};
const dateEquals = function(a, b) {
  const aIsDate = isDate(a);
  const bIsDate = isDate(b);
  if (aIsDate && bIsDate) {
    return a.getTime() === b.getTime();
  }
  if (!aIsDate && !bIsDate) {
    return a === b;
  }
  return false;
};
const valueEquals = function(a, b) {
  const aIsArray = isArray$1(a);
  const bIsArray = isArray$1(b);
  if (aIsArray && bIsArray) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => dateEquals(item, b[index]));
  }
  if (!aIsArray && !bIsArray) {
    return dateEquals(a, b);
  }
  return false;
};
const parseDate = function(date, format, lang) {
  const day = isEmpty(format) || format === "x" ? dayjs(date).locale(lang) : dayjs(date, format).locale(lang);
  return day.isValid() ? day : void 0;
};
const formatter = function(date, format, lang) {
  if (isEmpty(format))
    return date;
  if (format === "x")
    return +date;
  return dayjs(date).locale(lang).format(format);
};
const makeList = (total, method) => {
  var _a;
  const arr = [];
  const disabledArr = method == null ? void 0 : method();
  for (let i = 0; i < total; i++) {
    arr.push((_a = disabledArr == null ? void 0 : disabledArr.includes(i)) != null ? _a : false);
  }
  return arr;
};
const dayOrDaysToDate = (dayOrDays) => {
  return isArray$1(dayOrDays) ? dayOrDays.map((d) => d.toDate()) : dayOrDays.toDate();
};
var localeData$2 = { exports: {} };
var localeData$1 = localeData$2.exports;
var hasRequiredLocaleData;
function requireLocaleData() {
  if (hasRequiredLocaleData) return localeData$2.exports;
  hasRequiredLocaleData = 1;
  (function(module2, exports$1) {
    !(function(n, e) {
      module2.exports = e();
    })(localeData$1, (function() {
      return function(n, e, t) {
        var r = e.prototype, o = function(n2) {
          return n2 && (n2.indexOf ? n2 : n2.s);
        }, u = function(n2, e2, t2, r2, u2) {
          var i2 = n2.name ? n2 : n2.$locale(), a2 = o(i2[e2]), s2 = o(i2[t2]), f = a2 || s2.map((function(n3) {
            return n3.slice(0, r2);
          }));
          if (!u2) return f;
          var d = i2.weekStart;
          return f.map((function(n3, e3) {
            return f[(e3 + (d || 0)) % 7];
          }));
        }, i = function() {
          return t.Ls[t.locale()];
        }, a = function(n2, e2) {
          return n2.formats[e2] || (function(n3) {
            return n3.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(n4, e3, t2) {
              return e3 || t2.slice(1);
            }));
          })(n2.formats[e2.toUpperCase()]);
        }, s = function() {
          var n2 = this;
          return { months: function(e2) {
            return e2 ? e2.format("MMMM") : u(n2, "months");
          }, monthsShort: function(e2) {
            return e2 ? e2.format("MMM") : u(n2, "monthsShort", "months", 3);
          }, firstDayOfWeek: function() {
            return n2.$locale().weekStart || 0;
          }, weekdays: function(e2) {
            return e2 ? e2.format("dddd") : u(n2, "weekdays");
          }, weekdaysMin: function(e2) {
            return e2 ? e2.format("dd") : u(n2, "weekdaysMin", "weekdays", 2);
          }, weekdaysShort: function(e2) {
            return e2 ? e2.format("ddd") : u(n2, "weekdaysShort", "weekdays", 3);
          }, longDateFormat: function(e2) {
            return a(n2.$locale(), e2);
          }, meridiem: this.$locale().meridiem, ordinal: this.$locale().ordinal };
        };
        r.localeData = function() {
          return s.bind(this)();
        }, t.localeData = function() {
          var n2 = i();
          return { firstDayOfWeek: function() {
            return n2.weekStart || 0;
          }, weekdays: function() {
            return t.weekdays();
          }, weekdaysShort: function() {
            return t.weekdaysShort();
          }, weekdaysMin: function() {
            return t.weekdaysMin();
          }, months: function() {
            return t.months();
          }, monthsShort: function() {
            return t.monthsShort();
          }, longDateFormat: function(e2) {
            return a(n2, e2);
          }, meridiem: n2.meridiem, ordinal: n2.ordinal };
        }, t.months = function() {
          return u(i(), "months");
        }, t.monthsShort = function() {
          return u(i(), "monthsShort", "months", 3);
        }, t.weekdays = function(n2) {
          return u(i(), "weekdays", null, null, n2);
        }, t.weekdaysShort = function(n2) {
          return u(i(), "weekdaysShort", "weekdays", 3, n2);
        }, t.weekdaysMin = function(n2) {
          return u(i(), "weekdaysMin", "weekdays", 2, n2);
        };
      };
    }));
  })(localeData$2);
  return localeData$2.exports;
}
var localeDataExports = requireLocaleData();
const localeData = /* @__PURE__ */ getDefaultExportFromCjs(localeDataExports);
const datePickTypes = [
  "year",
  "years",
  "month",
  "months",
  "date",
  "dates",
  "week",
  "datetime",
  "datetimerange",
  "daterange",
  "monthrange",
  "yearrange"
];
const checkboxProps = {
  modelValue: {
    type: [Number, String, Boolean],
    default: void 0
  },
  label: {
    type: [String, Boolean, Number, Object],
    default: void 0
  },
  value: {
    type: [String, Boolean, Number, Object],
    default: void 0
  },
  indeterminate: Boolean,
  disabled: Boolean,
  checked: Boolean,
  name: {
    type: String,
    default: void 0
  },
  trueValue: {
    type: [String, Number],
    default: void 0
  },
  falseValue: {
    type: [String, Number],
    default: void 0
  },
  trueLabel: {
    type: [String, Number],
    default: void 0
  },
  falseLabel: {
    type: [String, Number],
    default: void 0
  },
  id: {
    type: String,
    default: void 0
  },
  border: Boolean,
  size: useSizeProp,
  tabindex: [String, Number],
  validateEvent: {
    type: Boolean,
    default: true
  },
  ...useAriaProps(["ariaControls"])
};
const checkboxEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isString(val) || isNumber(val) || isBoolean(val),
  change: (val) => isString(val) || isNumber(val) || isBoolean(val)
};
const checkboxGroupContextKey = Symbol("checkboxGroupContextKey");
const useCheckboxDisabled = ({
  model,
  isChecked
}) => {
  const checkboxGroup = inject(checkboxGroupContextKey, void 0);
  const isLimitDisabled = computed(() => {
    var _a, _b;
    const max = (_a = checkboxGroup == null ? void 0 : checkboxGroup.max) == null ? void 0 : _a.value;
    const min = (_b = checkboxGroup == null ? void 0 : checkboxGroup.min) == null ? void 0 : _b.value;
    return !isUndefined$1(max) && model.value.length >= max && !isChecked.value || !isUndefined$1(min) && model.value.length <= min && isChecked.value;
  });
  const isDisabled = useFormDisabled(computed(() => (checkboxGroup == null ? void 0 : checkboxGroup.disabled.value) || isLimitDisabled.value));
  return {
    isDisabled,
    isLimitDisabled
  };
};
const useCheckboxEvent = (props, {
  model,
  isLimitExceeded,
  hasOwnLabel,
  isDisabled,
  isLabeledByFormItem
}) => {
  const checkboxGroup = inject(checkboxGroupContextKey, void 0);
  const { formItem } = useFormItem();
  const { emit } = getCurrentInstance();
  function getLabeledValue(value) {
    var _a, _b, _c, _d;
    return [true, props.trueValue, props.trueLabel].includes(value) ? (_b = (_a = props.trueValue) != null ? _a : props.trueLabel) != null ? _b : true : (_d = (_c = props.falseValue) != null ? _c : props.falseLabel) != null ? _d : false;
  }
  function emitChangeEvent(checked, e) {
    emit(CHANGE_EVENT, getLabeledValue(checked), e);
  }
  function handleChange(e) {
    if (isLimitExceeded.value)
      return;
    const target = e.target;
    emit(CHANGE_EVENT, getLabeledValue(target.checked), e);
  }
  async function onClickRoot(e) {
    if (isLimitExceeded.value)
      return;
    if (!hasOwnLabel.value && !isDisabled.value && isLabeledByFormItem.value) {
      const eventTargets = e.composedPath();
      const hasLabel = eventTargets.some((item) => item.tagName === "LABEL");
      if (!hasLabel) {
        model.value = getLabeledValue([false, props.falseValue, props.falseLabel].includes(model.value));
        await nextTick();
        emitChangeEvent(model.value, e);
      }
    }
  }
  const validateEvent = computed(() => (checkboxGroup == null ? void 0 : checkboxGroup.validateEvent) || props.validateEvent);
  watch(() => props.modelValue, () => {
    if (validateEvent.value) {
      formItem == null ? void 0 : formItem.validate("change").catch((err) => debugWarn());
    }
  });
  return {
    handleChange,
    onClickRoot
  };
};
const useCheckboxModel = (props) => {
  const selfModel = ref(false);
  const { emit } = getCurrentInstance();
  const checkboxGroup = inject(checkboxGroupContextKey, void 0);
  const isGroup = computed(() => isUndefined$1(checkboxGroup) === false);
  const isLimitExceeded = ref(false);
  const model = computed({
    get() {
      var _a, _b;
      return isGroup.value ? (_a = checkboxGroup == null ? void 0 : checkboxGroup.modelValue) == null ? void 0 : _a.value : (_b = props.modelValue) != null ? _b : selfModel.value;
    },
    set(val) {
      var _a, _b;
      if (isGroup.value && isArray$1(val)) {
        isLimitExceeded.value = ((_a = checkboxGroup == null ? void 0 : checkboxGroup.max) == null ? void 0 : _a.value) !== void 0 && val.length > (checkboxGroup == null ? void 0 : checkboxGroup.max.value) && val.length > model.value.length;
        isLimitExceeded.value === false && ((_b = checkboxGroup == null ? void 0 : checkboxGroup.changeEvent) == null ? void 0 : _b.call(checkboxGroup, val));
      } else {
        emit(UPDATE_MODEL_EVENT, val);
        selfModel.value = val;
      }
    }
  });
  return {
    model,
    isGroup,
    isLimitExceeded
  };
};
const useCheckboxStatus = (props, slots, { model }) => {
  const checkboxGroup = inject(checkboxGroupContextKey, void 0);
  const isFocused = ref(false);
  const actualValue = computed(() => {
    if (!isPropAbsent(props.value)) {
      return props.value;
    }
    return props.label;
  });
  const isChecked = computed(() => {
    const value = model.value;
    if (isBoolean(value)) {
      return value;
    } else if (isArray$1(value)) {
      if (isObject$1(actualValue.value)) {
        return value.map(toRaw).some((o) => isEqual(o, actualValue.value));
      } else {
        return value.map(toRaw).includes(actualValue.value);
      }
    } else if (value !== null && value !== void 0) {
      return value === props.trueValue || value === props.trueLabel;
    } else {
      return !!value;
    }
  });
  const checkboxButtonSize = useFormSize(computed(() => {
    var _a;
    return (_a = checkboxGroup == null ? void 0 : checkboxGroup.size) == null ? void 0 : _a.value;
  }), {
    prop: true
  });
  const checkboxSize = useFormSize(computed(() => {
    var _a;
    return (_a = checkboxGroup == null ? void 0 : checkboxGroup.size) == null ? void 0 : _a.value;
  }));
  const hasOwnLabel = computed(() => {
    return !!slots.default || !isPropAbsent(actualValue.value);
  });
  return {
    checkboxButtonSize,
    isChecked,
    isFocused,
    checkboxSize,
    hasOwnLabel,
    actualValue
  };
};
const useCheckbox = (props, slots) => {
  const { formItem: elFormItem } = useFormItem();
  const { model, isGroup, isLimitExceeded } = useCheckboxModel(props);
  const {
    isFocused,
    isChecked,
    checkboxButtonSize,
    checkboxSize,
    hasOwnLabel,
    actualValue
  } = useCheckboxStatus(props, slots, { model });
  const { isDisabled } = useCheckboxDisabled({ model, isChecked });
  const { inputId, isLabeledByFormItem } = useFormItemInputId(props, {
    formItemContext: elFormItem,
    disableIdGeneration: hasOwnLabel,
    disableIdManagement: isGroup
  });
  const { handleChange, onClickRoot } = useCheckboxEvent(props, {
    model,
    isLimitExceeded,
    hasOwnLabel,
    isDisabled,
    isLabeledByFormItem
  });
  const setStoreValue = () => {
    function addToStore() {
      var _a, _b;
      if (isArray$1(model.value) && !model.value.includes(actualValue.value)) {
        model.value.push(actualValue.value);
      } else {
        model.value = (_b = (_a = props.trueValue) != null ? _a : props.trueLabel) != null ? _b : true;
      }
    }
    props.checked && addToStore();
  };
  setStoreValue();
  useDeprecated({
    from: "label act as value",
    replacement: "value",
    version: "3.0.0",
    scope: "el-checkbox",
    ref: "https://element-plus.org/en-US/component/checkbox.html"
  }, computed(() => isGroup.value && isPropAbsent(props.value)));
  useDeprecated({
    from: "true-label",
    replacement: "true-value",
    version: "3.0.0",
    scope: "el-checkbox",
    ref: "https://element-plus.org/en-US/component/checkbox.html"
  }, computed(() => !!props.trueLabel));
  useDeprecated({
    from: "false-label",
    replacement: "false-value",
    version: "3.0.0",
    scope: "el-checkbox",
    ref: "https://element-plus.org/en-US/component/checkbox.html"
  }, computed(() => !!props.falseLabel));
  return {
    inputId,
    isLabeledByFormItem,
    isChecked,
    isDisabled,
    isFocused,
    checkboxButtonSize,
    checkboxSize,
    hasOwnLabel,
    model,
    actualValue,
    handleChange,
    onClickRoot
  };
};
const __default__$d = defineComponent({
  name: "ElCheckbox"
});
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  ...__default__$d,
  props: checkboxProps,
  emits: checkboxEmits,
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const {
      inputId,
      isLabeledByFormItem,
      isChecked,
      isDisabled,
      isFocused,
      checkboxSize,
      hasOwnLabel,
      model,
      actualValue,
      handleChange,
      onClickRoot
    } = useCheckbox(props, slots);
    const inputBindings = computed(() => {
      var _a, _b, _c, _d;
      if (props.trueValue || props.falseValue || props.trueLabel || props.falseLabel) {
        return {
          "true-value": (_b = (_a = props.trueValue) != null ? _a : props.trueLabel) != null ? _b : true,
          "false-value": (_d = (_c = props.falseValue) != null ? _c : props.falseLabel) != null ? _d : false
        };
      }
      return {
        value: actualValue.value
      };
    });
    const ns = useNamespace("checkbox");
    const compKls = computed(() => {
      return [
        ns.b(),
        ns.m(checkboxSize.value),
        ns.is("disabled", isDisabled.value),
        ns.is("bordered", props.border),
        ns.is("checked", isChecked.value)
      ];
    });
    const spanKls = computed(() => {
      return [
        ns.e("input"),
        ns.is("disabled", isDisabled.value),
        ns.is("checked", isChecked.value),
        ns.is("indeterminate", props.indeterminate),
        ns.is("focus", isFocused.value)
      ];
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(!unref(hasOwnLabel) && unref(isLabeledByFormItem) ? "span" : "label"), {
        class: normalizeClass(unref(compKls)),
        "aria-controls": _ctx.indeterminate ? _ctx.ariaControls : null,
        onClick: unref(onClickRoot)
      }, {
        default: withCtx(() => [
          createBaseVNode("span", {
            class: normalizeClass(unref(spanKls))
          }, [
            withDirectives(createBaseVNode("input", mergeProps({
              id: unref(inputId),
              "onUpdate:modelValue": ($event) => isRef(model) ? model.value = $event : null,
              class: unref(ns).e("original"),
              type: "checkbox",
              indeterminate: _ctx.indeterminate,
              name: _ctx.name,
              tabindex: _ctx.tabindex,
              disabled: unref(isDisabled)
            }, unref(inputBindings), {
              onChange: unref(handleChange),
              onFocus: ($event) => isFocused.value = true,
              onBlur: ($event) => isFocused.value = false,
              onClick: withModifiers(() => {
              }, ["stop"])
            }), null, 16, ["id", "onUpdate:modelValue", "indeterminate", "name", "tabindex", "disabled", "onChange", "onFocus", "onBlur", "onClick"]), [
              [vModelCheckbox, unref(model)]
            ]),
            createBaseVNode("span", {
              class: normalizeClass(unref(ns).e("inner"))
            }, null, 2)
          ], 2),
          unref(hasOwnLabel) ? (openBlock(), createElementBlock("span", {
            key: 0,
            class: normalizeClass(unref(ns).e("label"))
          }, [
            renderSlot(_ctx.$slots, "default"),
            !_ctx.$slots.default ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createTextVNode(toDisplayString(_ctx.label), 1)
            ], 64)) : createCommentVNode("v-if", true)
          ], 2)) : createCommentVNode("v-if", true)
        ]),
        _: 3
      }, 8, ["class", "aria-controls", "onClick"]);
    };
  }
});
var Checkbox = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__file", "checkbox.vue"]]);
const __default__$c = defineComponent({
  name: "ElCheckboxButton"
});
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  ...__default__$c,
  props: checkboxProps,
  emits: checkboxEmits,
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const {
      isFocused,
      isChecked,
      isDisabled,
      checkboxButtonSize,
      model,
      actualValue,
      handleChange
    } = useCheckbox(props, slots);
    const inputBindings = computed(() => {
      var _a, _b, _c, _d;
      if (props.trueValue || props.falseValue || props.trueLabel || props.falseLabel) {
        return {
          "true-value": (_b = (_a = props.trueValue) != null ? _a : props.trueLabel) != null ? _b : true,
          "false-value": (_d = (_c = props.falseValue) != null ? _c : props.falseLabel) != null ? _d : false
        };
      }
      return {
        value: actualValue.value
      };
    });
    const checkboxGroup = inject(checkboxGroupContextKey, void 0);
    const ns = useNamespace("checkbox");
    const activeStyle = computed(() => {
      var _a, _b, _c, _d;
      const fillValue = (_b = (_a = checkboxGroup == null ? void 0 : checkboxGroup.fill) == null ? void 0 : _a.value) != null ? _b : "";
      return {
        backgroundColor: fillValue,
        borderColor: fillValue,
        color: (_d = (_c = checkboxGroup == null ? void 0 : checkboxGroup.textColor) == null ? void 0 : _c.value) != null ? _d : "",
        boxShadow: fillValue ? `-1px 0 0 0 ${fillValue}` : void 0
      };
    });
    const labelKls = computed(() => {
      return [
        ns.b("button"),
        ns.bm("button", checkboxButtonSize.value),
        ns.is("disabled", isDisabled.value),
        ns.is("checked", isChecked.value),
        ns.is("focus", isFocused.value)
      ];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("label", {
        class: normalizeClass(unref(labelKls))
      }, [
        withDirectives(createBaseVNode("input", mergeProps({
          "onUpdate:modelValue": ($event) => isRef(model) ? model.value = $event : null,
          class: unref(ns).be("button", "original"),
          type: "checkbox",
          name: _ctx.name,
          tabindex: _ctx.tabindex,
          disabled: unref(isDisabled)
        }, unref(inputBindings), {
          onChange: unref(handleChange),
          onFocus: ($event) => isFocused.value = true,
          onBlur: ($event) => isFocused.value = false,
          onClick: withModifiers(() => {
          }, ["stop"])
        }), null, 16, ["onUpdate:modelValue", "name", "tabindex", "disabled", "onChange", "onFocus", "onBlur", "onClick"]), [
          [vModelCheckbox, unref(model)]
        ]),
        _ctx.$slots.default || _ctx.label ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: normalizeClass(unref(ns).be("button", "inner")),
          style: normalizeStyle(unref(isChecked) ? unref(activeStyle) : void 0)
        }, [
          renderSlot(_ctx.$slots, "default", {}, () => [
            createTextVNode(toDisplayString(_ctx.label), 1)
          ])
        ], 6)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var CheckboxButton = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__file", "checkbox-button.vue"]]);
const checkboxGroupProps = buildProps({
  modelValue: {
    type: definePropType(Array),
    default: () => []
  },
  disabled: Boolean,
  min: Number,
  max: Number,
  size: useSizeProp,
  fill: String,
  textColor: String,
  tag: {
    type: String,
    default: "div"
  },
  validateEvent: {
    type: Boolean,
    default: true
  },
  options: {
    type: definePropType(Array)
  },
  props: {
    type: definePropType(Object),
    default: () => checkboxDefaultProps
  },
  type: {
    type: String,
    values: ["checkbox", "button"],
    default: "checkbox"
  },
  ...useAriaProps(["ariaLabel"])
});
const checkboxGroupEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isArray$1(val),
  change: (val) => isArray$1(val)
};
const checkboxDefaultProps = {
  label: "label",
  value: "value",
  disabled: "disabled"
};
const __default__$b = defineComponent({
  name: "ElCheckboxGroup"
});
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  ...__default__$b,
  props: checkboxGroupProps,
  emits: checkboxGroupEmits,
  setup(__props, { emit }) {
    const props = __props;
    const ns = useNamespace("checkbox");
    const { formItem } = useFormItem();
    const { inputId: groupId, isLabeledByFormItem } = useFormItemInputId(props, {
      formItemContext: formItem
    });
    const changeEvent = async (value) => {
      emit(UPDATE_MODEL_EVENT, value);
      await nextTick();
      emit(CHANGE_EVENT, value);
    };
    const modelValue = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        changeEvent(val);
      }
    });
    const aliasProps = computed(() => ({
      ...checkboxDefaultProps,
      ...props.props
    }));
    const getOptionProps = (option) => {
      const { label, value, disabled } = aliasProps.value;
      const base = {
        label: option[label],
        value: option[value],
        disabled: option[disabled]
      };
      return { ...omit(option, [label, value, disabled]), ...base };
    };
    const optionComponent = computed(() => props.type === "button" ? CheckboxButton : Checkbox);
    provide(checkboxGroupContextKey, {
      ...pick(toRefs(props), [
        "size",
        "min",
        "max",
        "disabled",
        "validateEvent",
        "fill",
        "textColor"
      ]),
      modelValue,
      changeEvent
    });
    watch(() => props.modelValue, (newVal, oldValue) => {
      if (props.validateEvent && !isEqual(newVal, oldValue)) {
        formItem == null ? void 0 : formItem.validate("change").catch((err) => debugWarn());
      }
    });
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createBlock(resolveDynamicComponent(_ctx.tag), {
        id: unref(groupId),
        class: normalizeClass(unref(ns).b("group")),
        role: "group",
        "aria-label": !unref(isLabeledByFormItem) ? _ctx.ariaLabel || "checkbox-group" : void 0,
        "aria-labelledby": unref(isLabeledByFormItem) ? (_a = unref(formItem)) == null ? void 0 : _a.labelId : void 0
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default", {}, () => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.options, (item, index) => {
              return openBlock(), createBlock(resolveDynamicComponent(unref(optionComponent)), mergeProps({ key: index }, getOptionProps(item)), null, 16);
            }), 128))
          ])
        ]),
        _: 3
      }, 8, ["id", "class", "aria-label", "aria-labelledby"]);
    };
  }
});
var CheckboxGroup = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__file", "checkbox-group.vue"]]);
const ElCheckbox = withInstall(Checkbox, {
  CheckboxButton,
  CheckboxGroup
});
withNoopInstall(CheckboxButton);
const ElCheckboxGroup = withNoopInstall(CheckboxGroup);
const radioPropsBase = buildProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: void 0
  },
  size: useSizeProp,
  disabled: Boolean,
  label: {
    type: [String, Number, Boolean],
    default: void 0
  },
  value: {
    type: [String, Number, Boolean],
    default: void 0
  },
  name: {
    type: String,
    default: void 0
  }
});
const radioProps = buildProps({
  ...radioPropsBase,
  border: Boolean
});
const radioEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isString(val) || isNumber(val) || isBoolean(val),
  [CHANGE_EVENT]: (val) => isString(val) || isNumber(val) || isBoolean(val)
};
const radioGroupKey = Symbol("radioGroupKey");
const useRadio = (props, emit) => {
  const radioRef = ref();
  const radioGroup = inject(radioGroupKey, void 0);
  const isGroup = computed(() => !!radioGroup);
  const actualValue = computed(() => {
    if (!isPropAbsent(props.value)) {
      return props.value;
    }
    return props.label;
  });
  const modelValue = computed({
    get() {
      return isGroup.value ? radioGroup.modelValue : props.modelValue;
    },
    set(val) {
      if (isGroup.value) {
        radioGroup.changeEvent(val);
      } else {
        emit && emit(UPDATE_MODEL_EVENT, val);
      }
      radioRef.value.checked = props.modelValue === actualValue.value;
    }
  });
  const size = useFormSize(computed(() => radioGroup == null ? void 0 : radioGroup.size));
  const disabled = useFormDisabled(computed(() => radioGroup == null ? void 0 : radioGroup.disabled));
  const focus = ref(false);
  const tabIndex = computed(() => {
    return disabled.value || isGroup.value && modelValue.value !== actualValue.value ? -1 : 0;
  });
  useDeprecated({
    from: "label act as value",
    replacement: "value",
    version: "3.0.0",
    scope: "el-radio",
    ref: "https://element-plus.org/en-US/component/radio.html"
  }, computed(() => isGroup.value && isPropAbsent(props.value)));
  return {
    radioRef,
    isGroup,
    radioGroup,
    focus,
    size,
    disabled,
    tabIndex,
    modelValue,
    actualValue
  };
};
const __default__$a = defineComponent({
  name: "ElRadio"
});
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  ...__default__$a,
  props: radioProps,
  emits: radioEmits,
  setup(__props, { emit }) {
    const props = __props;
    const ns = useNamespace("radio");
    const { radioRef, radioGroup, focus, size, disabled, modelValue, actualValue } = useRadio(props, emit);
    function handleChange() {
      nextTick(() => emit(CHANGE_EVENT, modelValue.value));
    }
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("label", {
        class: normalizeClass([
          unref(ns).b(),
          unref(ns).is("disabled", unref(disabled)),
          unref(ns).is("focus", unref(focus)),
          unref(ns).is("bordered", _ctx.border),
          unref(ns).is("checked", unref(modelValue) === unref(actualValue)),
          unref(ns).m(unref(size))
        ])
      }, [
        createBaseVNode("span", {
          class: normalizeClass([
            unref(ns).e("input"),
            unref(ns).is("disabled", unref(disabled)),
            unref(ns).is("checked", unref(modelValue) === unref(actualValue))
          ])
        }, [
          withDirectives(createBaseVNode("input", {
            ref_key: "radioRef",
            ref: radioRef,
            "onUpdate:modelValue": ($event) => isRef(modelValue) ? modelValue.value = $event : null,
            class: normalizeClass(unref(ns).e("original")),
            value: unref(actualValue),
            name: _ctx.name || ((_a = unref(radioGroup)) == null ? void 0 : _a.name),
            disabled: unref(disabled),
            checked: unref(modelValue) === unref(actualValue),
            type: "radio",
            onFocus: ($event) => focus.value = true,
            onBlur: ($event) => focus.value = false,
            onChange: handleChange,
            onClick: withModifiers(() => {
            }, ["stop"])
          }, null, 42, ["onUpdate:modelValue", "value", "name", "disabled", "checked", "onFocus", "onBlur", "onClick"]), [
            [vModelRadio, unref(modelValue)]
          ]),
          createBaseVNode("span", {
            class: normalizeClass(unref(ns).e("inner"))
          }, null, 2)
        ], 2),
        createBaseVNode("span", {
          class: normalizeClass(unref(ns).e("label")),
          onKeydown: withModifiers(() => {
          }, ["stop"])
        }, [
          renderSlot(_ctx.$slots, "default", {}, () => [
            createTextVNode(toDisplayString(_ctx.label), 1)
          ])
        ], 42, ["onKeydown"])
      ], 2);
    };
  }
});
var Radio = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__file", "radio.vue"]]);
const radioButtonProps = buildProps({
  ...radioPropsBase
});
const __default__$9 = defineComponent({
  name: "ElRadioButton"
});
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  ...__default__$9,
  props: radioButtonProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("radio");
    const { radioRef, focus, size, disabled, modelValue, radioGroup, actualValue } = useRadio(props);
    const activeStyle = computed(() => {
      return {
        backgroundColor: (radioGroup == null ? void 0 : radioGroup.fill) || "",
        borderColor: (radioGroup == null ? void 0 : radioGroup.fill) || "",
        boxShadow: (radioGroup == null ? void 0 : radioGroup.fill) ? `-1px 0 0 0 ${radioGroup.fill}` : "",
        color: (radioGroup == null ? void 0 : radioGroup.textColor) || ""
      };
    });
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("label", {
        class: normalizeClass([
          unref(ns).b("button"),
          unref(ns).is("active", unref(modelValue) === unref(actualValue)),
          unref(ns).is("disabled", unref(disabled)),
          unref(ns).is("focus", unref(focus)),
          unref(ns).bm("button", unref(size))
        ])
      }, [
        withDirectives(createBaseVNode("input", {
          ref_key: "radioRef",
          ref: radioRef,
          "onUpdate:modelValue": ($event) => isRef(modelValue) ? modelValue.value = $event : null,
          class: normalizeClass(unref(ns).be("button", "original-radio")),
          value: unref(actualValue),
          type: "radio",
          name: _ctx.name || ((_a = unref(radioGroup)) == null ? void 0 : _a.name),
          disabled: unref(disabled),
          onFocus: ($event) => focus.value = true,
          onBlur: ($event) => focus.value = false,
          onClick: withModifiers(() => {
          }, ["stop"])
        }, null, 42, ["onUpdate:modelValue", "value", "name", "disabled", "onFocus", "onBlur", "onClick"]), [
          [vModelRadio, unref(modelValue)]
        ]),
        createBaseVNode("span", {
          class: normalizeClass(unref(ns).be("button", "inner")),
          style: normalizeStyle(unref(modelValue) === unref(actualValue) ? unref(activeStyle) : {}),
          onKeydown: withModifiers(() => {
          }, ["stop"])
        }, [
          renderSlot(_ctx.$slots, "default", {}, () => [
            createTextVNode(toDisplayString(_ctx.label), 1)
          ])
        ], 46, ["onKeydown"])
      ], 2);
    };
  }
});
var RadioButton = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__file", "radio-button.vue"]]);
const radioGroupProps = buildProps({
  id: {
    type: String,
    default: void 0
  },
  size: useSizeProp,
  disabled: Boolean,
  modelValue: {
    type: [String, Number, Boolean],
    default: void 0
  },
  fill: {
    type: String,
    default: ""
  },
  textColor: {
    type: String,
    default: ""
  },
  name: {
    type: String,
    default: void 0
  },
  validateEvent: {
    type: Boolean,
    default: true
  },
  options: {
    type: definePropType(Array)
  },
  props: {
    type: definePropType(Object),
    default: () => radioDefaultProps
  },
  type: {
    type: String,
    values: ["radio", "button"],
    default: "radio"
  },
  ...useAriaProps(["ariaLabel"])
});
const radioGroupEmits = radioEmits;
const radioDefaultProps = {
  label: "label",
  value: "value",
  disabled: "disabled"
};
const __default__$8 = defineComponent({
  name: "ElRadioGroup"
});
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  ...__default__$8,
  props: radioGroupProps,
  emits: radioGroupEmits,
  setup(__props, { emit }) {
    const props = __props;
    const ns = useNamespace("radio");
    const radioId = useId();
    const radioGroupRef = ref();
    const { formItem } = useFormItem();
    const { inputId: groupId, isLabeledByFormItem } = useFormItemInputId(props, {
      formItemContext: formItem
    });
    const changeEvent = (value) => {
      emit(UPDATE_MODEL_EVENT, value);
      nextTick(() => emit(CHANGE_EVENT, value));
    };
    onMounted(() => {
      const radios = radioGroupRef.value.querySelectorAll("[type=radio]");
      const firstLabel = radios[0];
      if (!Array.from(radios).some((radio) => radio.checked) && firstLabel) {
        firstLabel.tabIndex = 0;
      }
    });
    const name = computed(() => {
      return props.name || radioId.value;
    });
    const aliasProps = computed(() => ({
      ...radioDefaultProps,
      ...props.props
    }));
    const getOptionProps = (option) => {
      const { label, value, disabled } = aliasProps.value;
      const base = {
        label: option[label],
        value: option[value],
        disabled: option[disabled]
      };
      return { ...omit(option, [label, value, disabled]), ...base };
    };
    const optionComponent = computed(() => props.type === "button" ? RadioButton : Radio);
    provide(radioGroupKey, reactive({
      ...toRefs(props),
      changeEvent,
      name
    }));
    watch(() => props.modelValue, (newVal, oldValue) => {
      if (props.validateEvent && !isEqual(newVal, oldValue)) {
        formItem == null ? void 0 : formItem.validate("change").catch((err) => debugWarn());
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        id: unref(groupId),
        ref_key: "radioGroupRef",
        ref: radioGroupRef,
        class: normalizeClass(unref(ns).b("group")),
        role: "radiogroup",
        "aria-label": !unref(isLabeledByFormItem) ? _ctx.ariaLabel || "radio-group" : void 0,
        "aria-labelledby": unref(isLabeledByFormItem) ? unref(formItem).labelId : void 0
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.options, (item, index) => {
            return openBlock(), createBlock(resolveDynamicComponent(unref(optionComponent)), mergeProps({ key: index }, getOptionProps(item)), null, 16);
          }), 128))
        ])
      ], 10, ["id", "aria-label", "aria-labelledby"]);
    };
  }
});
var RadioGroup = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__file", "radio-group.vue"]]);
const ElRadio = withInstall(Radio, {
  RadioButton,
  RadioGroup
});
const ElRadioGroup = withNoopInstall(RadioGroup);
withNoopInstall(RadioButton);
const nodeList = /* @__PURE__ */ new Map();
if (isClient) {
  let startClick;
  document.addEventListener("mousedown", (e) => startClick = e);
  document.addEventListener("mouseup", (e) => {
    if (startClick) {
      for (const handlers of nodeList.values()) {
        for (const { documentHandler } of handlers) {
          documentHandler(e, startClick);
        }
      }
      startClick = void 0;
    }
  });
}
function createDocumentHandler(el, binding) {
  let excludes = [];
  if (isArray$1(binding.arg)) {
    excludes = binding.arg;
  } else if (isElement(binding.arg)) {
    excludes.push(binding.arg);
  }
  return function(mouseup, mousedown) {
    const popperRef = binding.instance.popperRef;
    const mouseUpTarget = mouseup.target;
    const mouseDownTarget = mousedown == null ? void 0 : mousedown.target;
    const isBound = !binding || !binding.instance;
    const isTargetExists = !mouseUpTarget || !mouseDownTarget;
    const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget);
    const isSelf = el === mouseUpTarget;
    const isTargetExcluded = excludes.length && excludes.some((item) => item == null ? void 0 : item.contains(mouseUpTarget)) || excludes.length && excludes.includes(mouseDownTarget);
    const isContainedByPopper = popperRef && (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget));
    if (isBound || isTargetExists || isContainedByEl || isSelf || isTargetExcluded || isContainedByPopper) {
      return;
    }
    binding.value(mouseup, mousedown);
  };
}
const ClickOutside = {
  beforeMount(el, binding) {
    if (!nodeList.has(el)) {
      nodeList.set(el, []);
    }
    nodeList.get(el).push({
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value
    });
  },
  updated(el, binding) {
    if (!nodeList.has(el)) {
      nodeList.set(el, []);
    }
    const handlers = nodeList.get(el);
    const oldHandlerIndex = handlers.findIndex((item) => item.bindingFn === binding.oldValue);
    const newHandler = {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value
    };
    if (oldHandlerIndex >= 0) {
      handlers.splice(oldHandlerIndex, 1, newHandler);
    } else {
      handlers.push(newHandler);
    }
  },
  unmounted(el) {
    nodeList.delete(el);
  }
};
var customParseFormat$2 = { exports: {} };
var customParseFormat$1 = customParseFormat$2.exports;
var hasRequiredCustomParseFormat;
function requireCustomParseFormat() {
  if (hasRequiredCustomParseFormat) return customParseFormat$2.exports;
  hasRequiredCustomParseFormat = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(customParseFormat$1, (function() {
      var e = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, t = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, n = /\d/, r = /\d\d/, i = /\d\d?/, o = /\d*[^-_:/,()\s\d]+/, s = {}, a = function(e2) {
        return (e2 = +e2) + (e2 > 68 ? 1900 : 2e3);
      };
      var f = function(e2) {
        return function(t2) {
          this[e2] = +t2;
        };
      }, h = [/[+-]\d\d:?(\d\d)?|Z/, function(e2) {
        (this.zone || (this.zone = {})).offset = (function(e3) {
          if (!e3) return 0;
          if ("Z" === e3) return 0;
          var t2 = e3.match(/([+-]|\d\d)/g), n2 = 60 * t2[1] + (+t2[2] || 0);
          return 0 === n2 ? 0 : "+" === t2[0] ? -n2 : n2;
        })(e2);
      }], u = function(e2) {
        var t2 = s[e2];
        return t2 && (t2.indexOf ? t2 : t2.s.concat(t2.f));
      }, d = function(e2, t2) {
        var n2, r2 = s.meridiem;
        if (r2) {
          for (var i2 = 1; i2 <= 24; i2 += 1) if (e2.indexOf(r2(i2, 0, t2)) > -1) {
            n2 = i2 > 12;
            break;
          }
        } else n2 = e2 === (t2 ? "pm" : "PM");
        return n2;
      }, c = { A: [o, function(e2) {
        this.afternoon = d(e2, false);
      }], a: [o, function(e2) {
        this.afternoon = d(e2, true);
      }], Q: [n, function(e2) {
        this.month = 3 * (e2 - 1) + 1;
      }], S: [n, function(e2) {
        this.milliseconds = 100 * +e2;
      }], SS: [r, function(e2) {
        this.milliseconds = 10 * +e2;
      }], SSS: [/\d{3}/, function(e2) {
        this.milliseconds = +e2;
      }], s: [i, f("seconds")], ss: [i, f("seconds")], m: [i, f("minutes")], mm: [i, f("minutes")], H: [i, f("hours")], h: [i, f("hours")], HH: [i, f("hours")], hh: [i, f("hours")], D: [i, f("day")], DD: [r, f("day")], Do: [o, function(e2) {
        var t2 = s.ordinal, n2 = e2.match(/\d+/);
        if (this.day = n2[0], t2) for (var r2 = 1; r2 <= 31; r2 += 1) t2(r2).replace(/\[|\]/g, "") === e2 && (this.day = r2);
      }], w: [i, f("week")], ww: [r, f("week")], M: [i, f("month")], MM: [r, f("month")], MMM: [o, function(e2) {
        var t2 = u("months"), n2 = (u("monthsShort") || t2.map((function(e3) {
          return e3.slice(0, 3);
        }))).indexOf(e2) + 1;
        if (n2 < 1) throw new Error();
        this.month = n2 % 12 || n2;
      }], MMMM: [o, function(e2) {
        var t2 = u("months").indexOf(e2) + 1;
        if (t2 < 1) throw new Error();
        this.month = t2 % 12 || t2;
      }], Y: [/[+-]?\d+/, f("year")], YY: [r, function(e2) {
        this.year = a(e2);
      }], YYYY: [/\d{4}/, f("year")], Z: h, ZZ: h };
      function l(n2) {
        var r2, i2;
        r2 = n2, i2 = s && s.formats;
        for (var o2 = (n2 = r2.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(t2, n3, r3) {
          var o3 = r3 && r3.toUpperCase();
          return n3 || i2[r3] || e[r3] || i2[o3].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(e2, t3, n4) {
            return t3 || n4.slice(1);
          }));
        }))).match(t), a2 = o2.length, f2 = 0; f2 < a2; f2 += 1) {
          var h2 = o2[f2], u2 = c[h2], d2 = u2 && u2[0], l2 = u2 && u2[1];
          o2[f2] = l2 ? { regex: d2, parser: l2 } : h2.replace(/^\[|\]$/g, "");
        }
        return function(e2) {
          for (var t2 = {}, n3 = 0, r3 = 0; n3 < a2; n3 += 1) {
            var i3 = o2[n3];
            if ("string" == typeof i3) r3 += i3.length;
            else {
              var s2 = i3.regex, f3 = i3.parser, h3 = e2.slice(r3), u3 = s2.exec(h3)[0];
              f3.call(t2, u3), e2 = e2.replace(u3, "");
            }
          }
          return (function(e3) {
            var t3 = e3.afternoon;
            if (void 0 !== t3) {
              var n4 = e3.hours;
              t3 ? n4 < 12 && (e3.hours += 12) : 12 === n4 && (e3.hours = 0), delete e3.afternoon;
            }
          })(t2), t2;
        };
      }
      return function(e2, t2, n2) {
        n2.p.customParseFormat = true, e2 && e2.parseTwoDigitYear && (a = e2.parseTwoDigitYear);
        var r2 = t2.prototype, i2 = r2.parse;
        r2.parse = function(e3) {
          var t3 = e3.date, r3 = e3.utc, o2 = e3.args;
          this.$u = r3;
          var a2 = o2[1];
          if ("string" == typeof a2) {
            var f2 = true === o2[2], h2 = true === o2[3], u2 = f2 || h2, d2 = o2[2];
            h2 && (d2 = o2[2]), s = this.$locale(), !f2 && d2 && (s = n2.Ls[d2]), this.$d = (function(e4, t4, n3, r4) {
              try {
                if (["x", "X"].indexOf(t4) > -1) return new Date(("X" === t4 ? 1e3 : 1) * e4);
                var i3 = l(t4)(e4), o3 = i3.year, s2 = i3.month, a3 = i3.day, f3 = i3.hours, h3 = i3.minutes, u3 = i3.seconds, d3 = i3.milliseconds, c3 = i3.zone, m2 = i3.week, M2 = /* @__PURE__ */ new Date(), Y = a3 || (o3 || s2 ? 1 : M2.getDate()), p = o3 || M2.getFullYear(), v = 0;
                o3 && !s2 || (v = s2 > 0 ? s2 - 1 : M2.getMonth());
                var D, w = f3 || 0, g = h3 || 0, y = u3 || 0, L = d3 || 0;
                return c3 ? new Date(Date.UTC(p, v, Y, w, g, y, L + 60 * c3.offset * 1e3)) : n3 ? new Date(Date.UTC(p, v, Y, w, g, y, L)) : (D = new Date(p, v, Y, w, g, y, L), m2 && (D = r4(D).week(m2).toDate()), D);
              } catch (e5) {
                return /* @__PURE__ */ new Date("");
              }
            })(t3, a2, r3, n2), this.init(), d2 && true !== d2 && (this.$L = this.locale(d2).$L), u2 && t3 != this.format(a2) && (this.$d = /* @__PURE__ */ new Date("")), s = {};
          } else if (a2 instanceof Array) for (var c2 = a2.length, m = 1; m <= c2; m += 1) {
            o2[1] = a2[m - 1];
            var M = n2.apply(this, o2);
            if (M.isValid()) {
              this.$d = M.$d, this.$L = M.$L, this.init();
              break;
            }
            m === c2 && (this.$d = /* @__PURE__ */ new Date(""));
          }
          else i2.call(this, e3);
        };
      };
    }));
  })(customParseFormat$2);
  return customParseFormat$2.exports;
}
var customParseFormatExports = requireCustomParseFormat();
const customParseFormat = /* @__PURE__ */ getDefaultExportFromCjs(customParseFormatExports);
const timeUnits = ["hours", "minutes", "seconds"];
const PICKER_BASE_INJECTION_KEY = "EP_PICKER_BASE";
const PICKER_POPPER_OPTIONS_INJECTION_KEY = "ElPopperOptions";
const ROOT_COMMON_PICKER_INJECTION_KEY = Symbol("commonPickerContextKey");
const DEFAULT_FORMATS_TIME = "HH:mm:ss";
const DEFAULT_FORMATS_DATE = "YYYY-MM-DD";
const DEFAULT_FORMATS_DATEPICKER = {
  date: DEFAULT_FORMATS_DATE,
  dates: DEFAULT_FORMATS_DATE,
  week: "gggg[w]ww",
  year: "YYYY",
  years: "YYYY",
  month: "YYYY-MM",
  months: "YYYY-MM",
  datetime: `${DEFAULT_FORMATS_DATE} ${DEFAULT_FORMATS_TIME}`,
  monthrange: "YYYY-MM",
  yearrange: "YYYY",
  daterange: DEFAULT_FORMATS_DATE,
  datetimerange: `${DEFAULT_FORMATS_DATE} ${DEFAULT_FORMATS_TIME}`
};
const useCommonPicker = (props, emit) => {
  const { lang } = useLocale();
  const pickerVisible = ref(false);
  const pickerActualVisible = ref(false);
  const userInput = ref(null);
  const valueIsEmpty = computed(() => {
    const { modelValue } = props;
    return !modelValue || isArray$1(modelValue) && !modelValue.filter(Boolean).length;
  });
  const emitInput = (input) => {
    if (!valueEquals(props.modelValue, input)) {
      let formatted;
      if (isArray$1(input)) {
        formatted = input.map((item) => formatter(item, props.valueFormat, lang.value));
      } else if (input) {
        formatted = formatter(input, props.valueFormat, lang.value);
      }
      const emitVal = input ? formatted : input;
      emit(UPDATE_MODEL_EVENT, emitVal, lang.value);
    }
  };
  const parsedValue = computed(() => {
    var _a;
    let dayOrDays;
    if (valueIsEmpty.value) {
      if (pickerOptions.value.getDefaultValue) {
        dayOrDays = pickerOptions.value.getDefaultValue();
      }
    } else {
      if (isArray$1(props.modelValue)) {
        dayOrDays = props.modelValue.map((d) => parseDate(d, props.valueFormat, lang.value));
      } else {
        dayOrDays = parseDate((_a = props.modelValue) != null ? _a : "", props.valueFormat, lang.value);
      }
    }
    if (pickerOptions.value.getRangeAvailableTime) {
      const availableResult = pickerOptions.value.getRangeAvailableTime(dayOrDays);
      if (!isEqual(availableResult, dayOrDays)) {
        dayOrDays = availableResult;
        if (!valueIsEmpty.value) {
          emitInput(dayOrDaysToDate(dayOrDays));
        }
      }
    }
    if (isArray$1(dayOrDays) && dayOrDays.some((day) => !day)) {
      dayOrDays = [];
    }
    return dayOrDays;
  });
  const pickerOptions = ref({});
  const onSetPickerOption = (e) => {
    pickerOptions.value[e[0]] = e[1];
    pickerOptions.value.panelReady = true;
  };
  const onCalendarChange = (e) => {
    emit("calendar-change", e);
  };
  const onPanelChange = (value, mode, view) => {
    emit("panel-change", value, mode, view);
  };
  const onPick = (date = "", visible = false) => {
    pickerVisible.value = visible;
    let result;
    if (isArray$1(date)) {
      result = date.map((_) => _.toDate());
    } else {
      result = date ? date.toDate() : date;
    }
    userInput.value = null;
    emitInput(result);
  };
  return {
    parsedValue,
    pickerActualVisible,
    pickerOptions,
    pickerVisible,
    userInput,
    valueIsEmpty,
    emitInput,
    onCalendarChange,
    onPanelChange,
    onPick,
    onSetPickerOption
  };
};
const disabledTimeListsProps = buildProps({
  disabledHours: {
    type: definePropType(Function)
  },
  disabledMinutes: {
    type: definePropType(Function)
  },
  disabledSeconds: {
    type: definePropType(Function)
  }
});
const timePanelSharedProps = buildProps({
  visible: Boolean,
  actualVisible: {
    type: Boolean,
    default: void 0
  },
  format: {
    type: String,
    default: ""
  }
});
const timePickerDefaultProps = buildProps({
  automaticDropdown: {
    type: Boolean,
    default: true
  },
  id: {
    type: definePropType([Array, String])
  },
  name: {
    type: definePropType([Array, String])
  },
  popperClass: useTooltipContentProps.popperClass,
  popperStyle: useTooltipContentProps.popperStyle,
  format: String,
  valueFormat: String,
  dateFormat: String,
  timeFormat: String,
  type: {
    type: String,
    default: ""
  },
  clearable: {
    type: Boolean,
    default: true
  },
  clearIcon: {
    type: definePropType([String, Object]),
    default: circle_close_default
  },
  editable: {
    type: Boolean,
    default: true
  },
  prefixIcon: {
    type: definePropType([String, Object]),
    default: ""
  },
  size: useSizeProp,
  readonly: Boolean,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: ""
  },
  popperOptions: {
    type: definePropType(Object),
    default: () => ({})
  },
  modelValue: {
    type: definePropType([Date, Array, String, Number]),
    default: ""
  },
  rangeSeparator: {
    type: String,
    default: "-"
  },
  startPlaceholder: String,
  endPlaceholder: String,
  defaultValue: {
    type: definePropType([Date, Array])
  },
  defaultTime: {
    type: definePropType([Date, Array])
  },
  isRange: Boolean,
  ...disabledTimeListsProps,
  disabledDate: {
    type: Function
  },
  cellClassName: {
    type: Function
  },
  shortcuts: {
    type: Array,
    default: () => []
  },
  arrowControl: Boolean,
  tabindex: {
    type: definePropType([String, Number]),
    default: 0
  },
  validateEvent: {
    type: Boolean,
    default: true
  },
  unlinkPanels: Boolean,
  placement: {
    type: definePropType(String),
    values: Ee,
    default: "bottom"
  },
  fallbackPlacements: {
    type: definePropType(Array),
    default: ["bottom", "top", "right", "left"]
  },
  ...useEmptyValuesProps,
  ...useAriaProps(["ariaLabel"]),
  showNow: {
    type: Boolean,
    default: true
  },
  showConfirm: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showWeekNumber: Boolean
});
const timePickerRangeTriggerProps = buildProps({
  id: {
    type: definePropType(Array)
  },
  name: {
    type: definePropType(Array)
  },
  modelValue: {
    type: definePropType([Array, String])
  },
  startPlaceholder: String,
  endPlaceholder: String,
  disabled: Boolean
});
const __default__$7 = defineComponent({
  name: "PickerRangeTrigger",
  inheritAttrs: false
});
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  ...__default__$7,
  props: timePickerRangeTriggerProps,
  emits: [
    "mouseenter",
    "mouseleave",
    "click",
    "touchstart",
    "focus",
    "blur",
    "startInput",
    "endInput",
    "startChange",
    "endChange"
  ],
  setup(__props, { expose, emit }) {
    const props = __props;
    const { formItem } = useFormItem();
    const { inputId } = useFormItemInputId(reactive({ id: computed(() => {
      var _a;
      return (_a = props.id) == null ? void 0 : _a[0];
    }) }), {
      formItemContext: formItem
    });
    const attrs = useAttrs();
    const nsDate = useNamespace("date");
    const nsRange = useNamespace("range");
    const inputRef = ref();
    const endInputRef = ref();
    const { wrapperRef, isFocused } = useFocusController(inputRef, {
      disabled: computed(() => props.disabled)
    });
    const handleClick = (evt) => {
      emit("click", evt);
    };
    const handleMouseEnter = (evt) => {
      emit("mouseenter", evt);
    };
    const handleMouseLeave = (evt) => {
      emit("mouseleave", evt);
    };
    const handleTouchStart = (evt) => {
      emit("touchstart", evt);
    };
    const handleStartInput = (evt) => {
      emit("startInput", evt);
    };
    const handleEndInput = (evt) => {
      emit("endInput", evt);
    };
    const handleStartChange = (evt) => {
      emit("startChange", evt);
    };
    const handleEndChange = (evt) => {
      emit("endChange", evt);
    };
    const focus = () => {
      var _a;
      (_a = inputRef.value) == null ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a, _b;
      (_a = inputRef.value) == null ? void 0 : _a.blur();
      (_b = endInputRef.value) == null ? void 0 : _b.blur();
    };
    expose({
      focus,
      blur
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperRef",
        ref: wrapperRef,
        class: normalizeClass([unref(nsDate).is("active", unref(isFocused)), _ctx.$attrs.class]),
        style: normalizeStyle(_ctx.$attrs.style),
        onClick: handleClick,
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave,
        onTouchstartPassive: handleTouchStart
      }, [
        renderSlot(_ctx.$slots, "prefix"),
        createBaseVNode("input", mergeProps(unref(attrs), {
          id: unref(inputId),
          ref_key: "inputRef",
          ref: inputRef,
          name: _ctx.name && _ctx.name[0],
          placeholder: _ctx.startPlaceholder,
          value: _ctx.modelValue && _ctx.modelValue[0],
          class: unref(nsRange).b("input"),
          disabled: _ctx.disabled,
          onInput: handleStartInput,
          onChange: handleStartChange
        }), null, 16, ["id", "name", "placeholder", "value", "disabled"]),
        renderSlot(_ctx.$slots, "range-separator"),
        createBaseVNode("input", mergeProps(unref(attrs), {
          id: _ctx.id && _ctx.id[1],
          ref_key: "endInputRef",
          ref: endInputRef,
          name: _ctx.name && _ctx.name[1],
          placeholder: _ctx.endPlaceholder,
          value: _ctx.modelValue && _ctx.modelValue[1],
          class: unref(nsRange).b("input"),
          disabled: _ctx.disabled,
          onInput: handleEndInput,
          onChange: handleEndChange
        }), null, 16, ["id", "name", "placeholder", "value", "disabled"]),
        renderSlot(_ctx.$slots, "suffix")
      ], 38);
    };
  }
});
var PickerRangeTrigger = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__file", "picker-range-trigger.vue"]]);
const __default__$6 = defineComponent({
  name: "Picker"
});
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  ...__default__$6,
  props: timePickerDefaultProps,
  emits: [
    UPDATE_MODEL_EVENT,
    CHANGE_EVENT,
    "focus",
    "blur",
    "clear",
    "calendar-change",
    "panel-change",
    "visible-change",
    "keydown"
  ],
  setup(__props, { expose, emit }) {
    const props = __props;
    const attrs = useAttrs$1();
    const nsDate = useNamespace("date");
    const nsInput = useNamespace("input");
    const nsRange = useNamespace("range");
    const { formItem } = useFormItem();
    const elPopperOptions = inject(PICKER_POPPER_OPTIONS_INJECTION_KEY, {});
    const emptyValues = useEmptyValues(props, null);
    const refPopper = ref();
    const inputRef = ref();
    const valueOnOpen = ref(null);
    let hasJustTabExitedInput = false;
    const pickerDisabled = useFormDisabled();
    const commonPicker = useCommonPicker(props, emit);
    const {
      parsedValue,
      pickerActualVisible,
      userInput,
      pickerVisible,
      pickerOptions,
      valueIsEmpty,
      emitInput,
      onPick,
      onSetPickerOption,
      onCalendarChange,
      onPanelChange
    } = commonPicker;
    const { isFocused, handleFocus, handleBlur } = useFocusController(inputRef, {
      disabled: pickerDisabled,
      beforeFocus() {
        return props.readonly;
      },
      afterFocus() {
        if (!props.automaticDropdown)
          return;
        pickerVisible.value = true;
      },
      beforeBlur(event) {
        var _a;
        return !hasJustTabExitedInput && ((_a = refPopper.value) == null ? void 0 : _a.isFocusInsideContent(event));
      },
      afterBlur() {
        handleChange();
        pickerVisible.value = false;
        hasJustTabExitedInput = false;
        props.validateEvent && (formItem == null ? void 0 : formItem.validate("blur").catch((err) => debugWarn()));
      }
    });
    const hovering = ref(false);
    const rangeInputKls = computed(() => [
      nsDate.b("editor"),
      nsDate.bm("editor", props.type),
      nsInput.e("wrapper"),
      nsDate.is("disabled", pickerDisabled.value),
      nsDate.is("active", pickerVisible.value),
      nsRange.b("editor"),
      pickerSize ? nsRange.bm("editor", pickerSize.value) : "",
      attrs.class
    ]);
    const clearIconKls = computed(() => [
      nsInput.e("icon"),
      nsRange.e("close-icon"),
      !showClearBtn.value ? nsRange.em("close-icon", "hidden") : ""
    ]);
    watch(pickerVisible, (val) => {
      if (!val) {
        userInput.value = null;
        nextTick(() => {
          emitChange(props.modelValue);
        });
      } else {
        nextTick(() => {
          if (val) {
            valueOnOpen.value = props.modelValue;
          }
        });
      }
    });
    const emitChange = (val, isClear) => {
      if (isClear || !valueEquals(val, valueOnOpen.value)) {
        emit(CHANGE_EVENT, val);
        isClear && (valueOnOpen.value = val);
        props.validateEvent && (formItem == null ? void 0 : formItem.validate("change").catch((err) => debugWarn()));
      }
    };
    const emitKeydown = (e) => {
      emit("keydown", e);
    };
    const refInput = computed(() => {
      if (inputRef.value) {
        return Array.from(inputRef.value.$el.querySelectorAll("input"));
      }
      return [];
    });
    const setSelectionRange = (start, end, pos) => {
      const _inputs = refInput.value;
      if (!_inputs.length)
        return;
      if (!pos || pos === "min") {
        _inputs[0].setSelectionRange(start, end);
        _inputs[0].focus();
      } else if (pos === "max") {
        _inputs[1].setSelectionRange(start, end);
        _inputs[1].focus();
      }
    };
    const onBeforeShow = () => {
      pickerActualVisible.value = true;
    };
    const onShow = () => {
      emit("visible-change", true);
    };
    const onHide = () => {
      pickerActualVisible.value = false;
      pickerVisible.value = false;
      emit("visible-change", false);
    };
    const handleOpen = () => {
      pickerVisible.value = true;
    };
    const handleClose = () => {
      pickerVisible.value = false;
    };
    const displayValue = computed(() => {
      const formattedValue = formatToString(parsedValue.value);
      if (isArray$1(userInput.value)) {
        return [
          userInput.value[0] || formattedValue && formattedValue[0] || "",
          userInput.value[1] || formattedValue && formattedValue[1] || ""
        ];
      } else if (userInput.value !== null) {
        return userInput.value;
      }
      if (!isTimePicker.value && valueIsEmpty.value)
        return "";
      if (!pickerVisible.value && valueIsEmpty.value)
        return "";
      if (formattedValue) {
        return isDatesPicker.value || isMonthsPicker.value || isYearsPicker.value ? formattedValue.join(", ") : formattedValue;
      }
      return "";
    });
    const isTimeLikePicker = computed(() => props.type.includes("time"));
    const isTimePicker = computed(() => props.type.startsWith("time"));
    const isDatesPicker = computed(() => props.type === "dates");
    const isMonthsPicker = computed(() => props.type === "months");
    const isYearsPicker = computed(() => props.type === "years");
    const triggerIcon = computed(() => props.prefixIcon || (isTimeLikePicker.value ? clock_default : calendar_default));
    const showClearBtn = computed(() => props.clearable && !pickerDisabled.value && !props.readonly && !valueIsEmpty.value && (hovering.value || isFocused.value));
    const onClearIconClick = (event) => {
      if (props.readonly || pickerDisabled.value)
        return;
      if (showClearBtn.value) {
        event.stopPropagation();
        if (pickerOptions.value.handleClear) {
          pickerOptions.value.handleClear();
        } else {
          emitInput(emptyValues.valueOnClear.value);
        }
        emitChange(emptyValues.valueOnClear.value, true);
        onHide();
      }
      emit("clear");
    };
    const onMouseDownInput = async (event) => {
      var _a;
      if (props.readonly || pickerDisabled.value)
        return;
      if (((_a = event.target) == null ? void 0 : _a.tagName) !== "INPUT" || isFocused.value || !props.automaticDropdown) {
        pickerVisible.value = true;
      }
    };
    const onMouseEnter = () => {
      if (props.readonly || pickerDisabled.value)
        return;
      if (!valueIsEmpty.value && props.clearable) {
        hovering.value = true;
      }
    };
    const onMouseLeave = () => {
      hovering.value = false;
    };
    const onTouchStartInput = (event) => {
      var _a;
      if (props.readonly || pickerDisabled.value)
        return;
      if (((_a = event.touches[0].target) == null ? void 0 : _a.tagName) !== "INPUT" || isFocused.value || !props.automaticDropdown) {
        pickerVisible.value = true;
      }
    };
    const isRangeInput = computed(() => {
      return props.type.includes("range");
    });
    const pickerSize = useFormSize();
    const popperEl = computed(() => {
      var _a, _b;
      return (_b = (_a = unref(refPopper)) == null ? void 0 : _a.popperRef) == null ? void 0 : _b.contentRef;
    });
    const stophandle = onClickOutside(inputRef, (e) => {
      const unrefedPopperEl = unref(popperEl);
      const inputEl = unrefElement(inputRef);
      if (unrefedPopperEl && (e.target === unrefedPopperEl || e.composedPath().includes(unrefedPopperEl)) || e.target === inputEl || inputEl && e.composedPath().includes(inputEl))
        return;
      pickerVisible.value = false;
    });
    onBeforeUnmount(() => {
      stophandle == null ? void 0 : stophandle();
    });
    const handleChange = () => {
      if (userInput.value) {
        const value = parseUserInputToDayjs(displayValue.value);
        if (value) {
          if (isValidValue(value)) {
            emitInput(dayOrDaysToDate(value));
            userInput.value = null;
          }
        }
      }
      if (userInput.value === "") {
        emitInput(emptyValues.valueOnClear.value);
        emitChange(emptyValues.valueOnClear.value, true);
        userInput.value = null;
      }
    };
    const parseUserInputToDayjs = (value) => {
      if (!value)
        return null;
      return pickerOptions.value.parseUserInput(value);
    };
    const formatToString = (value) => {
      if (!value)
        return null;
      const res = isArray$1(value) ? value.map((_) => _.format(props.format)) : value.format(props.format);
      return res;
    };
    const isValidValue = (value) => {
      return pickerOptions.value.isValidValue(value);
    };
    const handleKeydownInput = async (event) => {
      if (props.readonly || pickerDisabled.value)
        return;
      const code = getEventCode(event);
      emitKeydown(event);
      if (code === EVENT_CODE.esc) {
        if (pickerVisible.value === true) {
          pickerVisible.value = false;
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (code === EVENT_CODE.down) {
        if (pickerOptions.value.handleFocusPicker) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (pickerVisible.value === false) {
          pickerVisible.value = true;
          await nextTick();
        }
        if (pickerOptions.value.handleFocusPicker) {
          pickerOptions.value.handleFocusPicker();
          return;
        }
      }
      if (code === EVENT_CODE.tab) {
        hasJustTabExitedInput = true;
        return;
      }
      if (code === EVENT_CODE.enter || code === EVENT_CODE.numpadEnter) {
        if (!pickerVisible.value) {
          pickerVisible.value = true;
        } else if (userInput.value === null || userInput.value === "" || isValidValue(parseUserInputToDayjs(displayValue.value))) {
          handleChange();
          pickerVisible.value = false;
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (userInput.value) {
        event.stopPropagation();
        return;
      }
      if (pickerOptions.value.handleKeydownInput) {
        pickerOptions.value.handleKeydownInput(event);
      }
    };
    const onUserInput = (e) => {
      userInput.value = e;
      if (!pickerVisible.value) {
        pickerVisible.value = true;
      }
    };
    const handleStartInput = (event) => {
      const target = event.target;
      if (userInput.value) {
        userInput.value = [target.value, userInput.value[1]];
      } else {
        userInput.value = [target.value, null];
      }
    };
    const handleEndInput = (event) => {
      const target = event.target;
      if (userInput.value) {
        userInput.value = [userInput.value[0], target.value];
      } else {
        userInput.value = [null, target.value];
      }
    };
    const handleStartChange = () => {
      var _a;
      const values = userInput.value;
      const value = parseUserInputToDayjs(values && values[0]);
      const parsedVal = unref(parsedValue);
      if (value && value.isValid()) {
        userInput.value = [
          formatToString(value),
          ((_a = displayValue.value) == null ? void 0 : _a[1]) || null
        ];
        const newValue = [value, parsedVal && (parsedVal[1] || null)];
        if (isValidValue(newValue)) {
          emitInput(dayOrDaysToDate(newValue));
          userInput.value = null;
        }
      }
    };
    const handleEndChange = () => {
      var _a;
      const values = unref(userInput);
      const value = parseUserInputToDayjs(values && values[1]);
      const parsedVal = unref(parsedValue);
      if (value && value.isValid()) {
        userInput.value = [
          ((_a = unref(displayValue)) == null ? void 0 : _a[0]) || null,
          formatToString(value)
        ];
        const newValue = [parsedVal && parsedVal[0], value];
        if (isValidValue(newValue)) {
          emitInput(dayOrDaysToDate(newValue));
          userInput.value = null;
        }
      }
    };
    const focus = () => {
      var _a;
      (_a = inputRef.value) == null ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a;
      (_a = inputRef.value) == null ? void 0 : _a.blur();
    };
    provide(PICKER_BASE_INJECTION_KEY, {
      props,
      emptyValues
    });
    provide(ROOT_COMMON_PICKER_INJECTION_KEY, commonPicker);
    expose({
      focus,
      blur,
      handleOpen,
      handleClose,
      onPick
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElTooltip), mergeProps({
        ref_key: "refPopper",
        ref: refPopper,
        visible: unref(pickerVisible),
        effect: "light",
        pure: "",
        trigger: "click"
      }, _ctx.$attrs, {
        role: "dialog",
        teleported: "",
        transition: `${unref(nsDate).namespace.value}-zoom-in-top`,
        "popper-class": [`${unref(nsDate).namespace.value}-picker__popper`, _ctx.popperClass],
        "popper-style": _ctx.popperStyle,
        "popper-options": unref(elPopperOptions),
        "fallback-placements": _ctx.fallbackPlacements,
        "gpu-acceleration": false,
        placement: _ctx.placement,
        "stop-popper-mouse-event": false,
        "hide-after": 0,
        persistent: "",
        onBeforeShow,
        onShow,
        onHide
      }), {
        default: withCtx(() => [
          !unref(isRangeInput) ? (openBlock(), createBlock(unref(ElInput), {
            key: 0,
            id: _ctx.id,
            ref_key: "inputRef",
            ref: inputRef,
            "container-role": "combobox",
            "model-value": unref(displayValue),
            name: _ctx.name,
            size: unref(pickerSize),
            disabled: unref(pickerDisabled),
            placeholder: _ctx.placeholder,
            class: normalizeClass([
              unref(nsDate).b("editor"),
              unref(nsDate).bm("editor", _ctx.type),
              unref(nsDate).is("focus", unref(pickerVisible)),
              _ctx.$attrs.class
            ]),
            style: normalizeStyle(_ctx.$attrs.style),
            readonly: !_ctx.editable || _ctx.readonly || unref(isDatesPicker) || unref(isMonthsPicker) || unref(isYearsPicker) || _ctx.type === "week",
            "aria-label": _ctx.ariaLabel,
            tabindex: _ctx.tabindex,
            "validate-event": false,
            onInput: onUserInput,
            onFocus: unref(handleFocus),
            onBlur: unref(handleBlur),
            onKeydown: handleKeydownInput,
            onChange: handleChange,
            onMousedown: onMouseDownInput,
            onMouseenter: onMouseEnter,
            onMouseleave: onMouseLeave,
            onTouchstartPassive: onTouchStartInput,
            onClick: withModifiers(() => {
            }, ["stop"])
          }, {
            prefix: withCtx(() => [
              unref(triggerIcon) ? (openBlock(), createBlock(unref(ElIcon), {
                key: 0,
                class: normalizeClass(unref(nsInput).e("icon")),
                onMousedown: withModifiers(onMouseDownInput, ["prevent"]),
                onTouchstartPassive: onTouchStartInput
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(unref(triggerIcon))))
                ]),
                _: 1
              }, 8, ["class", "onMousedown"])) : createCommentVNode("v-if", true)
            ]),
            suffix: withCtx(() => [
              unref(showClearBtn) && _ctx.clearIcon ? (openBlock(), createBlock(unref(ElIcon), {
                key: 0,
                class: normalizeClass(`${unref(nsInput).e("icon")} clear-icon`),
                onMousedown: withModifiers(unref(NOOP), ["prevent"]),
                onClick: onClearIconClick
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(_ctx.clearIcon)))
                ]),
                _: 1
              }, 8, ["class", "onMousedown"])) : createCommentVNode("v-if", true)
            ]),
            _: 1
          }, 8, ["id", "model-value", "name", "size", "disabled", "placeholder", "class", "style", "readonly", "aria-label", "tabindex", "onFocus", "onBlur", "onClick"])) : (openBlock(), createBlock(PickerRangeTrigger, {
            key: 1,
            id: _ctx.id,
            ref_key: "inputRef",
            ref: inputRef,
            "model-value": unref(displayValue),
            name: _ctx.name,
            disabled: unref(pickerDisabled),
            readonly: !_ctx.editable || _ctx.readonly,
            "start-placeholder": _ctx.startPlaceholder,
            "end-placeholder": _ctx.endPlaceholder,
            class: normalizeClass(unref(rangeInputKls)),
            style: normalizeStyle(_ctx.$attrs.style),
            "aria-label": _ctx.ariaLabel,
            tabindex: _ctx.tabindex,
            autocomplete: "off",
            role: "combobox",
            onClick: onMouseDownInput,
            onFocus: unref(handleFocus),
            onBlur: unref(handleBlur),
            onStartInput: handleStartInput,
            onStartChange: handleStartChange,
            onEndInput: handleEndInput,
            onEndChange: handleEndChange,
            onMousedown: onMouseDownInput,
            onMouseenter: onMouseEnter,
            onMouseleave: onMouseLeave,
            onTouchstartPassive: onTouchStartInput,
            onKeydown: handleKeydownInput
          }, {
            prefix: withCtx(() => [
              unref(triggerIcon) ? (openBlock(), createBlock(unref(ElIcon), {
                key: 0,
                class: normalizeClass([unref(nsInput).e("icon"), unref(nsRange).e("icon")])
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(unref(triggerIcon))))
                ]),
                _: 1
              }, 8, ["class"])) : createCommentVNode("v-if", true)
            ]),
            "range-separator": withCtx(() => [
              renderSlot(_ctx.$slots, "range-separator", {}, () => [
                createBaseVNode("span", {
                  class: normalizeClass(unref(nsRange).b("separator"))
                }, toDisplayString(_ctx.rangeSeparator), 3)
              ])
            ]),
            suffix: withCtx(() => [
              _ctx.clearIcon ? (openBlock(), createBlock(unref(ElIcon), {
                key: 0,
                class: normalizeClass(unref(clearIconKls)),
                onMousedown: withModifiers(unref(NOOP), ["prevent"]),
                onClick: onClearIconClick
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(_ctx.clearIcon)))
                ]),
                _: 1
              }, 8, ["class", "onMousedown"])) : createCommentVNode("v-if", true)
            ]),
            _: 3
          }, 8, ["id", "model-value", "name", "disabled", "readonly", "start-placeholder", "end-placeholder", "class", "style", "aria-label", "tabindex", "onFocus", "onBlur"]))
        ]),
        content: withCtx(() => [
          renderSlot(_ctx.$slots, "default", {
            visible: unref(pickerVisible),
            actualVisible: unref(pickerActualVisible),
            parsedValue: unref(parsedValue),
            format: _ctx.format,
            dateFormat: _ctx.dateFormat,
            timeFormat: _ctx.timeFormat,
            unlinkPanels: _ctx.unlinkPanels,
            type: _ctx.type,
            defaultValue: _ctx.defaultValue,
            showNow: _ctx.showNow,
            showConfirm: _ctx.showConfirm,
            showFooter: _ctx.showFooter,
            showWeekNumber: _ctx.showWeekNumber,
            onPick: unref(onPick),
            onSelectRange: setSelectionRange,
            onSetPickerOption: unref(onSetPickerOption),
            onCalendarChange: unref(onCalendarChange),
            onPanelChange: unref(onPanelChange),
            onMousedown: withModifiers(() => {
            }, ["stop"])
          })
        ]),
        _: 3
      }, 16, ["visible", "transition", "popper-class", "popper-style", "popper-options", "fallback-placements", "placement"]);
    };
  }
});
var CommonPicker = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__file", "picker.vue"]]);
const panelTimePickerProps = buildProps({
  ...timePanelSharedProps,
  datetimeRole: String,
  parsedValue: {
    type: definePropType(Object)
  }
});
const useTimePanel = ({
  getAvailableHours,
  getAvailableMinutes,
  getAvailableSeconds
}) => {
  const getAvailableTime = (date, role, first, compareDate) => {
    const availableTimeGetters = {
      hour: getAvailableHours,
      minute: getAvailableMinutes,
      second: getAvailableSeconds
    };
    let result = date;
    ["hour", "minute", "second"].forEach((type) => {
      if (availableTimeGetters[type]) {
        let availableTimeSlots;
        const method = availableTimeGetters[type];
        switch (type) {
          case "minute": {
            availableTimeSlots = method(result.hour(), role, compareDate);
            break;
          }
          case "second": {
            availableTimeSlots = method(result.hour(), result.minute(), role, compareDate);
            break;
          }
          default: {
            availableTimeSlots = method(role, compareDate);
            break;
          }
        }
        if ((availableTimeSlots == null ? void 0 : availableTimeSlots.length) && !availableTimeSlots.includes(result[type]())) {
          const pos = first ? 0 : availableTimeSlots.length - 1;
          result = result[type](availableTimeSlots[pos]);
        }
      }
    });
    return result;
  };
  const timePickerOptions = {};
  const onSetOption = ([key, val]) => {
    timePickerOptions[key] = val;
  };
  return {
    timePickerOptions,
    getAvailableTime,
    onSetOption
  };
};
const makeAvailableArr = (disabledList) => {
  const trueOrNumber = (isDisabled, index) => isDisabled || index;
  const getNumber = (predicate) => predicate !== true;
  return disabledList.map(trueOrNumber).filter(getNumber);
};
const getTimeLists = (disabledHours, disabledMinutes, disabledSeconds) => {
  const getHoursList = (role, compare) => {
    return makeList(24, disabledHours && (() => disabledHours == null ? void 0 : disabledHours(role, compare)));
  };
  const getMinutesList = (hour, role, compare) => {
    return makeList(60, disabledMinutes && (() => disabledMinutes == null ? void 0 : disabledMinutes(hour, role, compare)));
  };
  const getSecondsList = (hour, minute, role, compare) => {
    return makeList(60, disabledSeconds && (() => disabledSeconds == null ? void 0 : disabledSeconds(hour, minute, role, compare)));
  };
  return {
    getHoursList,
    getMinutesList,
    getSecondsList
  };
};
const buildAvailableTimeSlotGetter = (disabledHours, disabledMinutes, disabledSeconds) => {
  const { getHoursList, getMinutesList, getSecondsList } = getTimeLists(disabledHours, disabledMinutes, disabledSeconds);
  const getAvailableHours = (role, compare) => {
    return makeAvailableArr(getHoursList(role, compare));
  };
  const getAvailableMinutes = (hour, role, compare) => {
    return makeAvailableArr(getMinutesList(hour, role, compare));
  };
  const getAvailableSeconds = (hour, minute, role, compare) => {
    return makeAvailableArr(getSecondsList(hour, minute, role, compare));
  };
  return {
    getAvailableHours,
    getAvailableMinutes,
    getAvailableSeconds
  };
};
const useOldValue = (props) => {
  const oldValue = ref(props.parsedValue);
  watch(() => props.visible, (val) => {
    if (!val) {
      oldValue.value = props.parsedValue;
    }
  });
  return oldValue;
};
const basicTimeSpinnerProps = buildProps({
  role: {
    type: String,
    required: true
  },
  spinnerDate: {
    type: definePropType(Object),
    required: true
  },
  showSeconds: {
    type: Boolean,
    default: true
  },
  arrowControl: Boolean,
  amPmMode: {
    type: definePropType(String),
    default: ""
  },
  ...disabledTimeListsProps
});
const REPEAT_INTERVAL = 100;
const REPEAT_DELAY = 600;
const SCOPE = "_RepeatClick";
const vRepeatClick = {
  beforeMount(el, binding) {
    const value = binding.value;
    const { interval = REPEAT_INTERVAL, delay = REPEAT_DELAY } = isFunction(value) ? {} : value;
    let intervalId;
    let delayId;
    const handler = () => isFunction(value) ? value() : value.handler();
    const clear = () => {
      if (delayId) {
        clearTimeout(delayId);
        delayId = void 0;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = void 0;
      }
    };
    const start = (evt) => {
      if (evt.button !== 0)
        return;
      clear();
      handler();
      document.addEventListener("mouseup", clear, { once: true });
      delayId = setTimeout(() => {
        intervalId = setInterval(() => {
          handler();
        }, interval);
      }, delay);
    };
    el[SCOPE] = { start, clear };
    el.addEventListener("mousedown", start);
  },
  unmounted(el) {
    if (!el[SCOPE])
      return;
    const { start, clear } = el[SCOPE];
    if (start) {
      el.removeEventListener("mousedown", start);
    }
    if (clear) {
      clear();
      document.removeEventListener("mouseup", clear);
    }
    el[SCOPE] = null;
  }
};
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "basic-time-spinner",
  props: basicTimeSpinnerProps,
  emits: [CHANGE_EVENT, "select-range", "set-option"],
  setup(__props, { emit }) {
    const props = __props;
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const { isRange, format } = pickerBase.props;
    const ns = useNamespace("time");
    const { getHoursList, getMinutesList, getSecondsList } = getTimeLists(props.disabledHours, props.disabledMinutes, props.disabledSeconds);
    let isScrolling = false;
    const currentScrollbar = ref();
    const listHoursRef = ref();
    const listMinutesRef = ref();
    const listSecondsRef = ref();
    const listRefsMap = {
      hours: listHoursRef,
      minutes: listMinutesRef,
      seconds: listSecondsRef
    };
    const spinnerItems = computed(() => {
      return props.showSeconds ? timeUnits : timeUnits.slice(0, 2);
    });
    const timePartials = computed(() => {
      const { spinnerDate } = props;
      const hours = spinnerDate.hour();
      const minutes = spinnerDate.minute();
      const seconds = spinnerDate.second();
      return { hours, minutes, seconds };
    });
    const timeList = computed(() => {
      const { hours, minutes } = unref(timePartials);
      const { role, spinnerDate } = props;
      const compare = !isRange ? spinnerDate : void 0;
      return {
        hours: getHoursList(role, compare),
        minutes: getMinutesList(hours, role, compare),
        seconds: getSecondsList(hours, minutes, role, compare)
      };
    });
    const arrowControlTimeList = computed(() => {
      const { hours, minutes, seconds } = unref(timePartials);
      return {
        hours: buildTimeList(hours, 23),
        minutes: buildTimeList(minutes, 59),
        seconds: buildTimeList(seconds, 59)
      };
    });
    const debouncedResetScroll = debounce((type) => {
      isScrolling = false;
      adjustCurrentSpinner(type);
    }, 200);
    const getAmPmFlag = (hour) => {
      const shouldShowAmPm = !!props.amPmMode;
      if (!shouldShowAmPm)
        return "";
      const isCapital = props.amPmMode === "A";
      let content = hour < 12 ? " am" : " pm";
      if (isCapital)
        content = content.toUpperCase();
      return content;
    };
    const emitSelectRange = (type) => {
      let range = [0, 0];
      const actualFormat = format || DEFAULT_FORMATS_TIME;
      const hourIndex = actualFormat.indexOf("HH");
      const minuteIndex = actualFormat.indexOf("mm");
      const secondIndex = actualFormat.indexOf("ss");
      switch (type) {
        case "hours":
          if (hourIndex !== -1) {
            range = [hourIndex, hourIndex + 2];
          }
          break;
        case "minutes":
          if (minuteIndex !== -1) {
            range = [minuteIndex, minuteIndex + 2];
          }
          break;
        case "seconds":
          if (secondIndex !== -1) {
            range = [secondIndex, secondIndex + 2];
          }
          break;
      }
      const [left, right] = range;
      emit("select-range", left, right);
      currentScrollbar.value = type;
    };
    const adjustCurrentSpinner = (type) => {
      adjustSpinner(type, unref(timePartials)[type]);
    };
    const adjustSpinners = () => {
      adjustCurrentSpinner("hours");
      adjustCurrentSpinner("minutes");
      adjustCurrentSpinner("seconds");
    };
    const getScrollbarElement = (el) => el.querySelector(`.${ns.namespace.value}-scrollbar__wrap`);
    const adjustSpinner = (type, value) => {
      if (props.arrowControl)
        return;
      const scrollbar = unref(listRefsMap[type]);
      if (scrollbar && scrollbar.$el) {
        getScrollbarElement(scrollbar.$el).scrollTop = Math.max(0, value * typeItemHeight(type));
      }
    };
    const typeItemHeight = (type) => {
      const scrollbar = unref(listRefsMap[type]);
      const listItem = scrollbar == null ? void 0 : scrollbar.$el.querySelector("li");
      if (listItem) {
        return Number.parseFloat(getStyle(listItem, "height")) || 0;
      }
      return 0;
    };
    const onIncrement = () => {
      scrollDown(1);
    };
    const onDecrement = () => {
      scrollDown(-1);
    };
    const scrollDown = (step2) => {
      if (!currentScrollbar.value) {
        emitSelectRange("hours");
      }
      const label = currentScrollbar.value;
      const now2 = unref(timePartials)[label];
      const total = currentScrollbar.value === "hours" ? 24 : 60;
      const next = findNextUnDisabled(label, now2, step2, total);
      modifyDateField(label, next);
      adjustSpinner(label, next);
      nextTick(() => emitSelectRange(label));
    };
    const findNextUnDisabled = (type, now2, step2, total) => {
      let next = (now2 + step2 + total) % total;
      const list = unref(timeList)[type];
      while (list[next] && next !== now2) {
        next = (next + step2 + total) % total;
      }
      return next;
    };
    const modifyDateField = (type, value) => {
      const list = unref(timeList)[type];
      const isDisabled = list[value];
      if (isDisabled)
        return;
      const { hours, minutes, seconds } = unref(timePartials);
      let changeTo;
      switch (type) {
        case "hours":
          changeTo = props.spinnerDate.hour(value).minute(minutes).second(seconds);
          break;
        case "minutes":
          changeTo = props.spinnerDate.hour(hours).minute(value).second(seconds);
          break;
        case "seconds":
          changeTo = props.spinnerDate.hour(hours).minute(minutes).second(value);
          break;
      }
      emit(CHANGE_EVENT, changeTo);
    };
    const handleClick = (type, { value, disabled }) => {
      if (!disabled) {
        modifyDateField(type, value);
        emitSelectRange(type);
        adjustSpinner(type, value);
      }
    };
    const handleScroll = (type) => {
      const scrollbar = unref(listRefsMap[type]);
      if (!scrollbar)
        return;
      isScrolling = true;
      debouncedResetScroll(type);
      const value = Math.min(Math.round((getScrollbarElement(scrollbar.$el).scrollTop - (scrollBarHeight(type) * 0.5 - 10) / typeItemHeight(type) + 3) / typeItemHeight(type)), type === "hours" ? 23 : 59);
      modifyDateField(type, value);
    };
    const scrollBarHeight = (type) => {
      return unref(listRefsMap[type]).$el.offsetHeight;
    };
    const bindScrollEvent = () => {
      const bindFunction = (type) => {
        const scrollbar = unref(listRefsMap[type]);
        if (scrollbar && scrollbar.$el) {
          getScrollbarElement(scrollbar.$el).onscroll = () => {
            handleScroll(type);
          };
        }
      };
      bindFunction("hours");
      bindFunction("minutes");
      bindFunction("seconds");
    };
    onMounted(() => {
      nextTick(() => {
        !props.arrowControl && bindScrollEvent();
        adjustSpinners();
        if (props.role === "start")
          emitSelectRange("hours");
      });
    });
    const setRef = (scrollbar, type) => {
      listRefsMap[type].value = scrollbar != null ? scrollbar : void 0;
    };
    emit("set-option", [`${props.role}_scrollDown`, scrollDown]);
    emit("set-option", [`${props.role}_emitSelectRange`, emitSelectRange]);
    watch(() => props.spinnerDate, () => {
      if (isScrolling)
        return;
      adjustSpinners();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([unref(ns).b("spinner"), { "has-seconds": _ctx.showSeconds }])
      }, [
        !_ctx.arrowControl ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(unref(spinnerItems), (item) => {
          return openBlock(), createBlock(unref(ElScrollbar), {
            key: item,
            ref_for: true,
            ref: (scrollbar) => setRef(scrollbar, item),
            class: normalizeClass(unref(ns).be("spinner", "wrapper")),
            "wrap-style": "max-height: inherit;",
            "view-class": unref(ns).be("spinner", "list"),
            noresize: "",
            tag: "ul",
            onMouseenter: ($event) => emitSelectRange(item),
            onMousemove: ($event) => adjustCurrentSpinner(item)
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(timeList)[item], (disabled, key) => {
                return openBlock(), createElementBlock("li", {
                  key,
                  class: normalizeClass([
                    unref(ns).be("spinner", "item"),
                    unref(ns).is("active", key === unref(timePartials)[item]),
                    unref(ns).is("disabled", disabled)
                  ]),
                  onClick: ($event) => handleClick(item, { value: key, disabled })
                }, [
                  item === "hours" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    createTextVNode(toDisplayString(("0" + (_ctx.amPmMode ? key % 12 || 12 : key)).slice(-2)) + toDisplayString(getAmPmFlag(key)), 1)
                  ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    createTextVNode(toDisplayString(("0" + key).slice(-2)), 1)
                  ], 64))
                ], 10, ["onClick"]);
              }), 128))
            ]),
            _: 2
          }, 1032, ["class", "view-class", "onMouseenter", "onMousemove"]);
        }), 128)) : createCommentVNode("v-if", true),
        _ctx.arrowControl ? (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(unref(spinnerItems), (item) => {
          return openBlock(), createElementBlock("div", {
            key: item,
            class: normalizeClass([unref(ns).be("spinner", "wrapper"), unref(ns).is("arrow")]),
            onMouseenter: ($event) => emitSelectRange(item)
          }, [
            withDirectives((openBlock(), createBlock(unref(ElIcon), {
              class: normalizeClass(["arrow-up", unref(ns).be("spinner", "arrow")])
            }, {
              default: withCtx(() => [
                createVNode(unref(arrow_up_default))
              ]),
              _: 1
            }, 8, ["class"])), [
              [unref(vRepeatClick), onDecrement]
            ]),
            withDirectives((openBlock(), createBlock(unref(ElIcon), {
              class: normalizeClass(["arrow-down", unref(ns).be("spinner", "arrow")])
            }, {
              default: withCtx(() => [
                createVNode(unref(arrow_down_default))
              ]),
              _: 1
            }, 8, ["class"])), [
              [unref(vRepeatClick), onIncrement]
            ]),
            createBaseVNode("ul", {
              class: normalizeClass(unref(ns).be("spinner", "list"))
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(arrowControlTimeList)[item], (time, key) => {
                return openBlock(), createElementBlock("li", {
                  key,
                  class: normalizeClass([
                    unref(ns).be("spinner", "item"),
                    unref(ns).is("active", time === unref(timePartials)[item]),
                    unref(ns).is("disabled", unref(timeList)[item][time])
                  ])
                }, [
                  unref(isNumber)(time) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    item === "hours" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                      createTextVNode(toDisplayString(("0" + (_ctx.amPmMode ? time % 12 || 12 : time)).slice(-2)) + toDisplayString(getAmPmFlag(time)), 1)
                    ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      createTextVNode(toDisplayString(("0" + time).slice(-2)), 1)
                    ], 64))
                  ], 64)) : createCommentVNode("v-if", true)
                ], 2);
              }), 128))
            ], 2)
          ], 42, ["onMouseenter"]);
        }), 128)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var TimeSpinner = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__file", "basic-time-spinner.vue"]]);
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "panel-time-pick",
  props: panelTimePickerProps,
  emits: ["pick", "select-range", "set-picker-option"],
  setup(__props, { emit }) {
    const props = __props;
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const {
      arrowControl,
      disabledHours,
      disabledMinutes,
      disabledSeconds,
      defaultValue
    } = pickerBase.props;
    const { getAvailableHours, getAvailableMinutes, getAvailableSeconds } = buildAvailableTimeSlotGetter(disabledHours, disabledMinutes, disabledSeconds);
    const ns = useNamespace("time");
    const { t, lang } = useLocale();
    const selectionRange = ref([0, 2]);
    const oldValue = useOldValue(props);
    const transitionName = computed(() => {
      return isUndefined$1(props.actualVisible) ? `${ns.namespace.value}-zoom-in-top` : "";
    });
    const showSeconds = computed(() => {
      return props.format.includes("ss");
    });
    const amPmMode = computed(() => {
      if (props.format.includes("A"))
        return "A";
      if (props.format.includes("a"))
        return "a";
      return "";
    });
    const isValidValue = (_date) => {
      const parsedDate = dayjs(_date).locale(lang.value);
      const result = getRangeAvailableTime(parsedDate);
      return parsedDate.isSame(result);
    };
    const handleCancel = () => {
      const old = oldValue.value;
      emit("pick", old, false);
      nextTick(() => {
        oldValue.value = old;
      });
    };
    const handleConfirm = (visible = false, first = false) => {
      if (first)
        return;
      emit("pick", props.parsedValue, visible);
    };
    const handleChange = (_date) => {
      if (!props.visible) {
        return;
      }
      const result = getRangeAvailableTime(_date).millisecond(0);
      emit("pick", result, true);
    };
    const setSelectionRange = (start, end) => {
      emit("select-range", start, end);
      selectionRange.value = [start, end];
    };
    const changeSelectionRange = (step2) => {
      const actualFormat = props.format;
      const hourIndex = actualFormat.indexOf("HH");
      const minuteIndex = actualFormat.indexOf("mm");
      const secondIndex = actualFormat.indexOf("ss");
      const list = [];
      const mapping = [];
      if (hourIndex !== -1) {
        list.push(hourIndex);
        mapping.push("hours");
      }
      if (minuteIndex !== -1) {
        list.push(minuteIndex);
        mapping.push("minutes");
      }
      if (secondIndex !== -1 && showSeconds.value) {
        list.push(secondIndex);
        mapping.push("seconds");
      }
      const index = list.indexOf(selectionRange.value[0]);
      const next = (index + step2 + list.length) % list.length;
      timePickerOptions["start_emitSelectRange"](mapping[next]);
    };
    const handleKeydown = (event) => {
      const code = getEventCode(event);
      const { left, right, up, down } = EVENT_CODE;
      if ([left, right].includes(code)) {
        const step2 = code === left ? -1 : 1;
        changeSelectionRange(step2);
        event.preventDefault();
        return;
      }
      if ([up, down].includes(code)) {
        const step2 = code === up ? -1 : 1;
        timePickerOptions["start_scrollDown"](step2);
        event.preventDefault();
        return;
      }
    };
    const { timePickerOptions, onSetOption, getAvailableTime } = useTimePanel({
      getAvailableHours,
      getAvailableMinutes,
      getAvailableSeconds
    });
    const getRangeAvailableTime = (date) => {
      return getAvailableTime(date, props.datetimeRole || "", true);
    };
    const parseUserInput = (value) => {
      if (!value)
        return null;
      return dayjs(value, props.format).locale(lang.value);
    };
    const getDefaultValue2 = () => {
      return dayjs(defaultValue).locale(lang.value);
    };
    emit("set-picker-option", ["isValidValue", isValidValue]);
    emit("set-picker-option", ["parseUserInput", parseUserInput]);
    emit("set-picker-option", ["handleKeydownInput", handleKeydown]);
    emit("set-picker-option", ["getRangeAvailableTime", getRangeAvailableTime]);
    emit("set-picker-option", ["getDefaultValue", getDefaultValue2]);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, { name: unref(transitionName) }, {
        default: withCtx(() => [
          _ctx.actualVisible || _ctx.visible ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ns).b("panel"))
          }, [
            createBaseVNode("div", {
              class: normalizeClass([unref(ns).be("panel", "content"), { "has-seconds": unref(showSeconds) }])
            }, [
              createVNode(TimeSpinner, {
                ref: "spinner",
                role: _ctx.datetimeRole || "start",
                "arrow-control": unref(arrowControl),
                "show-seconds": unref(showSeconds),
                "am-pm-mode": unref(amPmMode),
                "spinner-date": _ctx.parsedValue,
                "disabled-hours": unref(disabledHours),
                "disabled-minutes": unref(disabledMinutes),
                "disabled-seconds": unref(disabledSeconds),
                onChange: handleChange,
                onSetOption: unref(onSetOption),
                onSelectRange: setSelectionRange
              }, null, 8, ["role", "arrow-control", "show-seconds", "am-pm-mode", "spinner-date", "disabled-hours", "disabled-minutes", "disabled-seconds", "onSetOption"])
            ], 2),
            createBaseVNode("div", {
              class: normalizeClass(unref(ns).be("panel", "footer"))
            }, [
              createBaseVNode("button", {
                type: "button",
                class: normalizeClass([unref(ns).be("panel", "btn"), "cancel"]),
                onClick: handleCancel
              }, toDisplayString(unref(t)("el.datepicker.cancel")), 3),
              createBaseVNode("button", {
                type: "button",
                class: normalizeClass([unref(ns).be("panel", "btn"), "confirm"]),
                onClick: ($event) => handleConfirm()
              }, toDisplayString(unref(t)("el.datepicker.confirm")), 11, ["onClick"])
            ], 2)
          ], 2)) : createCommentVNode("v-if", true)
        ]),
        _: 1
      }, 8, ["name"]);
    };
  }
});
var TimePickPanel = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__file", "panel-time-pick.vue"]]);
var advancedFormat$2 = { exports: {} };
var advancedFormat$1 = advancedFormat$2.exports;
var hasRequiredAdvancedFormat;
function requireAdvancedFormat() {
  if (hasRequiredAdvancedFormat) return advancedFormat$2.exports;
  hasRequiredAdvancedFormat = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(advancedFormat$1, (function() {
      return function(e, t) {
        var r = t.prototype, n = r.format;
        r.format = function(e2) {
          var t2 = this, r2 = this.$locale();
          if (!this.isValid()) return n.bind(this)(e2);
          var s = this.$utils(), a = (e2 || "YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, (function(e3) {
            switch (e3) {
              case "Q":
                return Math.ceil((t2.$M + 1) / 3);
              case "Do":
                return r2.ordinal(t2.$D);
              case "gggg":
                return t2.weekYear();
              case "GGGG":
                return t2.isoWeekYear();
              case "wo":
                return r2.ordinal(t2.week(), "W");
              case "w":
              case "ww":
                return s.s(t2.week(), "w" === e3 ? 1 : 2, "0");
              case "W":
              case "WW":
                return s.s(t2.isoWeek(), "W" === e3 ? 1 : 2, "0");
              case "k":
              case "kk":
                return s.s(String(0 === t2.$H ? 24 : t2.$H), "k" === e3 ? 1 : 2, "0");
              case "X":
                return Math.floor(t2.$d.getTime() / 1e3);
              case "x":
                return t2.$d.getTime();
              case "z":
                return "[" + t2.offsetName() + "]";
              case "zzz":
                return "[" + t2.offsetName("long") + "]";
              default:
                return e3;
            }
          }));
          return n.bind(this)(a);
        };
      };
    }));
  })(advancedFormat$2);
  return advancedFormat$2.exports;
}
var advancedFormatExports = requireAdvancedFormat();
const advancedFormat = /* @__PURE__ */ getDefaultExportFromCjs(advancedFormatExports);
var weekOfYear$2 = { exports: {} };
var weekOfYear$1 = weekOfYear$2.exports;
var hasRequiredWeekOfYear;
function requireWeekOfYear() {
  if (hasRequiredWeekOfYear) return weekOfYear$2.exports;
  hasRequiredWeekOfYear = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(weekOfYear$1, (function() {
      var e = "week", t = "year";
      return function(i, n, r) {
        var f = n.prototype;
        f.week = function(i2) {
          if (void 0 === i2 && (i2 = null), null !== i2) return this.add(7 * (i2 - this.week()), "day");
          var n2 = this.$locale().yearStart || 1;
          if (11 === this.month() && this.date() > 25) {
            var f2 = r(this).startOf(t).add(1, t).date(n2), s = r(this).endOf(e);
            if (f2.isBefore(s)) return 1;
          }
          var a = r(this).startOf(t).date(n2).startOf(e).subtract(1, "millisecond"), o = this.diff(a, e, true);
          return o < 0 ? r(this).startOf("week").week() : Math.ceil(o);
        }, f.weeks = function(e2) {
          return void 0 === e2 && (e2 = null), this.week(e2);
        };
      };
    }));
  })(weekOfYear$2);
  return weekOfYear$2.exports;
}
var weekOfYearExports = requireWeekOfYear();
const weekOfYear = /* @__PURE__ */ getDefaultExportFromCjs(weekOfYearExports);
var weekYear$2 = { exports: {} };
var weekYear$1 = weekYear$2.exports;
var hasRequiredWeekYear;
function requireWeekYear() {
  if (hasRequiredWeekYear) return weekYear$2.exports;
  hasRequiredWeekYear = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(weekYear$1, (function() {
      return function(e, t) {
        t.prototype.weekYear = function() {
          var e2 = this.month(), t2 = this.week(), n = this.year();
          return 1 === t2 && 11 === e2 ? n + 1 : 0 === e2 && t2 >= 52 ? n - 1 : n;
        };
      };
    }));
  })(weekYear$2);
  return weekYear$2.exports;
}
var weekYearExports = requireWeekYear();
const weekYear = /* @__PURE__ */ getDefaultExportFromCjs(weekYearExports);
var dayOfYear$2 = { exports: {} };
var dayOfYear$1 = dayOfYear$2.exports;
var hasRequiredDayOfYear;
function requireDayOfYear() {
  if (hasRequiredDayOfYear) return dayOfYear$2.exports;
  hasRequiredDayOfYear = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(dayOfYear$1, (function() {
      return function(e, t, n) {
        t.prototype.dayOfYear = function(e2) {
          var t2 = Math.round((n(this).startOf("day") - n(this).startOf("year")) / 864e5) + 1;
          return null == e2 ? t2 : this.add(e2 - t2, "day");
        };
      };
    }));
  })(dayOfYear$2);
  return dayOfYear$2.exports;
}
var dayOfYearExports = requireDayOfYear();
const dayOfYear = /* @__PURE__ */ getDefaultExportFromCjs(dayOfYearExports);
var isSameOrAfter$2 = { exports: {} };
var isSameOrAfter$1 = isSameOrAfter$2.exports;
var hasRequiredIsSameOrAfter;
function requireIsSameOrAfter() {
  if (hasRequiredIsSameOrAfter) return isSameOrAfter$2.exports;
  hasRequiredIsSameOrAfter = 1;
  (function(module2, exports$1) {
    !(function(e, t) {
      module2.exports = t();
    })(isSameOrAfter$1, (function() {
      return function(e, t) {
        t.prototype.isSameOrAfter = function(e2, t2) {
          return this.isSame(e2, t2) || this.isAfter(e2, t2);
        };
      };
    }));
  })(isSameOrAfter$2);
  return isSameOrAfter$2.exports;
}
var isSameOrAfterExports = requireIsSameOrAfter();
const isSameOrAfter = /* @__PURE__ */ getDefaultExportFromCjs(isSameOrAfterExports);
var isSameOrBefore$2 = { exports: {} };
var isSameOrBefore$1 = isSameOrBefore$2.exports;
var hasRequiredIsSameOrBefore;
function requireIsSameOrBefore() {
  if (hasRequiredIsSameOrBefore) return isSameOrBefore$2.exports;
  hasRequiredIsSameOrBefore = 1;
  (function(module2, exports$1) {
    !(function(e, i) {
      module2.exports = i();
    })(isSameOrBefore$1, (function() {
      return function(e, i) {
        i.prototype.isSameOrBefore = function(e2, i2) {
          return this.isSame(e2, i2) || this.isBefore(e2, i2);
        };
      };
    }));
  })(isSameOrBefore$2);
  return isSameOrBefore$2.exports;
}
var isSameOrBeforeExports = requireIsSameOrBefore();
const isSameOrBefore = /* @__PURE__ */ getDefaultExportFromCjs(isSameOrBeforeExports);
const datePickerPanelProps = buildProps({
  valueFormat: String,
  dateFormat: String,
  timeFormat: String,
  disabled: Boolean,
  modelValue: {
    type: definePropType([Date, Array, String, Number]),
    default: ""
  },
  defaultValue: {
    type: definePropType([Date, Array])
  },
  defaultTime: {
    type: definePropType([Date, Array])
  },
  isRange: Boolean,
  ...disabledTimeListsProps,
  disabledDate: {
    type: Function
  },
  cellClassName: {
    type: Function
  },
  shortcuts: {
    type: Array,
    default: () => []
  },
  arrowControl: Boolean,
  unlinkPanels: Boolean,
  showNow: {
    type: Boolean,
    default: true
  },
  showConfirm: Boolean,
  showFooter: Boolean,
  showWeekNumber: Boolean,
  type: {
    type: definePropType(String),
    default: "date"
  },
  clearable: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  }
});
const ROOT_PICKER_INJECTION_KEY = Symbol("rootPickerContextKey");
const ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY = "ElIsDefaultFormat";
const selectionModes = [
  "date",
  "dates",
  "year",
  "years",
  "month",
  "months",
  "week",
  "range"
];
const datePickerSharedProps = buildProps({
  cellClassName: {
    type: definePropType(Function)
  },
  disabledDate: {
    type: definePropType(Function)
  },
  date: {
    type: definePropType(Object),
    required: true
  },
  minDate: {
    type: definePropType(Object)
  },
  maxDate: {
    type: definePropType(Object)
  },
  parsedValue: {
    type: definePropType([Object, Array])
  },
  rangeState: {
    type: definePropType(Object),
    default: () => ({
      endDate: null,
      selecting: false
    })
  },
  disabled: Boolean
});
const panelSharedProps = buildProps({
  type: {
    type: definePropType(String),
    required: true,
    values: datePickTypes
  },
  dateFormat: String,
  timeFormat: String,
  showNow: {
    type: Boolean,
    default: true
  },
  showConfirm: Boolean,
  showFooter: {
    type: Boolean,
    default: true
  },
  showWeekNumber: Boolean,
  border: Boolean,
  disabled: Boolean
});
const panelRangeSharedProps = buildProps({
  unlinkPanels: Boolean,
  visible: {
    type: Boolean,
    default: true
  },
  showConfirm: Boolean,
  showFooter: {
    type: Boolean,
    default: true
  },
  border: Boolean,
  disabled: Boolean,
  parsedValue: {
    type: definePropType(Array)
  }
});
const selectionModeWithDefault = (mode) => {
  return {
    type: String,
    values: selectionModes,
    default: mode
  };
};
const panelDatePickProps = buildProps({
  ...panelSharedProps,
  parsedValue: {
    type: definePropType([Object, Array])
  },
  visible: {
    type: Boolean,
    default: true
  },
  format: {
    type: String,
    default: ""
  }
});
const isValidRange = (range) => {
  if (!isArray$1(range))
    return false;
  const [left, right] = range;
  return dayjs.isDayjs(left) && dayjs.isDayjs(right) && dayjs(left).isValid() && dayjs(right).isValid() && left.isSameOrBefore(right);
};
const getDefaultValue = (defaultValue, { lang, step: step2 = 1, unit: unit2, unlinkPanels }) => {
  let start;
  if (isArray$1(defaultValue)) {
    let [left, right] = defaultValue.map((d) => dayjs(d).locale(lang));
    if (!unlinkPanels) {
      right = left.add(step2, unit2);
    }
    return [left, right];
  } else if (defaultValue) {
    start = dayjs(defaultValue);
  } else {
    start = dayjs();
  }
  start = start.locale(lang);
  return [start, start.add(step2, unit2)];
};
const buildPickerTable = (dimension, rows, {
  columnIndexOffset,
  startDate,
  nextEndDate,
  now: now2,
  unit: unit2,
  relativeDateGetter,
  setCellMetadata,
  setRowMetadata
}) => {
  for (let rowIndex = 0; rowIndex < dimension.row; rowIndex++) {
    const row = rows[rowIndex];
    for (let columnIndex = 0; columnIndex < dimension.column; columnIndex++) {
      let cell = row[columnIndex + columnIndexOffset];
      if (!cell) {
        cell = {
          row: rowIndex,
          column: columnIndex,
          type: "normal",
          inRange: false,
          start: false,
          end: false
        };
      }
      const index = rowIndex * dimension.column + columnIndex;
      const nextStartDate = relativeDateGetter(index);
      cell.dayjs = nextStartDate;
      cell.date = nextStartDate.toDate();
      cell.timestamp = nextStartDate.valueOf();
      cell.type = "normal";
      cell.inRange = !!(startDate && nextStartDate.isSameOrAfter(startDate, unit2) && nextEndDate && nextStartDate.isSameOrBefore(nextEndDate, unit2)) || !!(startDate && nextStartDate.isSameOrBefore(startDate, unit2) && nextEndDate && nextStartDate.isSameOrAfter(nextEndDate, unit2));
      if (startDate == null ? void 0 : startDate.isSameOrAfter(nextEndDate)) {
        cell.start = !!nextEndDate && nextStartDate.isSame(nextEndDate, unit2);
        cell.end = startDate && nextStartDate.isSame(startDate, unit2);
      } else {
        cell.start = !!startDate && nextStartDate.isSame(startDate, unit2);
        cell.end = !!nextEndDate && nextStartDate.isSame(nextEndDate, unit2);
      }
      const isToday = nextStartDate.isSame(now2, unit2);
      if (isToday) {
        cell.type = "today";
      }
      setCellMetadata == null ? void 0 : setCellMetadata(cell, { rowIndex, columnIndex });
      row[columnIndex + columnIndexOffset] = cell;
    }
    setRowMetadata == null ? void 0 : setRowMetadata(row);
  }
};
const datesInMonth = (date, year, month, lang) => {
  const firstDay = dayjs().locale(lang).startOf("month").month(month).year(year).hour(date.hour()).minute(date.minute()).second(date.second());
  const numOfDays = firstDay.daysInMonth();
  return rangeArr(numOfDays).map((n) => firstDay.add(n, "day").toDate());
};
const getValidDateOfMonth = (date, year, month, lang, disabledDate) => {
  const _value = dayjs().year(year).month(month).startOf("month").hour(date.hour()).minute(date.minute()).second(date.second());
  const _date = datesInMonth(date, year, month, lang).find((date2) => {
    return !(disabledDate == null ? void 0 : disabledDate(date2));
  });
  if (_date) {
    return dayjs(_date).locale(lang);
  }
  return _value.locale(lang);
};
const getValidDateOfYear = (value, lang, disabledDate) => {
  const year = value.year();
  if (!(disabledDate == null ? void 0 : disabledDate(value.toDate()))) {
    return value.locale(lang);
  }
  const month = value.month();
  if (!datesInMonth(value, year, month, lang).every(disabledDate)) {
    return getValidDateOfMonth(value, year, month, lang, disabledDate);
  }
  for (let i = 0; i < 12; i++) {
    if (!datesInMonth(value, year, i, lang).every(disabledDate)) {
      return getValidDateOfMonth(value, year, i, lang, disabledDate);
    }
  }
  return value;
};
const correctlyParseUserInput = (value, format, lang, defaultFormat) => {
  if (isArray$1(value)) {
    return value.map((v) => correctlyParseUserInput(v, format, lang, defaultFormat));
  }
  if (isString(value)) {
    const dayjsValue = (defaultFormat == null ? void 0 : defaultFormat.value) ? dayjs(value) : dayjs(value, format);
    if (!dayjsValue.isValid()) {
      return dayjsValue;
    }
  }
  return dayjs(value, format).locale(lang);
};
const basicDateTableProps = buildProps({
  ...datePickerSharedProps,
  showWeekNumber: Boolean,
  selectionMode: selectionModeWithDefault("date")
});
const basicDateTableEmits = ["changerange", "pick", "select"];
const isNormalDay = (type = "") => {
  return ["normal", "today"].includes(type);
};
const useBasicDateTable = (props, emit) => {
  const { lang } = useLocale();
  const tbodyRef = ref();
  const currentCellRef = ref();
  const lastRow = ref();
  const lastColumn = ref();
  const tableRows = ref([[], [], [], [], [], []]);
  let focusWithClick = false;
  const firstDayOfWeek = props.date.$locale().weekStart || 7;
  const WEEKS_CONSTANT = props.date.locale("en").localeData().weekdaysShort().map((_) => _.toLowerCase());
  const offsetDay = computed(() => {
    return firstDayOfWeek > 3 ? 7 - firstDayOfWeek : -firstDayOfWeek;
  });
  const startDate = computed(() => {
    const startDayOfMonth = props.date.startOf("month");
    return startDayOfMonth.subtract(startDayOfMonth.day() || 7, "day");
  });
  const WEEKS = computed(() => {
    return WEEKS_CONSTANT.concat(WEEKS_CONSTANT).slice(firstDayOfWeek, firstDayOfWeek + 7);
  });
  const hasCurrent = computed(() => {
    return flatten(unref(rows)).some((row) => {
      return row.isCurrent;
    });
  });
  const days = computed(() => {
    const startOfMonth = props.date.startOf("month");
    const startOfMonthDay = startOfMonth.day() || 7;
    const dateCountOfMonth = startOfMonth.daysInMonth();
    const dateCountOfLastMonth = startOfMonth.subtract(1, "month").daysInMonth();
    return {
      startOfMonthDay,
      dateCountOfMonth,
      dateCountOfLastMonth
    };
  });
  const selectedDate = computed(() => {
    return props.selectionMode === "dates" ? castArray(props.parsedValue) : [];
  });
  const setDateText = (cell, { count, rowIndex, columnIndex }) => {
    const { startOfMonthDay, dateCountOfMonth, dateCountOfLastMonth } = unref(days);
    const offset = unref(offsetDay);
    if (rowIndex >= 0 && rowIndex <= 1) {
      const numberOfDaysFromPreviousMonth = startOfMonthDay + offset < 0 ? 7 + startOfMonthDay + offset : startOfMonthDay + offset;
      if (columnIndex + rowIndex * 7 >= numberOfDaysFromPreviousMonth) {
        cell.text = count;
        return true;
      } else {
        cell.text = dateCountOfLastMonth - (numberOfDaysFromPreviousMonth - columnIndex % 7) + 1 + rowIndex * 7;
        cell.type = "prev-month";
      }
    } else {
      if (count <= dateCountOfMonth) {
        cell.text = count;
      } else {
        cell.text = count - dateCountOfMonth;
        cell.type = "next-month";
      }
      return true;
    }
    return false;
  };
  const setCellMetadata = (cell, { columnIndex, rowIndex }, count) => {
    const { disabledDate, cellClassName } = props;
    const _selectedDate = unref(selectedDate);
    const shouldIncrement = setDateText(cell, { count, rowIndex, columnIndex });
    const cellDate = cell.dayjs.toDate();
    cell.selected = _selectedDate.find((d) => d.isSame(cell.dayjs, "day"));
    cell.isSelected = !!cell.selected;
    cell.isCurrent = isCurrent(cell);
    cell.disabled = disabledDate == null ? void 0 : disabledDate(cellDate);
    cell.customClass = cellClassName == null ? void 0 : cellClassName(cellDate);
    return shouldIncrement;
  };
  const setRowMetadata = (row) => {
    if (props.selectionMode === "week") {
      const [start, end] = props.showWeekNumber ? [1, 7] : [0, 6];
      const isActive = isWeekActive(row[start + 1]);
      row[start].inRange = isActive;
      row[start].start = isActive;
      row[end].inRange = isActive;
      row[end].end = isActive;
    }
  };
  const rows = computed(() => {
    const { minDate, maxDate, rangeState, showWeekNumber } = props;
    const offset = unref(offsetDay);
    const rows_ = unref(tableRows);
    const dateUnit = "day";
    let count = 1;
    buildPickerTable({ row: 6, column: 7 }, rows_, {
      startDate: minDate,
      columnIndexOffset: showWeekNumber ? 1 : 0,
      nextEndDate: rangeState.endDate || maxDate || rangeState.selecting && minDate || null,
      now: dayjs().locale(unref(lang)).startOf(dateUnit),
      unit: dateUnit,
      relativeDateGetter: (idx) => unref(startDate).add(idx - offset, dateUnit),
      setCellMetadata: (...args) => {
        if (setCellMetadata(...args, count)) {
          count += 1;
        }
      },
      setRowMetadata
    });
    if (showWeekNumber) {
      for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
        if (rows_[rowIndex][1].dayjs) {
          rows_[rowIndex][0] = {
            type: "week",
            text: rows_[rowIndex][1].dayjs.week()
          };
        }
      }
    }
    return rows_;
  });
  watch(() => props.date, async () => {
    var _a;
    if ((_a = unref(tbodyRef)) == null ? void 0 : _a.contains(document.activeElement)) {
      await nextTick();
      await focus();
    }
  });
  const focus = async () => {
    var _a;
    return (_a = unref(currentCellRef)) == null ? void 0 : _a.focus();
  };
  const isCurrent = (cell) => {
    return props.selectionMode === "date" && isNormalDay(cell.type) && cellMatchesDate(cell, props.parsedValue);
  };
  const cellMatchesDate = (cell, date) => {
    if (!date)
      return false;
    return dayjs(date).locale(unref(lang)).isSame(props.date.date(Number(cell.text)), "day");
  };
  const getDateOfCell = (row, column) => {
    const offsetFromStart = row * 7 + (column - (props.showWeekNumber ? 1 : 0)) - unref(offsetDay);
    return unref(startDate).add(offsetFromStart, "day");
  };
  const handleMouseMove = (event) => {
    var _a;
    if (!props.rangeState.selecting)
      return;
    let target = event.target;
    if (target.tagName === "SPAN") {
      target = (_a = target.parentNode) == null ? void 0 : _a.parentNode;
    }
    if (target.tagName === "DIV") {
      target = target.parentNode;
    }
    if (target.tagName !== "TD")
      return;
    const row = target.parentNode.rowIndex - 1;
    const column = target.cellIndex;
    if (unref(rows)[row][column].disabled)
      return;
    if (row !== unref(lastRow) || column !== unref(lastColumn)) {
      lastRow.value = row;
      lastColumn.value = column;
      emit("changerange", {
        selecting: true,
        endDate: getDateOfCell(row, column)
      });
    }
  };
  const isSelectedCell = (cell) => {
    return !unref(hasCurrent) && (cell == null ? void 0 : cell.text) === 1 && isNormalDay(cell.type) || cell.isCurrent;
  };
  const handleFocus = (event) => {
    if (focusWithClick || unref(hasCurrent) || props.selectionMode !== "date")
      return;
    handlePickDate(event, true);
  };
  const handleMouseDown = (event) => {
    const target = event.target.closest("td");
    if (!target)
      return;
    focusWithClick = true;
  };
  const handleMouseUp = (event) => {
    const target = event.target.closest("td");
    if (!target)
      return;
    focusWithClick = false;
  };
  const handleRangePick = (newDate) => {
    if (!props.rangeState.selecting || !props.minDate) {
      emit("pick", { minDate: newDate, maxDate: null });
      emit("select", true);
    } else {
      if (newDate >= props.minDate) {
        emit("pick", { minDate: props.minDate, maxDate: newDate });
      } else {
        emit("pick", { minDate: newDate, maxDate: props.minDate });
      }
      emit("select", false);
    }
  };
  const handleWeekPick = (newDate) => {
    const weekNumber = newDate.week();
    const value = `${newDate.year()}w${weekNumber}`;
    emit("pick", {
      year: newDate.year(),
      week: weekNumber,
      value,
      date: newDate.startOf("week")
    });
  };
  const handleDatesPick = (newDate, selected) => {
    const newValue = selected ? castArray(props.parsedValue).filter((d) => (d == null ? void 0 : d.valueOf()) !== newDate.valueOf()) : castArray(props.parsedValue).concat([newDate]);
    emit("pick", newValue);
  };
  const handlePickDate = (event, isKeyboardMovement = false) => {
    if (props.disabled)
      return;
    const target = event.target.closest("td");
    if (!target)
      return;
    const row = target.parentNode.rowIndex - 1;
    const column = target.cellIndex;
    const cell = unref(rows)[row][column];
    if (cell.disabled || cell.type === "week")
      return;
    const newDate = getDateOfCell(row, column);
    switch (props.selectionMode) {
      case "range": {
        handleRangePick(newDate);
        break;
      }
      case "date": {
        emit("pick", newDate, isKeyboardMovement);
        break;
      }
      case "week": {
        handleWeekPick(newDate);
        break;
      }
      case "dates": {
        handleDatesPick(newDate, !!cell.selected);
        break;
      }
    }
  };
  const isWeekActive = (cell) => {
    if (props.selectionMode !== "week")
      return false;
    let newDate = props.date.startOf("day");
    if (cell.type === "prev-month") {
      newDate = newDate.subtract(1, "month");
    }
    if (cell.type === "next-month") {
      newDate = newDate.add(1, "month");
    }
    newDate = newDate.date(Number.parseInt(cell.text, 10));
    if (props.parsedValue && !isArray$1(props.parsedValue)) {
      const dayOffset = (props.parsedValue.day() - firstDayOfWeek + 7) % 7 - 1;
      const weekDate = props.parsedValue.subtract(dayOffset, "day");
      return weekDate.isSame(newDate, "day");
    }
    return false;
  };
  return {
    WEEKS,
    rows,
    tbodyRef,
    currentCellRef,
    focus,
    isCurrent,
    isWeekActive,
    isSelectedCell,
    handlePickDate,
    handleMouseUp,
    handleMouseDown,
    handleMouseMove,
    handleFocus
  };
};
const useBasicDateTableDOM = (props, {
  isCurrent,
  isWeekActive
}) => {
  const ns = useNamespace("date-table");
  const { t } = useLocale();
  const tableKls = computed(() => [
    ns.b(),
    ns.is("week-mode", props.selectionMode === "week" && !props.disabled)
  ]);
  const tableLabel = computed(() => t("el.datepicker.dateTablePrompt"));
  const getCellClasses = (cell) => {
    const classes = [];
    if (isNormalDay(cell.type) && !cell.disabled) {
      classes.push("available");
      if (cell.type === "today") {
        classes.push("today");
      }
    } else {
      classes.push(cell.type);
    }
    if (isCurrent(cell)) {
      classes.push("current");
    }
    if (cell.inRange && (isNormalDay(cell.type) || props.selectionMode === "week")) {
      classes.push("in-range");
      if (cell.start) {
        classes.push("start-date");
      }
      if (cell.end) {
        classes.push("end-date");
      }
    }
    if (cell.disabled || props.disabled) {
      classes.push("disabled");
    }
    if (cell.selected) {
      classes.push("selected");
    }
    if (cell.customClass) {
      classes.push(cell.customClass);
    }
    return classes.join(" ");
  };
  const getRowKls = (cell) => [
    ns.e("row"),
    { current: isWeekActive(cell) }
  ];
  return {
    tableKls,
    tableLabel,
    weekHeaderClass: ns.e("week-header"),
    getCellClasses,
    getRowKls,
    t
  };
};
const basicCellProps = buildProps({
  cell: {
    type: definePropType(Object)
  }
});
var ElDatePickerCell = defineComponent({
  name: "ElDatePickerCell",
  props: basicCellProps,
  setup(props) {
    const ns = useNamespace("date-table-cell");
    const {
      slots
    } = inject(ROOT_PICKER_INJECTION_KEY);
    return () => {
      const {
        cell
      } = props;
      return renderSlot(slots, "default", {
        ...cell
      }, () => {
        var _a;
        return [createVNode("div", {
          "class": ns.b()
        }, [createVNode("span", {
          "class": ns.e("text")
        }, [(_a = cell == null ? void 0 : cell.renderText) != null ? _a : cell == null ? void 0 : cell.text])])];
      });
    };
  }
});
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "basic-date-table",
  props: basicDateTableProps,
  emits: basicDateTableEmits,
  setup(__props, { expose, emit }) {
    const props = __props;
    const {
      WEEKS,
      rows,
      tbodyRef,
      currentCellRef,
      focus,
      isCurrent,
      isWeekActive,
      isSelectedCell,
      handlePickDate,
      handleMouseUp,
      handleMouseDown,
      handleMouseMove,
      handleFocus
    } = useBasicDateTable(props, emit);
    const { tableLabel, tableKls, getCellClasses, getRowKls, weekHeaderClass, t } = useBasicDateTableDOM(props, {
      isCurrent,
      isWeekActive
    });
    let isUnmounting = false;
    onBeforeUnmount(() => {
      isUnmounting = true;
    });
    expose({
      focus
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("table", {
        "aria-label": unref(tableLabel),
        class: normalizeClass(unref(tableKls)),
        cellspacing: "0",
        cellpadding: "0",
        role: "grid",
        onClick: unref(handlePickDate),
        onMousemove: unref(handleMouseMove),
        onMousedown: unref(handleMouseDown),
        onMouseup: unref(handleMouseUp)
      }, [
        createBaseVNode("tbody", {
          ref_key: "tbodyRef",
          ref: tbodyRef
        }, [
          createBaseVNode("tr", null, [
            _ctx.showWeekNumber ? (openBlock(), createElementBlock("th", {
              key: 0,
              scope: "col",
              class: normalizeClass(unref(weekHeaderClass))
            }, null, 2)) : createCommentVNode("v-if", true),
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(WEEKS), (week, key) => {
              return openBlock(), createElementBlock("th", {
                key,
                "aria-label": unref(t)("el.datepicker.weeksFull." + week),
                scope: "col"
              }, toDisplayString(unref(t)("el.datepicker.weeks." + week)), 9, ["aria-label"]);
            }), 128))
          ]),
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(rows), (row, rowKey) => {
            return openBlock(), createElementBlock("tr", {
              key: rowKey,
              class: normalizeClass(unref(getRowKls)(_ctx.showWeekNumber ? row[2] : row[1]))
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(row, (cell, columnKey) => {
                return openBlock(), createElementBlock("td", {
                  key: `${rowKey}.${columnKey}`,
                  ref_for: true,
                  ref: (el) => !unref(isUnmounting) && unref(isSelectedCell)(cell) && (currentCellRef.value = el),
                  class: normalizeClass(unref(getCellClasses)(cell)),
                  "aria-current": cell.isCurrent ? "date" : void 0,
                  "aria-selected": cell.isCurrent,
                  tabindex: unref(isSelectedCell)(cell) ? 0 : -1,
                  onFocus: unref(handleFocus)
                }, [
                  createVNode(unref(ElDatePickerCell), { cell }, null, 8, ["cell"])
                ], 42, ["aria-current", "aria-selected", "tabindex", "onFocus"]);
              }), 128))
            ], 2);
          }), 128))
        ], 512)
      ], 42, ["aria-label", "onClick", "onMousemove", "onMousedown", "onMouseup"]);
    };
  }
});
var DateTable = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__file", "basic-date-table.vue"]]);
const basicMonthTableProps = buildProps({
  ...datePickerSharedProps,
  selectionMode: selectionModeWithDefault("month")
});
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "basic-month-table",
  props: basicMonthTableProps,
  emits: ["changerange", "pick", "select"],
  setup(__props, { expose, emit }) {
    const props = __props;
    const ns = useNamespace("month-table");
    const { t, lang } = useLocale();
    const tbodyRef = ref();
    const currentCellRef = ref();
    const months = ref(props.date.locale("en").localeData().monthsShort().map((_) => _.toLowerCase()));
    const tableRows = ref([[], [], []]);
    const lastRow = ref();
    const lastColumn = ref();
    const rows = computed(() => {
      var _a, _b, _c;
      const rows2 = tableRows.value;
      const now2 = dayjs().locale(lang.value).startOf("month");
      for (let i = 0; i < 3; i++) {
        const row = rows2[i];
        for (let j = 0; j < 4; j++) {
          const cell = row[j] || (row[j] = {
            row: i,
            column: j,
            type: "normal",
            inRange: false,
            start: false,
            end: false,
            text: -1,
            disabled: false,
            isSelected: false,
            customClass: void 0,
            date: void 0,
            dayjs: void 0,
            isCurrent: void 0,
            selected: void 0,
            renderText: void 0,
            timestamp: void 0
          });
          cell.type = "normal";
          const index = i * 4 + j;
          const calTime = props.date.startOf("year").month(index);
          const calEndDate = props.rangeState.endDate || props.maxDate || props.rangeState.selecting && props.minDate || null;
          cell.inRange = !!(props.minDate && calTime.isSameOrAfter(props.minDate, "month") && calEndDate && calTime.isSameOrBefore(calEndDate, "month")) || !!(props.minDate && calTime.isSameOrBefore(props.minDate, "month") && calEndDate && calTime.isSameOrAfter(calEndDate, "month"));
          if ((_a = props.minDate) == null ? void 0 : _a.isSameOrAfter(calEndDate)) {
            cell.start = !!(calEndDate && calTime.isSame(calEndDate, "month"));
            cell.end = props.minDate && calTime.isSame(props.minDate, "month");
          } else {
            cell.start = !!(props.minDate && calTime.isSame(props.minDate, "month"));
            cell.end = !!(calEndDate && calTime.isSame(calEndDate, "month"));
          }
          const isToday = now2.isSame(calTime);
          if (isToday) {
            cell.type = "today";
          }
          const cellDate = calTime.toDate();
          cell.text = index;
          cell.disabled = ((_b = props.disabledDate) == null ? void 0 : _b.call(props, cellDate)) || false;
          cell.date = cellDate;
          cell.customClass = (_c = props.cellClassName) == null ? void 0 : _c.call(props, cellDate);
          cell.dayjs = calTime;
          cell.timestamp = calTime.valueOf();
          cell.isSelected = isSelectedCell(cell);
        }
      }
      return rows2;
    });
    const focus = () => {
      var _a;
      (_a = currentCellRef.value) == null ? void 0 : _a.focus();
    };
    const getCellStyle = (cell) => {
      const style = {};
      const year = props.date.year();
      const today = /* @__PURE__ */ new Date();
      const month = cell.text;
      style.disabled = props.disabled || (props.disabledDate ? datesInMonth(props.date, year, month, lang.value).every(props.disabledDate) : false);
      style.current = castArray(props.parsedValue).some((date) => dayjs.isDayjs(date) && date.year() === year && date.month() === month);
      style.today = today.getFullYear() === year && today.getMonth() === month;
      if (cell.customClass) {
        style[cell.customClass] = true;
      }
      if (cell.inRange) {
        style["in-range"] = true;
        if (cell.start) {
          style["start-date"] = true;
        }
        if (cell.end) {
          style["end-date"] = true;
        }
      }
      return style;
    };
    const isSelectedCell = (cell) => {
      const year = props.date.year();
      const month = cell.text;
      return castArray(props.date).some((date) => date.year() === year && date.month() === month);
    };
    const handleMouseMove = (event) => {
      var _a;
      if (!props.rangeState.selecting)
        return;
      let target = event.target;
      if (target.tagName === "SPAN") {
        target = (_a = target.parentNode) == null ? void 0 : _a.parentNode;
      }
      if (target.tagName === "DIV") {
        target = target.parentNode;
      }
      if (target.tagName !== "TD")
        return;
      const row = target.parentNode.rowIndex;
      const column = target.cellIndex;
      if (rows.value[row][column].disabled)
        return;
      if (row !== lastRow.value || column !== lastColumn.value) {
        lastRow.value = row;
        lastColumn.value = column;
        emit("changerange", {
          selecting: true,
          endDate: props.date.startOf("year").month(row * 4 + column)
        });
      }
    };
    const handleMonthTableClick = (event) => {
      var _a;
      if (props.disabled)
        return;
      const target = (_a = event.target) == null ? void 0 : _a.closest("td");
      if ((target == null ? void 0 : target.tagName) !== "TD")
        return;
      if (hasClass(target, "disabled"))
        return;
      const column = target.cellIndex;
      const row = target.parentNode.rowIndex;
      const month = row * 4 + column;
      const newDate = props.date.startOf("year").month(month);
      if (props.selectionMode === "months") {
        if (event.type === "keydown") {
          emit("pick", castArray(props.parsedValue), false);
          return;
        }
        const newMonth = getValidDateOfMonth(props.date, props.date.year(), month, lang.value, props.disabledDate);
        const newValue = hasClass(target, "current") ? castArray(props.parsedValue).filter((d) => (d == null ? void 0 : d.year()) !== newMonth.year() || (d == null ? void 0 : d.month()) !== newMonth.month()) : castArray(props.parsedValue).concat([dayjs(newMonth)]);
        emit("pick", newValue);
      } else if (props.selectionMode === "range") {
        if (!props.rangeState.selecting) {
          emit("pick", { minDate: newDate, maxDate: null });
          emit("select", true);
        } else {
          if (props.minDate && newDate >= props.minDate) {
            emit("pick", { minDate: props.minDate, maxDate: newDate });
          } else {
            emit("pick", { minDate: newDate, maxDate: props.minDate });
          }
          emit("select", false);
        }
      } else {
        emit("pick", month);
      }
    };
    watch(() => props.date, async () => {
      var _a, _b;
      if ((_a = tbodyRef.value) == null ? void 0 : _a.contains(document.activeElement)) {
        await nextTick();
        (_b = currentCellRef.value) == null ? void 0 : _b.focus();
      }
    });
    expose({
      focus
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("table", {
        role: "grid",
        "aria-label": unref(t)("el.datepicker.monthTablePrompt"),
        class: normalizeClass(unref(ns).b()),
        onClick: handleMonthTableClick,
        onMousemove: handleMouseMove
      }, [
        createBaseVNode("tbody", {
          ref_key: "tbodyRef",
          ref: tbodyRef
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(rows), (row, key) => {
            return openBlock(), createElementBlock("tr", { key }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(row, (cell, key_) => {
                return openBlock(), createElementBlock("td", {
                  key: key_,
                  ref_for: true,
                  ref: (el) => cell.isSelected && (currentCellRef.value = el),
                  class: normalizeClass(getCellStyle(cell)),
                  "aria-selected": !!cell.isSelected,
                  "aria-label": unref(t)(`el.datepicker.month${+cell.text + 1}`),
                  tabindex: cell.isSelected ? 0 : -1,
                  onKeydown: [
                    withKeys(withModifiers(handleMonthTableClick, ["prevent", "stop"]), ["space"]),
                    withKeys(withModifiers(handleMonthTableClick, ["prevent", "stop"]), ["enter"])
                  ]
                }, [
                  createVNode(unref(ElDatePickerCell), {
                    cell: {
                      ...cell,
                      renderText: unref(t)("el.datepicker.months." + months.value[cell.text])
                    }
                  }, null, 8, ["cell"])
                ], 42, ["aria-selected", "aria-label", "tabindex", "onKeydown"]);
              }), 128))
            ]);
          }), 128))
        ], 512)
      ], 42, ["aria-label"]);
    };
  }
});
var MonthTable = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__file", "basic-month-table.vue"]]);
const basicYearTableProps = buildProps({
  ...datePickerSharedProps,
  selectionMode: selectionModeWithDefault("year")
});
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "basic-year-table",
  props: basicYearTableProps,
  emits: ["changerange", "pick", "select"],
  setup(__props, { expose, emit }) {
    const props = __props;
    const datesInYear = (year, lang2) => {
      const firstDay = dayjs(String(year)).locale(lang2).startOf("year");
      const lastDay = firstDay.endOf("year");
      const numOfDays = lastDay.dayOfYear();
      return rangeArr(numOfDays).map((n) => firstDay.add(n, "day").toDate());
    };
    const ns = useNamespace("year-table");
    const { t, lang } = useLocale();
    const tbodyRef = ref();
    const currentCellRef = ref();
    const startYear = computed(() => {
      return Math.floor(props.date.year() / 10) * 10;
    });
    const tableRows = ref([[], [], []]);
    const lastRow = ref();
    const lastColumn = ref();
    const rows = computed(() => {
      var _a, _b, _c;
      const rows2 = tableRows.value;
      const now2 = dayjs().locale(lang.value).startOf("year");
      for (let i = 0; i < 3; i++) {
        const row = rows2[i];
        for (let j = 0; j < 4; j++) {
          if (i * 4 + j >= 10) {
            break;
          }
          let cell = row[j];
          if (!cell) {
            cell = {
              row: i,
              column: j,
              type: "normal",
              inRange: false,
              start: false,
              end: false,
              text: -1,
              disabled: false,
              isSelected: false,
              customClass: void 0,
              date: void 0,
              dayjs: void 0,
              isCurrent: void 0,
              selected: void 0,
              renderText: void 0,
              timestamp: void 0
            };
          }
          cell.type = "normal";
          const index = i * 4 + j + startYear.value;
          const calTime = dayjs().year(index);
          const calEndDate = props.rangeState.endDate || props.maxDate || props.rangeState.selecting && props.minDate || null;
          cell.inRange = !!(props.minDate && calTime.isSameOrAfter(props.minDate, "year") && calEndDate && calTime.isSameOrBefore(calEndDate, "year")) || !!(props.minDate && calTime.isSameOrBefore(props.minDate, "year") && calEndDate && calTime.isSameOrAfter(calEndDate, "year"));
          if ((_a = props.minDate) == null ? void 0 : _a.isSameOrAfter(calEndDate)) {
            cell.start = !!(calEndDate && calTime.isSame(calEndDate, "year"));
            cell.end = !!(props.minDate && calTime.isSame(props.minDate, "year"));
          } else {
            cell.start = !!(props.minDate && calTime.isSame(props.minDate, "year"));
            cell.end = !!(calEndDate && calTime.isSame(calEndDate, "year"));
          }
          const isToday = now2.isSame(calTime);
          if (isToday) {
            cell.type = "today";
          }
          cell.text = index;
          const cellDate = calTime.toDate();
          cell.disabled = ((_b = props.disabledDate) == null ? void 0 : _b.call(props, cellDate)) || false;
          cell.date = cellDate;
          cell.customClass = (_c = props.cellClassName) == null ? void 0 : _c.call(props, cellDate);
          cell.dayjs = calTime;
          cell.timestamp = calTime.valueOf();
          cell.isSelected = isSelectedCell(cell);
          row[j] = cell;
        }
      }
      return rows2;
    });
    const focus = () => {
      var _a;
      (_a = currentCellRef.value) == null ? void 0 : _a.focus();
    };
    const getCellKls = (cell) => {
      const kls = {};
      const today = dayjs().locale(lang.value);
      const year = cell.text;
      kls.disabled = props.disabled || (props.disabledDate ? datesInYear(year, lang.value).every(props.disabledDate) : false);
      kls.today = today.year() === year;
      kls.current = castArray(props.parsedValue).some((d) => d.year() === year);
      if (cell.customClass) {
        kls[cell.customClass] = true;
      }
      if (cell.inRange) {
        kls["in-range"] = true;
        if (cell.start) {
          kls["start-date"] = true;
        }
        if (cell.end) {
          kls["end-date"] = true;
        }
      }
      return kls;
    };
    const isSelectedCell = (cell) => {
      const year = cell.text;
      return castArray(props.date).some((date) => date.year() === year);
    };
    const handleYearTableClick = (event) => {
      var _a;
      if (props.disabled)
        return;
      const target = (_a = event.target) == null ? void 0 : _a.closest("td");
      if (!target || !target.textContent || hasClass(target, "disabled"))
        return;
      const column = target.cellIndex;
      const row = target.parentNode.rowIndex;
      const selectedYear = row * 4 + column + startYear.value;
      const newDate = dayjs().year(selectedYear);
      if (props.selectionMode === "range") {
        if (!props.rangeState.selecting) {
          emit("pick", { minDate: newDate, maxDate: null });
          emit("select", true);
        } else {
          if (props.minDate && newDate >= props.minDate) {
            emit("pick", { minDate: props.minDate, maxDate: newDate });
          } else {
            emit("pick", { minDate: newDate, maxDate: props.minDate });
          }
          emit("select", false);
        }
      } else if (props.selectionMode === "years") {
        if (event.type === "keydown") {
          emit("pick", castArray(props.parsedValue), false);
          return;
        }
        const vaildYear = getValidDateOfYear(newDate.startOf("year"), lang.value, props.disabledDate);
        const newValue = hasClass(target, "current") ? castArray(props.parsedValue).filter((d) => (d == null ? void 0 : d.year()) !== selectedYear) : castArray(props.parsedValue).concat([vaildYear]);
        emit("pick", newValue);
      } else {
        emit("pick", selectedYear);
      }
    };
    const handleMouseMove = (event) => {
      var _a;
      if (!props.rangeState.selecting)
        return;
      const target = (_a = event.target) == null ? void 0 : _a.closest("td");
      if (!target)
        return;
      const row = target.parentNode.rowIndex;
      const column = target.cellIndex;
      if (rows.value[row][column].disabled)
        return;
      if (row !== lastRow.value || column !== lastColumn.value) {
        lastRow.value = row;
        lastColumn.value = column;
        emit("changerange", {
          selecting: true,
          endDate: dayjs().year(startYear.value).add(row * 4 + column, "year")
        });
      }
    };
    watch(() => props.date, async () => {
      var _a, _b;
      if ((_a = tbodyRef.value) == null ? void 0 : _a.contains(document.activeElement)) {
        await nextTick();
        (_b = currentCellRef.value) == null ? void 0 : _b.focus();
      }
    });
    expose({
      focus
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("table", {
        role: "grid",
        "aria-label": unref(t)("el.datepicker.yearTablePrompt"),
        class: normalizeClass(unref(ns).b()),
        onClick: handleYearTableClick,
        onMousemove: handleMouseMove
      }, [
        createBaseVNode("tbody", {
          ref_key: "tbodyRef",
          ref: tbodyRef
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(rows), (row, rowKey) => {
            return openBlock(), createElementBlock("tr", { key: rowKey }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(row, (cell, cellKey) => {
                return openBlock(), createElementBlock("td", {
                  key: `${rowKey}_${cellKey}`,
                  ref_for: true,
                  ref: (el) => cell.isSelected && (currentCellRef.value = el),
                  class: normalizeClass(["available", getCellKls(cell)]),
                  "aria-selected": cell.isSelected,
                  "aria-label": String(cell.text),
                  tabindex: cell.isSelected ? 0 : -1,
                  onKeydown: [
                    withKeys(withModifiers(handleYearTableClick, ["prevent", "stop"]), ["space"]),
                    withKeys(withModifiers(handleYearTableClick, ["prevent", "stop"]), ["enter"])
                  ]
                }, [
                  createVNode(unref(ElDatePickerCell), { cell }, null, 8, ["cell"])
                ], 42, ["aria-selected", "aria-label", "tabindex", "onKeydown"]);
              }), 128))
            ]);
          }), 128))
        ], 512)
      ], 42, ["aria-label"]);
    };
  }
});
var YearTable = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__file", "basic-year-table.vue"]]);
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "panel-date-pick",
  props: panelDatePickProps,
  emits: ["pick", "set-picker-option", "panel-change"],
  setup(__props, { emit: contextEmit }) {
    const props = __props;
    const timeWithinRange = (_, __, ___) => true;
    const ppNs = useNamespace("picker-panel");
    const dpNs = useNamespace("date-picker");
    const attrs = useAttrs$1();
    const slots = useSlots();
    const { t, lang } = useLocale();
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const isDefaultFormat = inject(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, void 0);
    const { shortcuts, disabledDate, cellClassName, defaultTime } = pickerBase.props;
    const defaultValue = toRef(pickerBase.props, "defaultValue");
    const currentViewRef = ref();
    const innerDate = ref(dayjs().locale(lang.value));
    const isChangeToNow = ref(false);
    let isShortcut = false;
    const defaultTimeD = computed(() => {
      return dayjs(defaultTime).locale(lang.value);
    });
    const month = computed(() => {
      return innerDate.value.month();
    });
    const year = computed(() => {
      return innerDate.value.year();
    });
    const selectableRange = ref([]);
    const userInputDate = ref(null);
    const userInputTime = ref(null);
    const checkDateWithinRange = (date) => {
      return selectableRange.value.length > 0 ? timeWithinRange(date, selectableRange.value, props.format || "HH:mm:ss") : true;
    };
    const formatEmit = (emitDayjs) => {
      if (defaultTime && !visibleTime.value && !isChangeToNow.value && !isShortcut) {
        return defaultTimeD.value.year(emitDayjs.year()).month(emitDayjs.month()).date(emitDayjs.date());
      }
      if (showTime.value)
        return emitDayjs.millisecond(0);
      return emitDayjs.startOf("day");
    };
    const emit = (value, ...args) => {
      if (!value) {
        contextEmit("pick", value, ...args);
      } else if (isArray$1(value)) {
        const dates = value.map(formatEmit);
        contextEmit("pick", dates, ...args);
      } else {
        contextEmit("pick", formatEmit(value), ...args);
      }
      userInputDate.value = null;
      userInputTime.value = null;
      isChangeToNow.value = false;
      isShortcut = false;
    };
    const handleDatePick = async (value, keepOpen) => {
      if (selectionMode.value === "date" && dayjs.isDayjs(value)) {
        const parsedDateValue = extractFirst(props.parsedValue);
        let newDate = parsedDateValue ? parsedDateValue.year(value.year()).month(value.month()).date(value.date()) : value;
        if (!checkDateWithinRange(newDate)) ;
        innerDate.value = newDate;
        emit(newDate, showTime.value || keepOpen);
      } else if (selectionMode.value === "week") {
        emit(value.date);
      } else if (selectionMode.value === "dates") {
        emit(value, true);
      }
    };
    const moveByMonth = (forward) => {
      const action = forward ? "add" : "subtract";
      innerDate.value = innerDate.value[action](1, "month");
      handlePanelChange("month");
    };
    const moveByYear = (forward) => {
      const currentDate = innerDate.value;
      const action = forward ? "add" : "subtract";
      innerDate.value = currentView.value === "year" ? currentDate[action](10, "year") : currentDate[action](1, "year");
      handlePanelChange("year");
    };
    const currentView = ref("date");
    const yearLabel = computed(() => {
      const yearTranslation = t("el.datepicker.year");
      if (currentView.value === "year") {
        const startYear = Math.floor(year.value / 10) * 10;
        if (yearTranslation) {
          return `${startYear} ${yearTranslation} - ${startYear + 9} ${yearTranslation}`;
        }
        return `${startYear} - ${startYear + 9}`;
      }
      return `${year.value} ${yearTranslation}`;
    });
    const handleShortcutClick = (shortcut) => {
      const shortcutValue = isFunction(shortcut.value) ? shortcut.value() : shortcut.value;
      if (shortcutValue) {
        isShortcut = true;
        emit(dayjs(shortcutValue).locale(lang.value));
        return;
      }
      if (shortcut.onClick) {
        shortcut.onClick({
          attrs,
          slots,
          emit: contextEmit
        });
      }
    };
    const selectionMode = computed(() => {
      const { type } = props;
      if (["week", "month", "months", "year", "years", "dates"].includes(type))
        return type;
      return "date";
    });
    const isMultipleType = computed(() => {
      return selectionMode.value === "dates" || selectionMode.value === "months" || selectionMode.value === "years";
    });
    const keyboardMode = computed(() => {
      return selectionMode.value === "date" ? currentView.value : selectionMode.value;
    });
    const hasShortcuts = computed(() => !!shortcuts.length);
    const handleMonthPick = async (month2, keepOpen) => {
      if (selectionMode.value === "month") {
        innerDate.value = getValidDateOfMonth(innerDate.value, innerDate.value.year(), month2, lang.value, disabledDate);
        emit(innerDate.value, false);
      } else if (selectionMode.value === "months") {
        emit(month2, keepOpen != null ? keepOpen : true);
      } else {
        innerDate.value = getValidDateOfMonth(innerDate.value, innerDate.value.year(), month2, lang.value, disabledDate);
        currentView.value = "date";
        if (["month", "year", "date", "week"].includes(selectionMode.value)) {
          emit(innerDate.value, true);
          await nextTick();
          handleFocusPicker();
        }
      }
      handlePanelChange("month");
    };
    const handleYearPick = async (year2, keepOpen) => {
      if (selectionMode.value === "year") {
        const data = innerDate.value.startOf("year").year(year2);
        innerDate.value = getValidDateOfYear(data, lang.value, disabledDate);
        emit(innerDate.value, false);
      } else if (selectionMode.value === "years") {
        emit(year2, keepOpen != null ? keepOpen : true);
      } else {
        const data = innerDate.value.year(year2);
        innerDate.value = getValidDateOfYear(data, lang.value, disabledDate);
        currentView.value = "month";
        if (["month", "year", "date", "week"].includes(selectionMode.value)) {
          emit(innerDate.value, true);
          await nextTick();
          handleFocusPicker();
        }
      }
      handlePanelChange("year");
    };
    const showPicker = async (view) => {
      if (props.disabled)
        return;
      currentView.value = view;
      await nextTick();
      handleFocusPicker();
    };
    const showTime = computed(() => props.type === "datetime" || props.type === "datetimerange");
    const footerVisible = computed(() => {
      const showDateFooter = showTime.value || selectionMode.value === "dates";
      const showYearFooter = selectionMode.value === "years";
      const showMonthFooter = selectionMode.value === "months";
      const isDateView = currentView.value === "date";
      const isYearView = currentView.value === "year";
      const isMonthView = currentView.value === "month";
      return showDateFooter && isDateView || showYearFooter && isYearView || showMonthFooter && isMonthView;
    });
    const footerFilled = computed(() => !isMultipleType.value && props.showNow || props.showConfirm);
    const disabledConfirm = computed(() => {
      if (!disabledDate)
        return false;
      if (!props.parsedValue)
        return true;
      if (isArray$1(props.parsedValue)) {
        return disabledDate(props.parsedValue[0].toDate());
      }
      return disabledDate(props.parsedValue.toDate());
    });
    const onConfirm = () => {
      if (isMultipleType.value) {
        emit(props.parsedValue);
      } else {
        let result = extractFirst(props.parsedValue);
        if (!result) {
          const defaultTimeD2 = dayjs(defaultTime).locale(lang.value);
          const defaultValueD = getDefaultValue2();
          result = defaultTimeD2.year(defaultValueD.year()).month(defaultValueD.month()).date(defaultValueD.date());
        }
        innerDate.value = result;
        emit(result);
      }
    };
    const disabledNow = computed(() => {
      if (!disabledDate)
        return false;
      return disabledDate(dayjs().locale(lang.value).toDate());
    });
    const changeToNow = () => {
      const now2 = dayjs().locale(lang.value);
      const nowDate = now2.toDate();
      isChangeToNow.value = true;
      if ((!disabledDate || !disabledDate(nowDate)) && checkDateWithinRange(nowDate)) {
        innerDate.value = dayjs().locale(lang.value);
        emit(innerDate.value);
      }
    };
    const timeFormat = computed(() => {
      return props.timeFormat || extractTimeFormat(props.format) || DEFAULT_FORMATS_TIME;
    });
    const dateFormat = computed(() => {
      return props.dateFormat || extractDateFormat(props.format) || DEFAULT_FORMATS_DATE;
    });
    const visibleTime = computed(() => {
      if (userInputTime.value)
        return userInputTime.value;
      if (!props.parsedValue && !defaultValue.value)
        return;
      const dateValue = extractFirst(props.parsedValue) || innerDate.value;
      return dateValue.format(timeFormat.value);
    });
    const visibleDate = computed(() => {
      if (userInputDate.value)
        return userInputDate.value;
      if (!props.parsedValue && !defaultValue.value)
        return;
      const dateValue = extractFirst(props.parsedValue) || innerDate.value;
      return dateValue.format(dateFormat.value);
    });
    const timePickerVisible = ref(false);
    const onTimePickerInputFocus = () => {
      timePickerVisible.value = true;
    };
    const handleTimePickClose = () => {
      timePickerVisible.value = false;
    };
    const getUnits = (date) => {
      return {
        hour: date.hour(),
        minute: date.minute(),
        second: date.second(),
        year: date.year(),
        month: date.month(),
        date: date.date()
      };
    };
    const handleTimePick = (value, visible, first) => {
      const { hour, minute, second } = getUnits(value);
      const parsedDateValue = extractFirst(props.parsedValue);
      const newDate = parsedDateValue ? parsedDateValue.hour(hour).minute(minute).second(second) : value;
      innerDate.value = newDate;
      emit(innerDate.value, true);
      if (!first) {
        timePickerVisible.value = visible;
      }
    };
    const handleVisibleTimeChange = (value) => {
      const newDate = dayjs(value, timeFormat.value).locale(lang.value);
      if (newDate.isValid() && checkDateWithinRange(newDate)) {
        const { year: year2, month: month2, date } = getUnits(innerDate.value);
        innerDate.value = newDate.year(year2).month(month2).date(date);
        userInputTime.value = null;
        timePickerVisible.value = false;
        emit(innerDate.value, true);
      }
    };
    const handleVisibleDateChange = (value) => {
      const newDate = correctlyParseUserInput(value, dateFormat.value, lang.value, isDefaultFormat);
      if (newDate.isValid()) {
        if (disabledDate && disabledDate(newDate.toDate())) {
          return;
        }
        const { hour, minute, second } = getUnits(innerDate.value);
        innerDate.value = newDate.hour(hour).minute(minute).second(second);
        userInputDate.value = null;
        emit(innerDate.value, true);
      }
    };
    const isValidValue = (date) => {
      return dayjs.isDayjs(date) && date.isValid() && (disabledDate ? !disabledDate(date.toDate()) : true);
    };
    const parseUserInput = (value) => {
      return correctlyParseUserInput(value, props.format, lang.value, isDefaultFormat);
    };
    const getDefaultValue2 = () => {
      const parseDate2 = dayjs(defaultValue.value).locale(lang.value);
      if (!defaultValue.value) {
        const defaultTimeDValue = defaultTimeD.value;
        return dayjs().hour(defaultTimeDValue.hour()).minute(defaultTimeDValue.minute()).second(defaultTimeDValue.second()).locale(lang.value);
      }
      return parseDate2;
    };
    const handleFocusPicker = () => {
      var _a;
      if (["week", "month", "year", "date"].includes(selectionMode.value)) {
        (_a = currentViewRef.value) == null ? void 0 : _a.focus();
      }
    };
    const _handleFocusPicker = () => {
      handleFocusPicker();
      if (selectionMode.value === "week") {
        handleKeyControl(EVENT_CODE.down);
      }
    };
    const handleKeydownTable = (event) => {
      const code = getEventCode(event);
      const validCode = [
        EVENT_CODE.up,
        EVENT_CODE.down,
        EVENT_CODE.left,
        EVENT_CODE.right,
        EVENT_CODE.home,
        EVENT_CODE.end,
        EVENT_CODE.pageUp,
        EVENT_CODE.pageDown
      ];
      if (validCode.includes(code)) {
        handleKeyControl(code);
        event.stopPropagation();
        event.preventDefault();
      }
      if ([EVENT_CODE.enter, EVENT_CODE.space, EVENT_CODE.numpadEnter].includes(code) && userInputDate.value === null && userInputTime.value === null) {
        event.preventDefault();
        emit(innerDate.value, false);
      }
    };
    const handleKeyControl = (code) => {
      var _a;
      const { up, down, left, right, home, end, pageUp, pageDown } = EVENT_CODE;
      const mapping = {
        year: {
          [up]: -4,
          [down]: 4,
          [left]: -1,
          [right]: 1,
          offset: (date, step2) => date.setFullYear(date.getFullYear() + step2)
        },
        month: {
          [up]: -4,
          [down]: 4,
          [left]: -1,
          [right]: 1,
          offset: (date, step2) => date.setMonth(date.getMonth() + step2)
        },
        week: {
          [up]: -1,
          [down]: 1,
          [left]: -1,
          [right]: 1,
          offset: (date, step2) => date.setDate(date.getDate() + step2 * 7)
        },
        date: {
          [up]: -7,
          [down]: 7,
          [left]: -1,
          [right]: 1,
          [home]: (date) => -date.getDay(),
          [end]: (date) => -date.getDay() + 6,
          [pageUp]: (date) => -new Date(date.getFullYear(), date.getMonth(), 0).getDate(),
          [pageDown]: (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
          offset: (date, step2) => date.setDate(date.getDate() + step2)
        }
      };
      const newDate = innerDate.value.toDate();
      while (Math.abs(innerDate.value.diff(newDate, "year", true)) < 1) {
        const map = mapping[keyboardMode.value];
        if (!map)
          return;
        map.offset(newDate, isFunction(map[code]) ? map[code](newDate) : (_a = map[code]) != null ? _a : 0);
        if (disabledDate && disabledDate(newDate)) {
          break;
        }
        const result = dayjs(newDate).locale(lang.value);
        innerDate.value = result;
        contextEmit("pick", result, true);
        break;
      }
    };
    const handlePanelChange = (mode) => {
      contextEmit("panel-change", innerDate.value.toDate(), mode, currentView.value);
    };
    watch(() => selectionMode.value, (val) => {
      if (["month", "year"].includes(val)) {
        currentView.value = val;
        return;
      } else if (val === "years") {
        currentView.value = "year";
        return;
      } else if (val === "months") {
        currentView.value = "month";
        return;
      }
      currentView.value = "date";
    }, { immediate: true });
    watch(() => defaultValue.value, (val) => {
      if (val) {
        innerDate.value = getDefaultValue2();
      }
    }, { immediate: true });
    watch(() => props.parsedValue, (val) => {
      if (val) {
        if (isMultipleType.value)
          return;
        if (isArray$1(val))
          return;
        innerDate.value = val;
      } else {
        innerDate.value = getDefaultValue2();
      }
    }, { immediate: true });
    contextEmit("set-picker-option", ["isValidValue", isValidValue]);
    contextEmit("set-picker-option", ["parseUserInput", parseUserInput]);
    contextEmit("set-picker-option", ["handleFocusPicker", _handleFocusPicker]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([
          unref(ppNs).b(),
          unref(dpNs).b(),
          unref(ppNs).is("border", _ctx.border),
          unref(ppNs).is("disabled", _ctx.disabled),
          {
            "has-sidebar": _ctx.$slots.sidebar || unref(hasShortcuts),
            "has-time": unref(showTime)
          }
        ])
      }, [
        createBaseVNode("div", {
          class: normalizeClass(unref(ppNs).e("body-wrapper"))
        }, [
          renderSlot(_ctx.$slots, "sidebar", {
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }),
          unref(hasShortcuts) ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(shortcuts), (shortcut, key) => {
              return openBlock(), createElementBlock("button", {
                key,
                type: "button",
                disabled: _ctx.disabled,
                class: normalizeClass(unref(ppNs).e("shortcut")),
                onClick: ($event) => handleShortcutClick(shortcut)
              }, toDisplayString(shortcut.text), 11, ["disabled", "onClick"]);
            }), 128))
          ], 2)) : createCommentVNode("v-if", true),
          createBaseVNode("div", {
            class: normalizeClass(unref(ppNs).e("body"))
          }, [
            unref(showTime) ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: normalizeClass(unref(dpNs).e("time-header"))
            }, [
              createBaseVNode("span", {
                class: normalizeClass(unref(dpNs).e("editor-wrap"))
              }, [
                createVNode(unref(ElInput), {
                  placeholder: unref(t)("el.datepicker.selectDate"),
                  "model-value": unref(visibleDate),
                  size: "small",
                  "validate-event": false,
                  disabled: _ctx.disabled,
                  onInput: (val) => userInputDate.value = val,
                  onChange: handleVisibleDateChange
                }, null, 8, ["placeholder", "model-value", "disabled", "onInput"])
              ], 2),
              withDirectives((openBlock(), createElementBlock("span", {
                class: normalizeClass(unref(dpNs).e("editor-wrap"))
              }, [
                createVNode(unref(ElInput), {
                  placeholder: unref(t)("el.datepicker.selectTime"),
                  "model-value": unref(visibleTime),
                  size: "small",
                  "validate-event": false,
                  disabled: _ctx.disabled,
                  onFocus: onTimePickerInputFocus,
                  onInput: (val) => userInputTime.value = val,
                  onChange: handleVisibleTimeChange
                }, null, 8, ["placeholder", "model-value", "disabled", "onInput"]),
                createVNode(unref(TimePickPanel), {
                  visible: timePickerVisible.value,
                  format: unref(timeFormat),
                  "parsed-value": innerDate.value,
                  onPick: handleTimePick
                }, null, 8, ["visible", "format", "parsed-value"])
              ], 2)), [
                [unref(ClickOutside), handleTimePickClose]
              ])
            ], 2)) : createCommentVNode("v-if", true),
            withDirectives(createBaseVNode("div", {
              class: normalizeClass([
                unref(dpNs).e("header"),
                (currentView.value === "year" || currentView.value === "month") && unref(dpNs).em("header", "bordered")
              ])
            }, [
              createBaseVNode("span", {
                class: normalizeClass(unref(dpNs).e("prev-btn"))
              }, [
                createBaseVNode("button", {
                  type: "button",
                  "aria-label": unref(t)(`el.datepicker.prevYear`),
                  class: normalizeClass(["d-arrow-left", unref(ppNs).e("icon-btn")]),
                  disabled: _ctx.disabled,
                  onClick: ($event) => moveByYear(false)
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled", "onClick"]),
                withDirectives(createBaseVNode("button", {
                  type: "button",
                  "aria-label": unref(t)(`el.datepicker.prevMonth`),
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "arrow-left"]),
                  disabled: _ctx.disabled,
                  onClick: ($event) => moveByMonth(false)
                }, [
                  renderSlot(_ctx.$slots, "prev-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled", "onClick"]), [
                  [vShow, currentView.value === "date"]
                ])
              ], 2),
              createBaseVNode("span", {
                role: "button",
                class: normalizeClass(unref(dpNs).e("header-label")),
                "aria-live": "polite",
                tabindex: "0",
                onKeydown: withKeys(($event) => showPicker("year"), ["enter"]),
                onClick: ($event) => showPicker("year")
              }, toDisplayString(unref(yearLabel)), 43, ["onKeydown", "onClick"]),
              withDirectives(createBaseVNode("span", {
                role: "button",
                "aria-live": "polite",
                tabindex: "0",
                class: normalizeClass([
                  unref(dpNs).e("header-label"),
                  { active: currentView.value === "month" }
                ]),
                onKeydown: withKeys(($event) => showPicker("month"), ["enter"]),
                onClick: ($event) => showPicker("month")
              }, toDisplayString(unref(t)(`el.datepicker.month${unref(month) + 1}`)), 43, ["onKeydown", "onClick"]), [
                [vShow, currentView.value === "date"]
              ]),
              createBaseVNode("span", {
                class: normalizeClass(unref(dpNs).e("next-btn"))
              }, [
                withDirectives(createBaseVNode("button", {
                  type: "button",
                  "aria-label": unref(t)(`el.datepicker.nextMonth`),
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "arrow-right"]),
                  disabled: _ctx.disabled,
                  onClick: ($event) => moveByMonth(true)
                }, [
                  renderSlot(_ctx.$slots, "next-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled", "onClick"]), [
                  [vShow, currentView.value === "date"]
                ]),
                createBaseVNode("button", {
                  type: "button",
                  "aria-label": unref(t)(`el.datepicker.nextYear`),
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-right"]),
                  disabled: _ctx.disabled,
                  onClick: ($event) => moveByYear(true)
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled", "onClick"])
              ], 2)
            ], 2), [
              [vShow, currentView.value !== "time"]
            ]),
            createBaseVNode("div", {
              class: normalizeClass(unref(ppNs).e("content")),
              onKeydown: handleKeydownTable
            }, [
              currentView.value === "date" ? (openBlock(), createBlock(DateTable, {
                key: 0,
                ref_key: "currentViewRef",
                ref: currentViewRef,
                "selection-mode": unref(selectionMode),
                date: innerDate.value,
                "parsed-value": _ctx.parsedValue,
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                "show-week-number": _ctx.showWeekNumber,
                onPick: handleDatePick
              }, null, 8, ["selection-mode", "date", "parsed-value", "disabled-date", "disabled", "cell-class-name", "show-week-number"])) : createCommentVNode("v-if", true),
              currentView.value === "year" ? (openBlock(), createBlock(YearTable, {
                key: 1,
                ref_key: "currentViewRef",
                ref: currentViewRef,
                "selection-mode": unref(selectionMode),
                date: innerDate.value,
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "parsed-value": _ctx.parsedValue,
                "cell-class-name": unref(cellClassName),
                onPick: handleYearPick
              }, null, 8, ["selection-mode", "date", "disabled-date", "disabled", "parsed-value", "cell-class-name"])) : createCommentVNode("v-if", true),
              currentView.value === "month" ? (openBlock(), createBlock(MonthTable, {
                key: 2,
                ref_key: "currentViewRef",
                ref: currentViewRef,
                "selection-mode": unref(selectionMode),
                date: innerDate.value,
                "parsed-value": _ctx.parsedValue,
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                onPick: handleMonthPick
              }, null, 8, ["selection-mode", "date", "parsed-value", "disabled-date", "disabled", "cell-class-name"])) : createCommentVNode("v-if", true)
            ], 34)
          ], 2)
        ], 2),
        _ctx.showFooter && unref(footerVisible) && unref(footerFilled) ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ppNs).e("footer"))
        }, [
          withDirectives(createVNode(unref(ElButton), {
            text: "",
            size: "small",
            class: normalizeClass(unref(ppNs).e("link-btn")),
            disabled: unref(disabledNow),
            onClick: changeToNow
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("el.datepicker.now")), 1)
            ]),
            _: 1
          }, 8, ["class", "disabled"]), [
            [vShow, !unref(isMultipleType) && _ctx.showNow]
          ]),
          _ctx.showConfirm ? (openBlock(), createBlock(unref(ElButton), {
            key: 0,
            plain: "",
            size: "small",
            class: normalizeClass(unref(ppNs).e("link-btn")),
            disabled: unref(disabledConfirm),
            onClick: onConfirm
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("el.datepicker.confirm")), 1)
            ]),
            _: 1
          }, 8, ["class", "disabled"])) : createCommentVNode("v-if", true)
        ], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var DatePickPanel = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__file", "panel-date-pick.vue"]]);
const panelDateRangeProps = buildProps({
  ...panelSharedProps,
  ...panelRangeSharedProps
});
const useShortcut = (lang) => {
  const { emit } = getCurrentInstance();
  const attrs = useAttrs$1();
  const slots = useSlots();
  const handleShortcutClick = (shortcut) => {
    const shortcutValues = isFunction(shortcut.value) ? shortcut.value() : shortcut.value;
    if (shortcutValues) {
      emit("pick", [
        dayjs(shortcutValues[0]).locale(lang.value),
        dayjs(shortcutValues[1]).locale(lang.value)
      ]);
      return;
    }
    if (shortcut.onClick) {
      shortcut.onClick({
        attrs,
        slots,
        emit
      });
    }
  };
  return handleShortcutClick;
};
const useRangePicker = (props, {
  defaultValue,
  defaultTime,
  leftDate,
  rightDate,
  step: step2,
  unit: unit2,
  sortDates
}) => {
  const { emit } = getCurrentInstance();
  const { pickerNs } = inject(ROOT_PICKER_INJECTION_KEY);
  const drpNs = useNamespace("date-range-picker");
  const { t, lang } = useLocale();
  const handleShortcutClick = useShortcut(lang);
  const minDate = ref();
  const maxDate = ref();
  const rangeState = ref({
    endDate: null,
    selecting: false
  });
  const handleChangeRange = (val) => {
    rangeState.value = val;
  };
  const handleRangeConfirm = (visible = false) => {
    const _minDate = unref(minDate);
    const _maxDate = unref(maxDate);
    if (isValidRange([_minDate, _maxDate])) {
      emit("pick", [_minDate, _maxDate], visible);
    }
  };
  const onSelect = (selecting) => {
    rangeState.value.selecting = selecting;
    if (!selecting) {
      rangeState.value.endDate = null;
    }
  };
  const parseValue = (parsedValue) => {
    if (isArray$1(parsedValue) && parsedValue.length === 2) {
      const [start, end] = parsedValue;
      minDate.value = start;
      leftDate.value = start;
      maxDate.value = end;
      sortDates(unref(minDate), unref(maxDate));
    } else {
      restoreDefault();
    }
  };
  const restoreDefault = () => {
    let [start, end] = getDefaultValue(unref(defaultValue), {
      lang: unref(lang),
      step: step2,
      unit: unit2,
      unlinkPanels: props.unlinkPanels
    });
    const getShift = (day) => {
      return day.diff(day.startOf("d"), "ms");
    };
    const maybeTimes = unref(defaultTime);
    if (maybeTimes) {
      let leftShift = 0;
      let rightShift = 0;
      if (isArray$1(maybeTimes)) {
        const [timeStart, timeEnd] = maybeTimes.map(dayjs);
        leftShift = getShift(timeStart);
        rightShift = getShift(timeEnd);
      } else {
        const shift = getShift(dayjs(maybeTimes));
        leftShift = shift;
        rightShift = shift;
      }
      start = start.startOf("d").add(leftShift, "ms");
      end = end.startOf("d").add(rightShift, "ms");
    }
    minDate.value = void 0;
    maxDate.value = void 0;
    leftDate.value = start;
    rightDate.value = end;
  };
  watch(defaultValue, (val) => {
    if (val) {
      restoreDefault();
    }
  }, { immediate: true });
  watch(() => props.parsedValue, (parsedValue) => {
    if (!(parsedValue == null ? void 0 : parsedValue.length) || !isEqual(parsedValue, [minDate.value, maxDate.value])) {
      parseValue(parsedValue);
    }
  }, {
    immediate: true
  });
  watch(() => props.visible, () => {
    if (props.visible) {
      parseValue(props.parsedValue);
    }
  }, { immediate: true });
  return {
    minDate,
    maxDate,
    rangeState,
    lang,
    ppNs: pickerNs,
    drpNs,
    handleChangeRange,
    handleRangeConfirm,
    handleShortcutClick,
    onSelect,
    parseValue,
    t
  };
};
const usePanelDateRange = (props, emit, leftDate, rightDate) => {
  const leftCurrentView = ref("date");
  const leftCurrentViewRef = ref();
  const rightCurrentView = ref("date");
  const rightCurrentViewRef = ref();
  const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
  const { disabledDate } = pickerBase.props;
  const { t, lang } = useLocale();
  const leftYear = computed(() => {
    return leftDate.value.year();
  });
  const leftMonth = computed(() => {
    return leftDate.value.month();
  });
  const rightYear = computed(() => {
    return rightDate.value.year();
  });
  const rightMonth = computed(() => {
    return rightDate.value.month();
  });
  function computedYearLabel(currentView, yearValue) {
    const yearTranslation = t("el.datepicker.year");
    if (currentView.value === "year") {
      const startYear = Math.floor(yearValue.value / 10) * 10;
      return yearTranslation ? `${startYear} ${yearTranslation} - ${startYear + 9} ${yearTranslation}` : `${startYear} - ${startYear + 9}`;
    }
    return `${yearValue.value} ${yearTranslation}`;
  }
  function focusPicker(currentViewRef) {
    currentViewRef == null ? void 0 : currentViewRef.focus();
  }
  async function showPicker(pickerType, view) {
    if (props.disabled)
      return;
    const currentView = pickerType === "left" ? leftCurrentView : rightCurrentView;
    const currentViewRef = pickerType === "left" ? leftCurrentViewRef : rightCurrentViewRef;
    currentView.value = view;
    await nextTick();
    focusPicker(currentViewRef.value);
  }
  async function handlePick(mode, pickerType, value) {
    if (props.disabled)
      return;
    const isLeftPicker = pickerType === "left";
    const startDate = isLeftPicker ? leftDate : rightDate;
    const endDate = isLeftPicker ? rightDate : leftDate;
    const currentView = isLeftPicker ? leftCurrentView : rightCurrentView;
    const currentViewRef = isLeftPicker ? leftCurrentViewRef : rightCurrentViewRef;
    if (mode === "year") {
      const data = startDate.value.year(value);
      startDate.value = getValidDateOfYear(data, lang.value, disabledDate);
    }
    if (mode === "month") {
      startDate.value = getValidDateOfMonth(startDate.value, startDate.value.year(), value, lang.value, disabledDate);
    }
    if (!props.unlinkPanels) {
      endDate.value = pickerType === "left" ? startDate.value.add(1, "month") : startDate.value.subtract(1, "month");
    }
    currentView.value = mode === "year" ? "month" : "date";
    await nextTick();
    focusPicker(currentViewRef.value);
    handlePanelChange(mode);
  }
  function handlePanelChange(mode) {
    emit("panel-change", [leftDate.value.toDate(), rightDate.value.toDate()], mode);
  }
  function adjustDateByView(currentView, date, forward) {
    const action = forward ? "add" : "subtract";
    return currentView === "year" ? date[action](10, "year") : date[action](1, "year");
  }
  return {
    leftCurrentView,
    rightCurrentView,
    leftCurrentViewRef,
    rightCurrentViewRef,
    leftYear,
    rightYear,
    leftMonth,
    rightMonth,
    leftYearLabel: computed(() => computedYearLabel(leftCurrentView, leftYear)),
    rightYearLabel: computed(() => computedYearLabel(rightCurrentView, rightYear)),
    showLeftPicker: (view) => showPicker("left", view),
    showRightPicker: (view) => showPicker("right", view),
    handleLeftYearPick: (year) => handlePick("year", "left", year),
    handleRightYearPick: (year) => handlePick("year", "right", year),
    handleLeftMonthPick: (month) => handlePick("month", "left", month),
    handleRightMonthPick: (month) => handlePick("month", "right", month),
    handlePanelChange,
    adjustDateByView
  };
};
const unit$2 = "month";
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "panel-date-range",
  props: panelDateRangeProps,
  emits: [
    "pick",
    "set-picker-option",
    "calendar-change",
    "panel-change"
  ],
  setup(__props, { emit }) {
    const props = __props;
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const isDefaultFormat = inject(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, void 0);
    const { disabledDate, cellClassName, defaultTime, clearable } = pickerBase.props;
    const format = toRef(pickerBase.props, "format");
    const shortcuts = toRef(pickerBase.props, "shortcuts");
    const defaultValue = toRef(pickerBase.props, "defaultValue");
    const { lang } = useLocale();
    const leftDate = ref(dayjs().locale(lang.value));
    const rightDate = ref(dayjs().locale(lang.value).add(1, unit$2));
    const {
      minDate,
      maxDate,
      rangeState,
      ppNs,
      drpNs,
      handleChangeRange,
      handleRangeConfirm,
      handleShortcutClick,
      onSelect,
      parseValue,
      t
    } = useRangePicker(props, {
      defaultValue,
      defaultTime,
      leftDate,
      rightDate,
      unit: unit$2,
      sortDates
    });
    watch(() => props.visible, (visible) => {
      if (!visible && rangeState.value.selecting) {
        parseValue(props.parsedValue);
        onSelect(false);
      }
    });
    const dateUserInput = ref({
      min: null,
      max: null
    });
    const timeUserInput = ref({
      min: null,
      max: null
    });
    const {
      leftCurrentView,
      rightCurrentView,
      leftCurrentViewRef,
      rightCurrentViewRef,
      leftYear,
      rightYear,
      leftMonth,
      rightMonth,
      leftYearLabel,
      rightYearLabel,
      showLeftPicker,
      showRightPicker,
      handleLeftYearPick,
      handleRightYearPick,
      handleLeftMonthPick,
      handleRightMonthPick,
      handlePanelChange,
      adjustDateByView
    } = usePanelDateRange(props, emit, leftDate, rightDate);
    const hasShortcuts = computed(() => !!shortcuts.value.length);
    const minVisibleDate = computed(() => {
      if (dateUserInput.value.min !== null)
        return dateUserInput.value.min;
      if (minDate.value)
        return minDate.value.format(dateFormat.value);
      return "";
    });
    const maxVisibleDate = computed(() => {
      if (dateUserInput.value.max !== null)
        return dateUserInput.value.max;
      if (maxDate.value || minDate.value)
        return (maxDate.value || minDate.value).format(dateFormat.value);
      return "";
    });
    const minVisibleTime = computed(() => {
      if (timeUserInput.value.min !== null)
        return timeUserInput.value.min;
      if (minDate.value)
        return minDate.value.format(timeFormat.value);
      return "";
    });
    const maxVisibleTime = computed(() => {
      if (timeUserInput.value.max !== null)
        return timeUserInput.value.max;
      if (maxDate.value || minDate.value)
        return (maxDate.value || minDate.value).format(timeFormat.value);
      return "";
    });
    const timeFormat = computed(() => {
      return props.timeFormat || extractTimeFormat(format.value || "") || DEFAULT_FORMATS_TIME;
    });
    const dateFormat = computed(() => {
      return props.dateFormat || extractDateFormat(format.value || "") || DEFAULT_FORMATS_DATE;
    });
    const isValidValue = (date) => {
      return isValidRange(date) && (disabledDate ? !disabledDate(date[0].toDate()) && !disabledDate(date[1].toDate()) : true);
    };
    const leftPrevYear = () => {
      leftDate.value = adjustDateByView(leftCurrentView.value, leftDate.value, false);
      if (!props.unlinkPanels) {
        rightDate.value = leftDate.value.add(1, "month");
      }
      handlePanelChange("year");
    };
    const leftPrevMonth = () => {
      leftDate.value = leftDate.value.subtract(1, "month");
      if (!props.unlinkPanels) {
        rightDate.value = leftDate.value.add(1, "month");
      }
      handlePanelChange("month");
    };
    const rightNextYear = () => {
      if (!props.unlinkPanels) {
        leftDate.value = adjustDateByView(rightCurrentView.value, leftDate.value, true);
        rightDate.value = leftDate.value.add(1, "month");
      } else {
        rightDate.value = adjustDateByView(rightCurrentView.value, rightDate.value, true);
      }
      handlePanelChange("year");
    };
    const rightNextMonth = () => {
      if (!props.unlinkPanels) {
        leftDate.value = leftDate.value.add(1, "month");
        rightDate.value = leftDate.value.add(1, "month");
      } else {
        rightDate.value = rightDate.value.add(1, "month");
      }
      handlePanelChange("month");
    };
    const leftNextYear = () => {
      leftDate.value = adjustDateByView(leftCurrentView.value, leftDate.value, true);
      handlePanelChange("year");
    };
    const leftNextMonth = () => {
      leftDate.value = leftDate.value.add(1, "month");
      handlePanelChange("month");
    };
    const rightPrevYear = () => {
      rightDate.value = adjustDateByView(rightCurrentView.value, rightDate.value, false);
      handlePanelChange("year");
    };
    const rightPrevMonth = () => {
      rightDate.value = rightDate.value.subtract(1, "month");
      handlePanelChange("month");
    };
    const enableMonthArrow = computed(() => {
      const nextMonth = (leftMonth.value + 1) % 12;
      const yearOffset = leftMonth.value + 1 >= 12 ? 1 : 0;
      return props.unlinkPanels && new Date(leftYear.value + yearOffset, nextMonth) < new Date(rightYear.value, rightMonth.value);
    });
    const enableYearArrow = computed(() => {
      return props.unlinkPanels && rightYear.value * 12 + rightMonth.value - (leftYear.value * 12 + leftMonth.value + 1) >= 12;
    });
    const btnDisabled = computed(() => {
      return !(minDate.value && maxDate.value && !rangeState.value.selecting && isValidRange([minDate.value, maxDate.value]));
    });
    const showTime = computed(() => props.type === "datetime" || props.type === "datetimerange");
    const formatEmit = (emitDayjs, index) => {
      if (!emitDayjs)
        return;
      if (defaultTime) {
        const defaultTimeD = dayjs(defaultTime[index] || defaultTime).locale(lang.value);
        return defaultTimeD.year(emitDayjs.year()).month(emitDayjs.month()).date(emitDayjs.date());
      }
      return emitDayjs;
    };
    const handleRangePick = (val, close = true) => {
      const min_ = val.minDate;
      const max_ = val.maxDate;
      const minDate_ = formatEmit(min_, 0);
      const maxDate_ = formatEmit(max_, 1);
      if (maxDate.value === maxDate_ && minDate.value === minDate_) {
        return;
      }
      emit("calendar-change", [min_.toDate(), max_ && max_.toDate()]);
      maxDate.value = maxDate_;
      minDate.value = minDate_;
      if (!showTime.value && close) {
        close = !minDate_ || !maxDate_;
      }
      handleRangeConfirm(close);
    };
    const minTimePickerVisible = ref(false);
    const maxTimePickerVisible = ref(false);
    const handleMinTimeClose = () => {
      minTimePickerVisible.value = false;
    };
    const handleMaxTimeClose = () => {
      maxTimePickerVisible.value = false;
    };
    const handleDateInput = (value, type) => {
      dateUserInput.value[type] = value;
      const parsedValueD = dayjs(value, dateFormat.value).locale(lang.value);
      if (parsedValueD.isValid()) {
        if (disabledDate && disabledDate(parsedValueD.toDate())) {
          return;
        }
        if (type === "min") {
          leftDate.value = parsedValueD;
          minDate.value = (minDate.value || leftDate.value).year(parsedValueD.year()).month(parsedValueD.month()).date(parsedValueD.date());
          if (!props.unlinkPanels && (!maxDate.value || maxDate.value.isBefore(minDate.value))) {
            rightDate.value = parsedValueD.add(1, "month");
            maxDate.value = minDate.value.add(1, "month");
          }
        } else {
          rightDate.value = parsedValueD;
          maxDate.value = (maxDate.value || rightDate.value).year(parsedValueD.year()).month(parsedValueD.month()).date(parsedValueD.date());
          if (!props.unlinkPanels && (!minDate.value || minDate.value.isAfter(maxDate.value))) {
            leftDate.value = parsedValueD.subtract(1, "month");
            minDate.value = maxDate.value.subtract(1, "month");
          }
        }
        sortDates(minDate.value, maxDate.value);
        handleRangeConfirm(true);
      }
    };
    const handleDateChange = (_, type) => {
      dateUserInput.value[type] = null;
    };
    const handleTimeInput = (value, type) => {
      timeUserInput.value[type] = value;
      const parsedValueD = dayjs(value, timeFormat.value).locale(lang.value);
      if (parsedValueD.isValid()) {
        if (type === "min") {
          minTimePickerVisible.value = true;
          minDate.value = (minDate.value || leftDate.value).hour(parsedValueD.hour()).minute(parsedValueD.minute()).second(parsedValueD.second());
          leftDate.value = minDate.value;
        } else {
          maxTimePickerVisible.value = true;
          maxDate.value = (maxDate.value || rightDate.value).hour(parsedValueD.hour()).minute(parsedValueD.minute()).second(parsedValueD.second());
          rightDate.value = maxDate.value;
        }
      }
    };
    const handleTimeChange = (_value, type) => {
      timeUserInput.value[type] = null;
      if (type === "min") {
        leftDate.value = minDate.value;
        minTimePickerVisible.value = false;
        if (!maxDate.value || maxDate.value.isBefore(minDate.value)) {
          maxDate.value = minDate.value;
        }
      } else {
        rightDate.value = maxDate.value;
        maxTimePickerVisible.value = false;
        if (maxDate.value && maxDate.value.isBefore(minDate.value)) {
          minDate.value = maxDate.value;
        }
      }
      handleRangeConfirm(true);
    };
    const handleMinTimePick = (value, visible, first) => {
      if (timeUserInput.value.min)
        return;
      if (value) {
        leftDate.value = value;
        minDate.value = (minDate.value || leftDate.value).hour(value.hour()).minute(value.minute()).second(value.second());
      }
      if (!first) {
        minTimePickerVisible.value = visible;
      }
      if (!maxDate.value || maxDate.value.isBefore(minDate.value)) {
        maxDate.value = minDate.value;
        rightDate.value = value;
        nextTick(() => {
          parseValue(props.parsedValue);
        });
      }
      handleRangeConfirm(true);
    };
    const handleMaxTimePick = (value, visible, first) => {
      if (timeUserInput.value.max)
        return;
      if (value) {
        rightDate.value = value;
        maxDate.value = (maxDate.value || rightDate.value).hour(value.hour()).minute(value.minute()).second(value.second());
      }
      if (!first) {
        maxTimePickerVisible.value = visible;
      }
      if (maxDate.value && maxDate.value.isBefore(minDate.value)) {
        minDate.value = maxDate.value;
      }
      handleRangeConfirm(true);
    };
    const handleClear = () => {
      let valueOnClear = null;
      if (pickerBase == null ? void 0 : pickerBase.emptyValues) {
        valueOnClear = pickerBase.emptyValues.valueOnClear.value;
      }
      leftDate.value = getDefaultValue(unref(defaultValue), {
        lang: unref(lang),
        unit: "month",
        unlinkPanels: props.unlinkPanels
      })[0];
      rightDate.value = leftDate.value.add(1, "month");
      maxDate.value = void 0;
      minDate.value = void 0;
      handleRangeConfirm(true);
      emit("pick", valueOnClear);
    };
    const parseUserInput = (value) => {
      return correctlyParseUserInput(value, format.value || "", lang.value, isDefaultFormat);
    };
    function sortDates(minDate2, maxDate2) {
      if (props.unlinkPanels && maxDate2) {
        const minDateYear = (minDate2 == null ? void 0 : minDate2.year()) || 0;
        const minDateMonth = (minDate2 == null ? void 0 : minDate2.month()) || 0;
        const maxDateYear = maxDate2.year();
        const maxDateMonth = maxDate2.month();
        rightDate.value = minDateYear === maxDateYear && minDateMonth === maxDateMonth ? maxDate2.add(1, unit$2) : maxDate2;
      } else {
        rightDate.value = leftDate.value.add(1, unit$2);
        if (maxDate2) {
          rightDate.value = rightDate.value.hour(maxDate2.hour()).minute(maxDate2.minute()).second(maxDate2.second());
        }
      }
    }
    emit("set-picker-option", ["isValidValue", isValidValue]);
    emit("set-picker-option", ["parseUserInput", parseUserInput]);
    emit("set-picker-option", ["handleClear", handleClear]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([
          unref(ppNs).b(),
          unref(drpNs).b(),
          unref(ppNs).is("border", _ctx.border),
          unref(ppNs).is("disabled", _ctx.disabled),
          {
            "has-sidebar": _ctx.$slots.sidebar || unref(hasShortcuts),
            "has-time": unref(showTime)
          }
        ])
      }, [
        createBaseVNode("div", {
          class: normalizeClass(unref(ppNs).e("body-wrapper"))
        }, [
          renderSlot(_ctx.$slots, "sidebar", {
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }),
          unref(hasShortcuts) ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(shortcuts), (shortcut, key) => {
              return openBlock(), createElementBlock("button", {
                key,
                type: "button",
                disabled: _ctx.disabled,
                class: normalizeClass(unref(ppNs).e("shortcut")),
                onClick: ($event) => unref(handleShortcutClick)(shortcut)
              }, toDisplayString(shortcut.text), 11, ["disabled", "onClick"]);
            }), 128))
          ], 2)) : createCommentVNode("v-if", true),
          createBaseVNode("div", {
            class: normalizeClass(unref(ppNs).e("body"))
          }, [
            unref(showTime) ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: normalizeClass(unref(drpNs).e("time-header"))
            }, [
              createBaseVNode("span", {
                class: normalizeClass(unref(drpNs).e("editors-wrap"))
              }, [
                createBaseVNode("span", {
                  class: normalizeClass(unref(drpNs).e("time-picker-wrap"))
                }, [
                  createVNode(unref(ElInput), {
                    size: "small",
                    disabled: unref(rangeState).selecting || _ctx.disabled,
                    placeholder: unref(t)("el.datepicker.startDate"),
                    class: normalizeClass(unref(drpNs).e("editor")),
                    "model-value": unref(minVisibleDate),
                    "validate-event": false,
                    onInput: (val) => handleDateInput(val, "min"),
                    onChange: (val) => handleDateChange(val, "min")
                  }, null, 8, ["disabled", "placeholder", "class", "model-value", "onInput", "onChange"])
                ], 2),
                withDirectives((openBlock(), createElementBlock("span", {
                  class: normalizeClass(unref(drpNs).e("time-picker-wrap"))
                }, [
                  createVNode(unref(ElInput), {
                    size: "small",
                    class: normalizeClass(unref(drpNs).e("editor")),
                    disabled: unref(rangeState).selecting || _ctx.disabled,
                    placeholder: unref(t)("el.datepicker.startTime"),
                    "model-value": unref(minVisibleTime),
                    "validate-event": false,
                    onFocus: ($event) => minTimePickerVisible.value = true,
                    onInput: (val) => handleTimeInput(val, "min"),
                    onChange: (val) => handleTimeChange(val, "min")
                  }, null, 8, ["class", "disabled", "placeholder", "model-value", "onFocus", "onInput", "onChange"]),
                  createVNode(unref(TimePickPanel), {
                    visible: minTimePickerVisible.value,
                    format: unref(timeFormat),
                    "datetime-role": "start",
                    "parsed-value": leftDate.value,
                    onPick: handleMinTimePick
                  }, null, 8, ["visible", "format", "parsed-value"])
                ], 2)), [
                  [unref(ClickOutside), handleMinTimeClose]
                ])
              ], 2),
              createBaseVNode("span", null, [
                createVNode(unref(ElIcon), null, {
                  default: withCtx(() => [
                    createVNode(unref(arrow_right_default))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("span", {
                class: normalizeClass([unref(drpNs).e("editors-wrap"), "is-right"])
              }, [
                createBaseVNode("span", {
                  class: normalizeClass(unref(drpNs).e("time-picker-wrap"))
                }, [
                  createVNode(unref(ElInput), {
                    size: "small",
                    class: normalizeClass(unref(drpNs).e("editor")),
                    disabled: unref(rangeState).selecting || _ctx.disabled,
                    placeholder: unref(t)("el.datepicker.endDate"),
                    "model-value": unref(maxVisibleDate),
                    readonly: !unref(minDate),
                    "validate-event": false,
                    onInput: (val) => handleDateInput(val, "max"),
                    onChange: (val) => handleDateChange(val, "max")
                  }, null, 8, ["class", "disabled", "placeholder", "model-value", "readonly", "onInput", "onChange"])
                ], 2),
                withDirectives((openBlock(), createElementBlock("span", {
                  class: normalizeClass(unref(drpNs).e("time-picker-wrap"))
                }, [
                  createVNode(unref(ElInput), {
                    size: "small",
                    class: normalizeClass(unref(drpNs).e("editor")),
                    disabled: unref(rangeState).selecting || _ctx.disabled,
                    placeholder: unref(t)("el.datepicker.endTime"),
                    "model-value": unref(maxVisibleTime),
                    readonly: !unref(minDate),
                    "validate-event": false,
                    onFocus: ($event) => unref(minDate) && (maxTimePickerVisible.value = true),
                    onInput: (val) => handleTimeInput(val, "max"),
                    onChange: (val) => handleTimeChange(val, "max")
                  }, null, 8, ["class", "disabled", "placeholder", "model-value", "readonly", "onFocus", "onInput", "onChange"]),
                  createVNode(unref(TimePickPanel), {
                    "datetime-role": "end",
                    visible: maxTimePickerVisible.value,
                    format: unref(timeFormat),
                    "parsed-value": rightDate.value,
                    onPick: handleMaxTimePick
                  }, null, 8, ["visible", "format", "parsed-value"])
                ], 2)), [
                  [unref(ClickOutside), handleMaxTimeClose]
                ])
              ], 2)
            ], 2)) : createCommentVNode("v-if", true),
            createBaseVNode("div", {
              class: normalizeClass([[unref(ppNs).e("content"), unref(drpNs).e("content")], "is-left"])
            }, [
              createBaseVNode("div", {
                class: normalizeClass(unref(drpNs).e("header"))
              }, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-left"]),
                  "aria-label": unref(t)(`el.datepicker.prevYear`),
                  disabled: _ctx.disabled,
                  onClick: leftPrevYear
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled"]),
                withDirectives(createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "arrow-left"]),
                  "aria-label": unref(t)(`el.datepicker.prevMonth`),
                  disabled: _ctx.disabled,
                  onClick: leftPrevMonth
                }, [
                  renderSlot(_ctx.$slots, "prev-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled"]), [
                  [vShow, unref(leftCurrentView) === "date"]
                ]),
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass([[
                    unref(ppNs).e("icon-btn"),
                    unref(ppNs).is("disabled", !unref(enableYearArrow) || _ctx.disabled)
                  ], "d-arrow-right"]),
                  "aria-label": unref(t)(`el.datepicker.nextYear`),
                  onClick: leftNextYear
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "aria-label"])) : createCommentVNode("v-if", true),
                _ctx.unlinkPanels && unref(leftCurrentView) === "date" ? (openBlock(), createElementBlock("button", {
                  key: 1,
                  type: "button",
                  disabled: !unref(enableMonthArrow) || _ctx.disabled,
                  class: normalizeClass([[
                    unref(ppNs).e("icon-btn"),
                    unref(ppNs).is("disabled", !unref(enableMonthArrow) || _ctx.disabled)
                  ], "arrow-right"]),
                  "aria-label": unref(t)(`el.datepicker.nextMonth`),
                  onClick: leftNextMonth
                }, [
                  renderSlot(_ctx.$slots, "next-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "aria-label"])) : createCommentVNode("v-if", true),
                createBaseVNode("div", null, [
                  createBaseVNode("span", {
                    role: "button",
                    class: normalizeClass(unref(drpNs).e("header-label")),
                    "aria-live": "polite",
                    tabindex: "0",
                    onKeydown: withKeys(($event) => unref(showLeftPicker)("year"), ["enter"]),
                    onClick: ($event) => unref(showLeftPicker)("year")
                  }, toDisplayString(unref(leftYearLabel)), 43, ["onKeydown", "onClick"]),
                  withDirectives(createBaseVNode("span", {
                    role: "button",
                    "aria-live": "polite",
                    tabindex: "0",
                    class: normalizeClass([
                      unref(drpNs).e("header-label"),
                      { active: unref(leftCurrentView) === "month" }
                    ]),
                    onKeydown: withKeys(($event) => unref(showLeftPicker)("month"), ["enter"]),
                    onClick: ($event) => unref(showLeftPicker)("month")
                  }, toDisplayString(unref(t)(`el.datepicker.month${leftDate.value.month() + 1}`)), 43, ["onKeydown", "onClick"]), [
                    [vShow, unref(leftCurrentView) === "date"]
                  ])
                ])
              ], 2),
              unref(leftCurrentView) === "date" ? (openBlock(), createBlock(DateTable, {
                key: 0,
                ref_key: "leftCurrentViewRef",
                ref: leftCurrentViewRef,
                "selection-mode": "range",
                date: leftDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                "cell-class-name": unref(cellClassName),
                "show-week-number": _ctx.showWeekNumber,
                disabled: _ctx.disabled,
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "cell-class-name", "show-week-number", "disabled", "onChangerange", "onSelect"])) : createCommentVNode("v-if", true),
              unref(leftCurrentView) === "year" ? (openBlock(), createBlock(YearTable, {
                key: 1,
                ref_key: "leftCurrentViewRef",
                ref: leftCurrentViewRef,
                "selection-mode": "year",
                date: leftDate.value,
                "disabled-date": unref(disabledDate),
                "parsed-value": _ctx.parsedValue,
                disabled: _ctx.disabled,
                onPick: unref(handleLeftYearPick)
              }, null, 8, ["date", "disabled-date", "parsed-value", "disabled", "onPick"])) : createCommentVNode("v-if", true),
              unref(leftCurrentView) === "month" ? (openBlock(), createBlock(MonthTable, {
                key: 2,
                ref_key: "leftCurrentViewRef",
                ref: leftCurrentViewRef,
                "selection-mode": "month",
                date: leftDate.value,
                "parsed-value": _ctx.parsedValue,
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                onPick: unref(handleLeftMonthPick)
              }, null, 8, ["date", "parsed-value", "disabled-date", "disabled", "onPick"])) : createCommentVNode("v-if", true)
            ], 2),
            createBaseVNode("div", {
              class: normalizeClass([[unref(ppNs).e("content"), unref(drpNs).e("content")], "is-right"])
            }, [
              createBaseVNode("div", {
                class: normalizeClass([
                  unref(drpNs).e("header"),
                  unref(ppNs).is("disabled", !unref(enableYearArrow) || _ctx.disabled)
                ])
              }, [
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-left"]),
                  "aria-label": unref(t)(`el.datepicker.prevYear`),
                  onClick: rightPrevYear
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "aria-label"])) : createCommentVNode("v-if", true),
                _ctx.unlinkPanels && unref(rightCurrentView) === "date" ? (openBlock(), createElementBlock("button", {
                  key: 1,
                  type: "button",
                  disabled: !unref(enableMonthArrow) || _ctx.disabled,
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "arrow-left"]),
                  "aria-label": unref(t)(`el.datepicker.prevMonth`),
                  onClick: rightPrevMonth
                }, [
                  renderSlot(_ctx.$slots, "prev-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "aria-label"])) : createCommentVNode("v-if", true),
                createBaseVNode("button", {
                  type: "button",
                  "aria-label": unref(t)(`el.datepicker.nextYear`),
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-right"]),
                  disabled: _ctx.disabled,
                  onClick: rightNextYear
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["aria-label", "disabled"]),
                withDirectives(createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "arrow-right"]),
                  disabled: _ctx.disabled,
                  "aria-label": unref(t)(`el.datepicker.nextMonth`),
                  onClick: rightNextMonth
                }, [
                  renderSlot(_ctx.$slots, "next-month", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "aria-label"]), [
                  [vShow, unref(rightCurrentView) === "date"]
                ]),
                createBaseVNode("div", null, [
                  createBaseVNode("span", {
                    role: "button",
                    class: normalizeClass(unref(drpNs).e("header-label")),
                    "aria-live": "polite",
                    tabindex: "0",
                    onKeydown: withKeys(($event) => unref(showRightPicker)("year"), ["enter"]),
                    onClick: ($event) => unref(showRightPicker)("year")
                  }, toDisplayString(unref(rightYearLabel)), 43, ["onKeydown", "onClick"]),
                  withDirectives(createBaseVNode("span", {
                    role: "button",
                    "aria-live": "polite",
                    tabindex: "0",
                    class: normalizeClass([
                      unref(drpNs).e("header-label"),
                      { active: unref(rightCurrentView) === "month" }
                    ]),
                    onKeydown: withKeys(($event) => unref(showRightPicker)("month"), ["enter"]),
                    onClick: ($event) => unref(showRightPicker)("month")
                  }, toDisplayString(unref(t)(`el.datepicker.month${rightDate.value.month() + 1}`)), 43, ["onKeydown", "onClick"]), [
                    [vShow, unref(rightCurrentView) === "date"]
                  ])
                ])
              ], 2),
              unref(rightCurrentView) === "date" ? (openBlock(), createBlock(DateTable, {
                key: 0,
                ref_key: "rightCurrentViewRef",
                ref: rightCurrentViewRef,
                "selection-mode": "range",
                date: rightDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                "cell-class-name": unref(cellClassName),
                "show-week-number": _ctx.showWeekNumber,
                disabled: _ctx.disabled,
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "cell-class-name", "show-week-number", "disabled", "onChangerange", "onSelect"])) : createCommentVNode("v-if", true),
              unref(rightCurrentView) === "year" ? (openBlock(), createBlock(YearTable, {
                key: 1,
                ref_key: "rightCurrentViewRef",
                ref: rightCurrentViewRef,
                "selection-mode": "year",
                date: rightDate.value,
                "disabled-date": unref(disabledDate),
                "parsed-value": _ctx.parsedValue,
                disabled: _ctx.disabled,
                onPick: unref(handleRightYearPick)
              }, null, 8, ["date", "disabled-date", "parsed-value", "disabled", "onPick"])) : createCommentVNode("v-if", true),
              unref(rightCurrentView) === "month" ? (openBlock(), createBlock(MonthTable, {
                key: 2,
                ref_key: "rightCurrentViewRef",
                ref: rightCurrentViewRef,
                "selection-mode": "month",
                date: rightDate.value,
                "parsed-value": _ctx.parsedValue,
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                onPick: unref(handleRightMonthPick)
              }, null, 8, ["date", "parsed-value", "disabled-date", "disabled", "onPick"])) : createCommentVNode("v-if", true)
            ], 2)
          ], 2)
        ], 2),
        _ctx.showFooter && unref(showTime) && (_ctx.showConfirm || unref(clearable)) ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ppNs).e("footer"))
        }, [
          unref(clearable) ? (openBlock(), createBlock(unref(ElButton), {
            key: 0,
            text: "",
            size: "small",
            class: normalizeClass(unref(ppNs).e("link-btn")),
            onClick: handleClear
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("el.datepicker.clear")), 1)
            ]),
            _: 1
          }, 8, ["class"])) : createCommentVNode("v-if", true),
          _ctx.showConfirm ? (openBlock(), createBlock(unref(ElButton), {
            key: 1,
            plain: "",
            size: "small",
            class: normalizeClass(unref(ppNs).e("link-btn")),
            disabled: unref(btnDisabled),
            onClick: ($event) => unref(handleRangeConfirm)(false)
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("el.datepicker.confirm")), 1)
            ]),
            _: 1
          }, 8, ["class", "disabled", "onClick"])) : createCommentVNode("v-if", true)
        ], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var DateRangePickPanel = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__file", "panel-date-range.vue"]]);
const panelMonthRangeProps = buildProps({
  ...panelRangeSharedProps
});
const panelMonthRangeEmits = [
  "pick",
  "set-picker-option",
  "calendar-change"
];
const useMonthRangeHeader = ({
  unlinkPanels,
  leftDate,
  rightDate
}) => {
  const { t } = useLocale();
  const leftPrevYear = () => {
    leftDate.value = leftDate.value.subtract(1, "year");
    if (!unlinkPanels.value) {
      rightDate.value = rightDate.value.subtract(1, "year");
    }
  };
  const rightNextYear = () => {
    if (!unlinkPanels.value) {
      leftDate.value = leftDate.value.add(1, "year");
    }
    rightDate.value = rightDate.value.add(1, "year");
  };
  const leftNextYear = () => {
    leftDate.value = leftDate.value.add(1, "year");
  };
  const rightPrevYear = () => {
    rightDate.value = rightDate.value.subtract(1, "year");
  };
  const leftLabel = computed(() => {
    return `${leftDate.value.year()} ${t("el.datepicker.year")}`;
  });
  const rightLabel = computed(() => {
    return `${rightDate.value.year()} ${t("el.datepicker.year")}`;
  });
  const leftYear = computed(() => {
    return leftDate.value.year();
  });
  const rightYear = computed(() => {
    return rightDate.value.year() === leftDate.value.year() ? leftDate.value.year() + 1 : rightDate.value.year();
  });
  return {
    leftPrevYear,
    rightNextYear,
    leftNextYear,
    rightPrevYear,
    leftLabel,
    rightLabel,
    leftYear,
    rightYear
  };
};
const unit$1 = "year";
const __default__$5 = defineComponent({
  name: "DatePickerMonthRange"
});
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  ...__default__$5,
  props: panelMonthRangeProps,
  emits: panelMonthRangeEmits,
  setup(__props, { emit }) {
    const props = __props;
    const { lang } = useLocale();
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const isDefaultFormat = inject(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, void 0);
    const { shortcuts, disabledDate, cellClassName } = pickerBase.props;
    const format = toRef(pickerBase.props, "format");
    const defaultValue = toRef(pickerBase.props, "defaultValue");
    const leftDate = ref(dayjs().locale(lang.value));
    const rightDate = ref(dayjs().locale(lang.value).add(1, unit$1));
    const {
      minDate,
      maxDate,
      rangeState,
      ppNs,
      drpNs,
      handleChangeRange,
      handleRangeConfirm,
      handleShortcutClick,
      onSelect,
      parseValue
    } = useRangePicker(props, {
      defaultValue,
      leftDate,
      rightDate,
      unit: unit$1,
      sortDates
    });
    const hasShortcuts = computed(() => !!shortcuts.length);
    const {
      leftPrevYear,
      rightNextYear,
      leftNextYear,
      rightPrevYear,
      leftLabel,
      rightLabel,
      leftYear,
      rightYear
    } = useMonthRangeHeader({
      unlinkPanels: toRef(props, "unlinkPanels"),
      leftDate,
      rightDate
    });
    const enableYearArrow = computed(() => {
      return props.unlinkPanels && rightYear.value > leftYear.value + 1;
    });
    const handleRangePick = (val, close = true) => {
      const minDate_ = val.minDate;
      const maxDate_ = val.maxDate;
      if (maxDate.value === maxDate_ && minDate.value === minDate_) {
        return;
      }
      emit("calendar-change", [minDate_.toDate(), maxDate_ && maxDate_.toDate()]);
      maxDate.value = maxDate_;
      minDate.value = minDate_;
      if (!close)
        return;
      handleRangeConfirm();
    };
    const handleClear = () => {
      let valueOnClear = null;
      if (pickerBase == null ? void 0 : pickerBase.emptyValues) {
        valueOnClear = pickerBase.emptyValues.valueOnClear.value;
      }
      leftDate.value = getDefaultValue(unref(defaultValue), {
        lang: unref(lang),
        unit: "year",
        unlinkPanels: props.unlinkPanels
      })[0];
      rightDate.value = leftDate.value.add(1, "year");
      emit("pick", valueOnClear);
    };
    const parseUserInput = (value) => {
      return correctlyParseUserInput(value, format.value, lang.value, isDefaultFormat);
    };
    function sortDates(minDate2, maxDate2) {
      if (props.unlinkPanels && maxDate2) {
        const minDateYear = (minDate2 == null ? void 0 : minDate2.year()) || 0;
        const maxDateYear = maxDate2.year();
        rightDate.value = minDateYear === maxDateYear ? maxDate2.add(1, unit$1) : maxDate2;
      } else {
        rightDate.value = leftDate.value.add(1, unit$1);
      }
    }
    watch(() => props.visible, (visible) => {
      if (!visible && rangeState.value.selecting) {
        parseValue(props.parsedValue);
        onSelect(false);
      }
    });
    emit("set-picker-option", ["isValidValue", isValidRange]);
    emit("set-picker-option", ["parseUserInput", parseUserInput]);
    emit("set-picker-option", ["handleClear", handleClear]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([
          unref(ppNs).b(),
          unref(drpNs).b(),
          unref(ppNs).is("border", _ctx.border),
          unref(ppNs).is("disabled", _ctx.disabled),
          {
            "has-sidebar": Boolean(_ctx.$slots.sidebar) || unref(hasShortcuts)
          }
        ])
      }, [
        createBaseVNode("div", {
          class: normalizeClass(unref(ppNs).e("body-wrapper"))
        }, [
          renderSlot(_ctx.$slots, "sidebar", {
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }),
          unref(hasShortcuts) ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(shortcuts), (shortcut, key) => {
              return openBlock(), createElementBlock("button", {
                key,
                type: "button",
                class: normalizeClass(unref(ppNs).e("shortcut")),
                disabled: _ctx.disabled,
                onClick: ($event) => unref(handleShortcutClick)(shortcut)
              }, toDisplayString(shortcut.text), 11, ["disabled", "onClick"]);
            }), 128))
          ], 2)) : createCommentVNode("v-if", true),
          createBaseVNode("div", {
            class: normalizeClass(unref(ppNs).e("body"))
          }, [
            createBaseVNode("div", {
              class: normalizeClass([[unref(ppNs).e("content"), unref(drpNs).e("content")], "is-left"])
            }, [
              createBaseVNode("div", {
                class: normalizeClass(unref(drpNs).e("header"))
              }, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-left"]),
                  disabled: _ctx.disabled,
                  onClick: unref(leftPrevYear)
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"]),
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass([[
                    unref(ppNs).e("icon-btn"),
                    unref(ppNs).is("disabled", !unref(enableYearArrow))
                  ], "d-arrow-right"]),
                  onClick: unref(leftNextYear)
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                createBaseVNode("div", null, toDisplayString(unref(leftLabel)), 1)
              ], 2),
              createVNode(MonthTable, {
                "selection-mode": "range",
                date: leftDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "disabled", "cell-class-name", "onChangerange", "onSelect"])
            ], 2),
            createBaseVNode("div", {
              class: normalizeClass([[unref(ppNs).e("content"), unref(drpNs).e("content")], "is-right"])
            }, [
              createBaseVNode("div", {
                class: normalizeClass(unref(drpNs).e("header"))
              }, [
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass([[
                    unref(ppNs).e("icon-btn"),
                    unref(ppNs).is("disabled", !unref(enableYearArrow))
                  ], "d-arrow-left"]),
                  onClick: unref(rightPrevYear)
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass([unref(ppNs).e("icon-btn"), "d-arrow-right"]),
                  disabled: _ctx.disabled,
                  onClick: unref(rightNextYear)
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"]),
                createBaseVNode("div", null, toDisplayString(unref(rightLabel)), 1)
              ], 2),
              createVNode(MonthTable, {
                "selection-mode": "range",
                date: rightDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "disabled", "cell-class-name", "onChangerange", "onSelect"])
            ], 2)
          ], 2)
        ], 2)
      ], 2);
    };
  }
});
var MonthRangePickPanel = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__file", "panel-month-range.vue"]]);
const panelYearRangeProps = buildProps({
  ...panelRangeSharedProps
});
const panelYearRangeEmits = [
  "pick",
  "set-picker-option",
  "calendar-change"
];
const useYearRangeHeader = ({
  unlinkPanels,
  leftDate,
  rightDate
}) => {
  const leftPrevYear = () => {
    leftDate.value = leftDate.value.subtract(10, "year");
    if (!unlinkPanels.value) {
      rightDate.value = rightDate.value.subtract(10, "year");
    }
  };
  const rightNextYear = () => {
    if (!unlinkPanels.value) {
      leftDate.value = leftDate.value.add(10, "year");
    }
    rightDate.value = rightDate.value.add(10, "year");
  };
  const leftNextYear = () => {
    leftDate.value = leftDate.value.add(10, "year");
  };
  const rightPrevYear = () => {
    rightDate.value = rightDate.value.subtract(10, "year");
  };
  const leftLabel = computed(() => {
    const leftStartDate = Math.floor(leftDate.value.year() / 10) * 10;
    return `${leftStartDate}-${leftStartDate + 9}`;
  });
  const rightLabel = computed(() => {
    const rightStartDate = Math.floor(rightDate.value.year() / 10) * 10;
    return `${rightStartDate}-${rightStartDate + 9}`;
  });
  const leftYear = computed(() => {
    const leftEndDate = Math.floor(leftDate.value.year() / 10) * 10 + 9;
    return leftEndDate;
  });
  const rightYear = computed(() => {
    const rightStartDate = Math.floor(rightDate.value.year() / 10) * 10;
    return rightStartDate;
  });
  return {
    leftPrevYear,
    rightNextYear,
    leftNextYear,
    rightPrevYear,
    leftLabel,
    rightLabel,
    leftYear,
    rightYear
  };
};
const step = 10;
const unit = "year";
const __default__$4 = defineComponent({
  name: "DatePickerYearRange"
});
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  ...__default__$4,
  props: panelYearRangeProps,
  emits: panelYearRangeEmits,
  setup(__props, { emit }) {
    const props = __props;
    const { lang } = useLocale();
    const leftDate = ref(dayjs().locale(lang.value));
    const rightDate = ref(dayjs().locale(lang.value).add(step, unit));
    const isDefaultFormat = inject(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, void 0);
    const pickerBase = inject(PICKER_BASE_INJECTION_KEY);
    const { shortcuts, disabledDate, cellClassName } = pickerBase.props;
    const format = toRef(pickerBase.props, "format");
    const defaultValue = toRef(pickerBase.props, "defaultValue");
    const {
      minDate,
      maxDate,
      rangeState,
      ppNs,
      drpNs,
      handleChangeRange,
      handleRangeConfirm,
      handleShortcutClick,
      onSelect,
      parseValue
    } = useRangePicker(props, {
      defaultValue,
      leftDate,
      rightDate,
      step,
      unit,
      sortDates
    });
    const {
      leftPrevYear,
      rightNextYear,
      leftNextYear,
      rightPrevYear,
      leftLabel,
      rightLabel,
      leftYear,
      rightYear
    } = useYearRangeHeader({
      unlinkPanels: toRef(props, "unlinkPanels"),
      leftDate,
      rightDate
    });
    const hasShortcuts = computed(() => !!shortcuts.length);
    const panelKls = computed(() => [
      ppNs.b(),
      drpNs.b(),
      ppNs.is("border", props.border),
      ppNs.is("disabled", props.disabled),
      {
        "has-sidebar": Boolean(useSlots().sidebar) || hasShortcuts.value
      }
    ]);
    const leftPanelKls = computed(() => {
      return {
        content: [ppNs.e("content"), drpNs.e("content"), "is-left"],
        arrowLeftBtn: [ppNs.e("icon-btn"), "d-arrow-left"],
        arrowRightBtn: [
          ppNs.e("icon-btn"),
          ppNs.is("disabled", !enableYearArrow.value),
          "d-arrow-right"
        ]
      };
    });
    const rightPanelKls = computed(() => {
      return {
        content: [ppNs.e("content"), drpNs.e("content"), "is-right"],
        arrowLeftBtn: [
          ppNs.e("icon-btn"),
          ppNs.is("disabled", !enableYearArrow.value),
          "d-arrow-left"
        ],
        arrowRightBtn: [ppNs.e("icon-btn"), "d-arrow-right"]
      };
    });
    const enableYearArrow = computed(() => {
      return props.unlinkPanels && rightYear.value > leftYear.value + 1;
    });
    const handleRangePick = (val, close = true) => {
      const minDate_ = val.minDate;
      const maxDate_ = val.maxDate;
      if (maxDate.value === maxDate_ && minDate.value === minDate_) {
        return;
      }
      emit("calendar-change", [minDate_.toDate(), maxDate_ && maxDate_.toDate()]);
      maxDate.value = maxDate_;
      minDate.value = minDate_;
      if (!close)
        return;
      handleRangeConfirm();
    };
    const parseUserInput = (value) => {
      return correctlyParseUserInput(value, format.value, lang.value, isDefaultFormat);
    };
    const isValidValue = (date) => {
      return isValidRange(date) && (disabledDate ? !disabledDate(date[0].toDate()) && !disabledDate(date[1].toDate()) : true);
    };
    const handleClear = () => {
      let valueOnClear = null;
      if (pickerBase == null ? void 0 : pickerBase.emptyValues) {
        valueOnClear = pickerBase.emptyValues.valueOnClear.value;
      }
      const defaultArr = getDefaultValue(unref(defaultValue), {
        lang: unref(lang),
        step,
        unit,
        unlinkPanels: props.unlinkPanels
      });
      leftDate.value = defaultArr[0];
      rightDate.value = defaultArr[1];
      emit("pick", valueOnClear);
    };
    function sortDates(minDate2, maxDate2) {
      if (props.unlinkPanels && maxDate2) {
        const minDateYear = (minDate2 == null ? void 0 : minDate2.year()) || 0;
        const maxDateYear = maxDate2.year();
        rightDate.value = minDateYear + step > maxDateYear ? maxDate2.add(step, unit) : maxDate2;
      } else {
        rightDate.value = leftDate.value.add(step, unit);
      }
    }
    watch(() => props.visible, (visible) => {
      if (!visible && rangeState.value.selecting) {
        parseValue(props.parsedValue);
        onSelect(false);
      }
    });
    emit("set-picker-option", ["isValidValue", isValidValue]);
    emit("set-picker-option", ["parseUserInput", parseUserInput]);
    emit("set-picker-option", ["handleClear", handleClear]);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(unref(panelKls))
      }, [
        createBaseVNode("div", {
          class: normalizeClass(unref(ppNs).e("body-wrapper"))
        }, [
          renderSlot(_ctx.$slots, "sidebar", {
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }),
          unref(hasShortcuts) ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ppNs).e("sidebar"))
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(shortcuts), (shortcut, key) => {
              return openBlock(), createElementBlock("button", {
                key,
                type: "button",
                class: normalizeClass(unref(ppNs).e("shortcut")),
                disabled: _ctx.disabled,
                onClick: ($event) => unref(handleShortcutClick)(shortcut)
              }, toDisplayString(shortcut.text), 11, ["disabled", "onClick"]);
            }), 128))
          ], 2)) : createCommentVNode("v-if", true),
          createBaseVNode("div", {
            class: normalizeClass(unref(ppNs).e("body"))
          }, [
            createBaseVNode("div", {
              class: normalizeClass(unref(leftPanelKls).content)
            }, [
              createBaseVNode("div", {
                class: normalizeClass(unref(drpNs).e("header"))
              }, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass(unref(leftPanelKls).arrowLeftBtn),
                  disabled: _ctx.disabled,
                  onClick: unref(leftPrevYear)
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"]),
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass(unref(leftPanelKls).arrowRightBtn),
                  onClick: unref(leftNextYear)
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                createBaseVNode("div", null, toDisplayString(unref(leftLabel)), 1)
              ], 2),
              createVNode(YearTable, {
                "selection-mode": "range",
                date: leftDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "disabled", "cell-class-name", "onChangerange", "onSelect"])
            ], 2),
            createBaseVNode("div", {
              class: normalizeClass(unref(rightPanelKls).content)
            }, [
              createBaseVNode("div", {
                class: normalizeClass(unref(drpNs).e("header"))
              }, [
                _ctx.unlinkPanels ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  type: "button",
                  disabled: !unref(enableYearArrow) || _ctx.disabled,
                  class: normalizeClass(unref(rightPanelKls).arrowLeftBtn),
                  onClick: unref(rightPrevYear)
                }, [
                  renderSlot(_ctx.$slots, "prev-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_left_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"])) : createCommentVNode("v-if", true),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass(unref(rightPanelKls).arrowRightBtn),
                  disabled: _ctx.disabled,
                  onClick: unref(rightNextYear)
                }, [
                  renderSlot(_ctx.$slots, "next-year", {}, () => [
                    createVNode(unref(ElIcon), null, {
                      default: withCtx(() => [
                        createVNode(unref(d_arrow_right_default))
                      ]),
                      _: 1
                    })
                  ])
                ], 10, ["disabled", "onClick"]),
                createBaseVNode("div", null, toDisplayString(unref(rightLabel)), 1)
              ], 2),
              createVNode(YearTable, {
                "selection-mode": "range",
                date: rightDate.value,
                "min-date": unref(minDate),
                "max-date": unref(maxDate),
                "range-state": unref(rangeState),
                "disabled-date": unref(disabledDate),
                disabled: _ctx.disabled,
                "cell-class-name": unref(cellClassName),
                onChangerange: unref(handleChangeRange),
                onPick: handleRangePick,
                onSelect: unref(onSelect)
              }, null, 8, ["date", "min-date", "max-date", "range-state", "disabled-date", "disabled", "cell-class-name", "onChangerange", "onSelect"])
            ], 2)
          ], 2)
        ], 2)
      ], 2);
    };
  }
});
var YearRangePickPanel = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__file", "panel-year-range.vue"]]);
const getPanel = function(type) {
  switch (type) {
    case "daterange":
    case "datetimerange": {
      return DateRangePickPanel;
    }
    case "monthrange": {
      return MonthRangePickPanel;
    }
    case "yearrange": {
      return YearRangePickPanel;
    }
    default: {
      return DatePickPanel;
    }
  }
};
function _isSlot$1(s) {
  return typeof s === "function" || Object.prototype.toString.call(s) === "[object Object]" && !isVNode(s);
}
dayjs.extend(localeData);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(dayOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
var DatePickerPanel = defineComponent({
  name: "ElDatePickerPanel",
  install: null,
  props: datePickerPanelProps,
  emits: [UPDATE_MODEL_EVENT, "calendar-change", "panel-change", "visible-change", "pick"],
  setup(props, {
    slots,
    emit
  }) {
    const ns = useNamespace("picker-panel");
    const pickerInjection = inject(PICKER_BASE_INJECTION_KEY, void 0);
    if (isUndefined$1(pickerInjection)) {
      const _props = reactive({
        ...toRefs(props)
      });
      provide(PICKER_BASE_INJECTION_KEY, {
        props: _props
      });
    }
    provide(ROOT_PICKER_INJECTION_KEY, {
      slots,
      pickerNs: ns
    });
    const {
      parsedValue,
      onCalendarChange,
      onPanelChange,
      onSetPickerOption,
      onPick
    } = inject(ROOT_COMMON_PICKER_INJECTION_KEY, () => useCommonPicker(props, emit), true);
    return () => {
      const Component = getPanel(props.type);
      return createVNode(Component, mergeProps(props, {
        "parsedValue": parsedValue.value,
        "onSet-picker-option": onSetPickerOption,
        "onCalendar-change": onCalendarChange,
        "onPanel-change": onPanelChange,
        "onPick": onPick
      }), _isSlot$1(slots) ? slots : {
        default: () => [slots]
      });
    };
  }
});
const ElDatePickerPanel = withInstall(DatePickerPanel);
const datePickerProps = buildProps({
  ...timePickerDefaultProps,
  type: {
    type: definePropType(String),
    default: "date"
  }
});
function _isSlot(s) {
  return typeof s === "function" || Object.prototype.toString.call(s) === "[object Object]" && !isVNode(s);
}
var DatePicker = defineComponent({
  name: "ElDatePicker",
  install: null,
  props: datePickerProps,
  emits: [UPDATE_MODEL_EVENT],
  setup(props, {
    expose,
    emit,
    slots
  }) {
    const isDefaultFormat = computed(() => {
      return !props.format;
    });
    provide(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, isDefaultFormat);
    provide(PICKER_POPPER_OPTIONS_INJECTION_KEY, reactive(toRef(props, "popperOptions")));
    const commonPicker = ref();
    const refProps = {
      focus: () => {
        var _a;
        (_a = commonPicker.value) == null ? void 0 : _a.focus();
      },
      blur: () => {
        var _a;
        (_a = commonPicker.value) == null ? void 0 : _a.blur();
      },
      handleOpen: () => {
        var _a;
        (_a = commonPicker.value) == null ? void 0 : _a.handleOpen();
      },
      handleClose: () => {
        var _a;
        (_a = commonPicker.value) == null ? void 0 : _a.handleClose();
      }
    };
    expose(refProps);
    const onModelValueUpdated = (val) => {
      emit(UPDATE_MODEL_EVENT, val);
    };
    return () => {
      var _a;
      const format = (_a = props.format) != null ? _a : DEFAULT_FORMATS_DATEPICKER[props.type] || DEFAULT_FORMATS_DATE;
      return createVNode(CommonPicker, mergeProps(props, {
        "format": format,
        "type": props.type,
        "ref": commonPicker,
        "onUpdate:modelValue": onModelValueUpdated
      }), {
        default: (scopedProps) => createVNode(ElDatePickerPanel, mergeProps({
          "border": false
        }, scopedProps), _isSlot(slots) ? slots : {
          default: () => [slots]
        }),
        "range-separator": slots["range-separator"]
      });
    };
  }
});
const ElDatePicker = withInstall(DatePicker);
const dialogInjectionKey = Symbol("dialogInjectionKey");
const DEFAULT_DIALOG_TRANSITION = "dialog-fade";
const dialogContentProps = buildProps({
  center: Boolean,
  alignCenter: {
    type: Boolean,
    default: void 0
  },
  closeIcon: {
    type: iconPropType
  },
  draggable: {
    type: Boolean,
    default: void 0
  },
  overflow: {
    type: Boolean,
    default: void 0
  },
  fullscreen: Boolean,
  headerClass: String,
  bodyClass: String,
  footerClass: String,
  showClose: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ""
  },
  ariaLevel: {
    type: String,
    default: "2"
  }
});
const dialogContentEmits = {
  close: () => true
};
const composeRefs = (...refs) => {
  return (el) => {
    refs.forEach((ref2) => {
      ref2.value = el;
    });
  };
};
const __default__$3 = defineComponent({ name: "ElDialogContent" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...__default__$3,
  props: dialogContentProps,
  emits: dialogContentEmits,
  setup(__props, { expose }) {
    const props = __props;
    const { t } = useLocale();
    const { Close } = CloseComponents;
    const { dialogRef, headerRef, bodyId, ns, style } = inject(dialogInjectionKey);
    const { focusTrapRef } = inject(FOCUS_TRAP_INJECTION_KEY);
    const composedDialogRef = composeRefs(focusTrapRef, dialogRef);
    const draggable = computed(() => !!props.draggable);
    const overflow = computed(() => !!props.overflow);
    const { resetPosition, updatePosition, isDragging } = useDraggable(dialogRef, headerRef, draggable, overflow);
    const dialogKls = computed(() => [
      ns.b(),
      ns.is("fullscreen", props.fullscreen),
      ns.is("draggable", draggable.value),
      ns.is("dragging", isDragging.value),
      ns.is("align-center", !!props.alignCenter),
      { [ns.m("center")]: props.center }
    ]);
    expose({
      resetPosition,
      updatePosition
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref: unref(composedDialogRef),
        class: normalizeClass(unref(dialogKls)),
        style: normalizeStyle(unref(style)),
        tabindex: "-1"
      }, [
        createBaseVNode("header", {
          ref_key: "headerRef",
          ref: headerRef,
          class: normalizeClass([unref(ns).e("header"), _ctx.headerClass, { "show-close": _ctx.showClose }])
        }, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            createBaseVNode("span", {
              role: "heading",
              "aria-level": _ctx.ariaLevel,
              class: normalizeClass(unref(ns).e("title"))
            }, toDisplayString(_ctx.title), 11, ["aria-level"])
          ]),
          _ctx.showClose ? (openBlock(), createElementBlock("button", {
            key: 0,
            "aria-label": unref(t)("el.dialog.close"),
            class: normalizeClass(unref(ns).e("headerbtn")),
            type: "button",
            onClick: ($event) => _ctx.$emit("close")
          }, [
            createVNode(unref(ElIcon), {
              class: normalizeClass(unref(ns).e("close"))
            }, {
              default: withCtx(() => [
                (openBlock(), createBlock(resolveDynamicComponent(_ctx.closeIcon || unref(Close))))
              ]),
              _: 1
            }, 8, ["class"])
          ], 10, ["aria-label", "onClick"])) : createCommentVNode("v-if", true)
        ], 2),
        createBaseVNode("div", {
          id: unref(bodyId),
          class: normalizeClass([unref(ns).e("body"), _ctx.bodyClass])
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 10, ["id"]),
        _ctx.$slots.footer ? (openBlock(), createElementBlock("footer", {
          key: 0,
          class: normalizeClass([unref(ns).e("footer"), _ctx.footerClass])
        }, [
          renderSlot(_ctx.$slots, "footer")
        ], 2)) : createCommentVNode("v-if", true)
      ], 6);
    };
  }
});
var ElDialogContent = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "dialog-content.vue"]]);
const dialogProps = buildProps({
  ...dialogContentProps,
  appendToBody: Boolean,
  appendTo: {
    type: teleportProps.to.type,
    default: "body"
  },
  beforeClose: {
    type: definePropType(Function)
  },
  destroyOnClose: Boolean,
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  modal: {
    type: Boolean,
    default: true
  },
  modalPenetrable: Boolean,
  openDelay: {
    type: Number,
    default: 0
  },
  closeDelay: {
    type: Number,
    default: 0
  },
  top: {
    type: String
  },
  modelValue: Boolean,
  modalClass: String,
  headerClass: String,
  bodyClass: String,
  footerClass: String,
  width: {
    type: [String, Number]
  },
  zIndex: {
    type: Number
  },
  trapFocus: Boolean,
  headerAriaLevel: {
    type: String,
    default: "2"
  },
  transition: {
    type: definePropType([String, Object]),
    default: void 0
  }
});
const dialogEmits = {
  open: () => true,
  opened: () => true,
  close: () => true,
  closed: () => true,
  [UPDATE_MODEL_EVENT]: (value) => isBoolean(value),
  openAutoFocus: () => true,
  closeAutoFocus: () => true
};
const useDialog = (props, targetRef) => {
  var _a;
  const instance = getCurrentInstance();
  const emit = instance.emit;
  const { nextZIndex } = useZIndex();
  let lastPosition = "";
  const titleId = useId();
  const bodyId = useId();
  const visible = ref(false);
  const closed = ref(false);
  const rendered = ref(false);
  const zIndex = ref((_a = props.zIndex) != null ? _a : nextZIndex());
  let openTimer = void 0;
  let closeTimer = void 0;
  const config = useGlobalConfig();
  const namespace = computed(() => {
    var _a2, _b;
    return (_b = (_a2 = config.value) == null ? void 0 : _a2.namespace) != null ? _b : defaultNamespace;
  });
  const globalConfig = computed(() => {
    var _a2;
    return (_a2 = config.value) == null ? void 0 : _a2.dialog;
  });
  const style = computed(() => {
    const style2 = {};
    const varPrefix = `--${namespace.value}-dialog`;
    if (!props.fullscreen) {
      if (props.top) {
        style2[`${varPrefix}-margin-top`] = props.top;
      }
      if (props.width) {
        style2[`${varPrefix}-width`] = addUnit(props.width);
      }
    }
    return style2;
  });
  const _draggable = computed(() => {
    var _a2, _b, _c;
    return ((_c = (_b = props.draggable) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.draggable) != null ? _c : false) && !props.fullscreen;
  });
  const _alignCenter = computed(() => {
    var _a2, _b, _c;
    return (_c = (_b = props.alignCenter) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.alignCenter) != null ? _c : false;
  });
  const _overflow = computed(() => {
    var _a2, _b, _c;
    return (_c = (_b = props.overflow) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.overflow) != null ? _c : false;
  });
  const overlayDialogStyle = computed(() => {
    if (_alignCenter.value) {
      return { display: "flex" };
    }
    return {};
  });
  const transitionConfig = computed(() => {
    var _a2, _b, _c;
    const transition = (_c = (_b = props.transition) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.transition) != null ? _c : DEFAULT_DIALOG_TRANSITION;
    const baseConfig = {
      name: transition,
      onAfterEnter: afterEnter,
      onBeforeLeave: beforeLeave,
      onAfterLeave: afterLeave
    };
    if (isObject$1(transition)) {
      const config2 = { ...transition };
      const _mergeHook = (userHook, defaultHook) => {
        return (el) => {
          if (isArray$1(userHook)) {
            userHook.forEach((fn2) => {
              if (isFunction(fn2))
                fn2(el);
            });
          } else if (isFunction(userHook)) {
            userHook(el);
          }
          defaultHook();
        };
      };
      config2.onAfterEnter = _mergeHook(config2.onAfterEnter, afterEnter);
      config2.onBeforeLeave = _mergeHook(config2.onBeforeLeave, beforeLeave);
      config2.onAfterLeave = _mergeHook(config2.onAfterLeave, afterLeave);
      if (!config2.name) {
        config2.name = DEFAULT_DIALOG_TRANSITION;
      }
      return config2;
    }
    return baseConfig;
  });
  function afterEnter() {
    emit("opened");
  }
  function afterLeave() {
    emit("closed");
    emit(UPDATE_MODEL_EVENT, false);
    if (props.destroyOnClose) {
      rendered.value = false;
    }
  }
  function beforeLeave() {
    emit("close");
  }
  function open() {
    closeTimer == null ? void 0 : closeTimer();
    openTimer == null ? void 0 : openTimer();
    if (props.openDelay && props.openDelay > 0) {
      ({ stop: openTimer } = useTimeoutFn(() => doOpen(), props.openDelay));
    } else {
      doOpen();
    }
  }
  function close() {
    openTimer == null ? void 0 : openTimer();
    closeTimer == null ? void 0 : closeTimer();
    if (props.closeDelay && props.closeDelay > 0) {
      ({ stop: closeTimer } = useTimeoutFn(() => doClose(), props.closeDelay));
    } else {
      doClose();
    }
  }
  function handleClose() {
    function hide(shouldCancel) {
      if (shouldCancel)
        return;
      closed.value = true;
      visible.value = false;
    }
    if (props.beforeClose) {
      props.beforeClose(hide);
    } else {
      close();
    }
  }
  function onModalClick() {
    if (props.closeOnClickModal) {
      handleClose();
    }
  }
  function doOpen() {
    if (!isClient)
      return;
    visible.value = true;
  }
  function doClose() {
    visible.value = false;
  }
  function onOpenAutoFocus() {
    emit("openAutoFocus");
  }
  function onCloseAutoFocus() {
    emit("closeAutoFocus");
  }
  function onFocusoutPrevented(event) {
    var _a2;
    if (((_a2 = event.detail) == null ? void 0 : _a2.focusReason) === "pointer") {
      event.preventDefault();
    }
  }
  if (props.lockScroll) {
    useLockscreen(visible);
  }
  function onCloseRequested() {
    if (props.closeOnPressEscape) {
      handleClose();
    }
  }
  watch(() => props.zIndex, () => {
    var _a2;
    zIndex.value = (_a2 = props.zIndex) != null ? _a2 : nextZIndex();
  });
  watch(() => props.modelValue, (val) => {
    var _a2;
    if (val) {
      closed.value = false;
      open();
      rendered.value = true;
      zIndex.value = (_a2 = props.zIndex) != null ? _a2 : nextZIndex();
      nextTick(() => {
        emit("open");
        if (targetRef.value) {
          targetRef.value.parentElement.scrollTop = 0;
          targetRef.value.parentElement.scrollLeft = 0;
          targetRef.value.scrollTop = 0;
        }
      });
    } else {
      if (visible.value) {
        close();
      }
    }
  });
  watch(() => props.fullscreen, (val) => {
    if (!targetRef.value)
      return;
    if (val) {
      lastPosition = targetRef.value.style.transform;
      targetRef.value.style.transform = "";
    } else {
      targetRef.value.style.transform = lastPosition;
    }
  });
  onMounted(() => {
    if (props.modelValue) {
      visible.value = true;
      rendered.value = true;
      open();
    }
  });
  return {
    afterEnter,
    afterLeave,
    beforeLeave,
    handleClose,
    onModalClick,
    close,
    doClose,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onCloseRequested,
    onFocusoutPrevented,
    titleId,
    bodyId,
    closed,
    style,
    overlayDialogStyle,
    rendered,
    visible,
    zIndex,
    transitionConfig,
    _draggable,
    _alignCenter,
    _overflow
  };
};
const __default__$2 = defineComponent({
  name: "ElDialog",
  inheritAttrs: false
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...__default__$2,
  props: dialogProps,
  emits: dialogEmits,
  setup(__props, { expose }) {
    const props = __props;
    const slots = useSlots();
    useDeprecated({
      scope: "el-dialog",
      from: "the title slot",
      replacement: "the header slot",
      version: "3.0.0",
      ref: "https://element-plus.org/en-US/component/dialog.html#slots"
    }, computed(() => !!slots.title));
    const ns = useNamespace("dialog");
    const dialogRef = ref();
    const headerRef = ref();
    const dialogContentRef = ref();
    const {
      visible,
      titleId,
      bodyId,
      style,
      overlayDialogStyle,
      rendered,
      transitionConfig,
      zIndex,
      _draggable,
      _alignCenter,
      _overflow,
      handleClose,
      onModalClick,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onCloseRequested,
      onFocusoutPrevented
    } = useDialog(props, dialogRef);
    provide(dialogInjectionKey, {
      dialogRef,
      headerRef,
      bodyId,
      ns,
      rendered,
      style
    });
    const overlayEvent = useSameTarget(onModalClick);
    const penetrable = computed(() => props.modalPenetrable && !props.modal && !props.fullscreen);
    const resetPosition = () => {
      var _a;
      (_a = dialogContentRef.value) == null ? void 0 : _a.resetPosition();
    };
    expose({
      visible,
      dialogContentRef,
      resetPosition,
      handleClose
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElTeleport), {
        to: _ctx.appendTo,
        disabled: _ctx.appendTo !== "body" ? false : !_ctx.appendToBody
      }, {
        default: withCtx(() => [
          createVNode(Transition, mergeProps(unref(transitionConfig), { persisted: "" }), {
            default: withCtx(() => {
              var _a;
              return [
                withDirectives(createVNode(unref(ElOverlay), {
                  "custom-mask-event": "",
                  mask: _ctx.modal,
                  "overlay-class": [
                    (_a = _ctx.modalClass) != null ? _a : "",
                    `${unref(ns).namespace.value}-modal-dialog`,
                    unref(ns).is("penetrable", unref(penetrable))
                  ],
                  "z-index": unref(zIndex)
                }, {
                  default: withCtx(() => [
                    createBaseVNode("div", {
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": _ctx.title || void 0,
                      "aria-labelledby": !_ctx.title ? unref(titleId) : void 0,
                      "aria-describedby": unref(bodyId),
                      class: normalizeClass(`${unref(ns).namespace.value}-overlay-dialog`),
                      style: normalizeStyle(unref(overlayDialogStyle)),
                      onClick: unref(overlayEvent).onClick,
                      onMousedown: unref(overlayEvent).onMousedown,
                      onMouseup: unref(overlayEvent).onMouseup
                    }, [
                      createVNode(unref(ElFocusTrap), {
                        loop: "",
                        trapped: unref(visible),
                        "focus-start-el": "container",
                        onFocusAfterTrapped: unref(onOpenAutoFocus),
                        onFocusAfterReleased: unref(onCloseAutoFocus),
                        onFocusoutPrevented: unref(onFocusoutPrevented),
                        onReleaseRequested: unref(onCloseRequested)
                      }, {
                        default: withCtx(() => [
                          unref(rendered) ? (openBlock(), createBlock(ElDialogContent, mergeProps({
                            key: 0,
                            ref_key: "dialogContentRef",
                            ref: dialogContentRef
                          }, _ctx.$attrs, {
                            center: _ctx.center,
                            "align-center": unref(_alignCenter),
                            "close-icon": _ctx.closeIcon,
                            draggable: unref(_draggable),
                            overflow: unref(_overflow),
                            fullscreen: _ctx.fullscreen,
                            "header-class": _ctx.headerClass,
                            "body-class": _ctx.bodyClass,
                            "footer-class": _ctx.footerClass,
                            "show-close": _ctx.showClose,
                            title: _ctx.title,
                            "aria-level": _ctx.headerAriaLevel,
                            onClose: unref(handleClose)
                          }), createSlots({
                            header: withCtx(() => [
                              !_ctx.$slots.title ? renderSlot(_ctx.$slots, "header", {
                                key: 0,
                                close: unref(handleClose),
                                titleId: unref(titleId),
                                titleClass: unref(ns).e("title")
                              }) : renderSlot(_ctx.$slots, "title", { key: 1 })
                            ]),
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "default")
                            ]),
                            _: 2
                          }, [
                            _ctx.$slots.footer ? {
                              name: "footer",
                              fn: withCtx(() => [
                                renderSlot(_ctx.$slots, "footer")
                              ])
                            } : void 0
                          ]), 1040, ["center", "align-center", "close-icon", "draggable", "overflow", "fullscreen", "header-class", "body-class", "footer-class", "show-close", "title", "aria-level", "onClose"])) : createCommentVNode("v-if", true)
                        ]),
                        _: 3
                      }, 8, ["trapped", "onFocusAfterTrapped", "onFocusAfterReleased", "onFocusoutPrevented", "onReleaseRequested"])
                    ], 46, ["aria-label", "aria-labelledby", "aria-describedby", "onClick", "onMousedown", "onMouseup"])
                  ]),
                  _: 3
                }, 8, ["mask", "overlay-class", "z-index"]), [
                  [vShow, unref(visible)]
                ])
              ];
            }),
            _: 3
          }, 16)
        ]),
        _: 3
      }, 8, ["to", "disabled"]);
    };
  }
});
var Dialog = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "dialog.vue"]]);
const ElDialog = withInstall(Dialog);
const __default__$1 = defineComponent({
  name: "ImgEmpty"
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...__default__$1,
  setup(__props) {
    const ns = useNamespace("empty");
    const id = useId();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        viewBox: "0 0 79 86",
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink"
      }, [
        createBaseVNode("defs", null, [
          createBaseVNode("linearGradient", {
            id: `linearGradient-1-${unref(id)}`,
            x1: "38.8503086%",
            y1: "0%",
            x2: "61.1496914%",
            y2: "100%"
          }, [
            createBaseVNode("stop", {
              "stop-color": `var(${unref(ns).cssVarBlockName("fill-color-1")})`,
              offset: "0%"
            }, null, 8, ["stop-color"]),
            createBaseVNode("stop", {
              "stop-color": `var(${unref(ns).cssVarBlockName("fill-color-4")})`,
              offset: "100%"
            }, null, 8, ["stop-color"])
          ], 8, ["id"]),
          createBaseVNode("linearGradient", {
            id: `linearGradient-2-${unref(id)}`,
            x1: "0%",
            y1: "9.5%",
            x2: "100%",
            y2: "90.5%"
          }, [
            createBaseVNode("stop", {
              "stop-color": `var(${unref(ns).cssVarBlockName("fill-color-1")})`,
              offset: "0%"
            }, null, 8, ["stop-color"]),
            createBaseVNode("stop", {
              "stop-color": `var(${unref(ns).cssVarBlockName("fill-color-6")})`,
              offset: "100%"
            }, null, 8, ["stop-color"])
          ], 8, ["id"]),
          createBaseVNode("rect", {
            id: `path-3-${unref(id)}`,
            x: "0",
            y: "0",
            width: "17",
            height: "36"
          }, null, 8, ["id"])
        ]),
        createBaseVNode("g", {
          stroke: "none",
          "stroke-width": "1",
          fill: "none",
          "fill-rule": "evenodd"
        }, [
          createBaseVNode("g", { transform: "translate(-1268.000000, -535.000000)" }, [
            createBaseVNode("g", { transform: "translate(1268.000000, 535.000000)" }, [
              createBaseVNode("path", {
                d: "M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z",
                fill: `var(${unref(ns).cssVarBlockName("fill-color-3")})`
              }, null, 8, ["fill"]),
              createBaseVNode("polygon", {
                fill: `var(${unref(ns).cssVarBlockName("fill-color-7")})`,
                transform: "translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) ",
                points: "13 58 53 58 42 45 2 45"
              }, null, 8, ["fill"]),
              createBaseVNode("g", { transform: "translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)" }, [
                createBaseVNode("polygon", {
                  fill: `var(${unref(ns).cssVarBlockName("fill-color-7")})`,
                  transform: "translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) ",
                  points: "2.84078316e-14 3 18 3 23 7 5 7"
                }, null, 8, ["fill"]),
                createBaseVNode("polygon", {
                  fill: `var(${unref(ns).cssVarBlockName("fill-color-5")})`,
                  points: "-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43"
                }, null, 8, ["fill"]),
                createBaseVNode("rect", {
                  fill: `url(#linearGradient-1-${unref(id)})`,
                  transform: "translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) ",
                  x: "38",
                  y: "7",
                  width: "17",
                  height: "36"
                }, null, 8, ["fill"]),
                createBaseVNode("polygon", {
                  fill: `var(${unref(ns).cssVarBlockName("fill-color-2")})`,
                  transform: "translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) ",
                  points: "24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12"
                }, null, 8, ["fill"])
              ]),
              createBaseVNode("rect", {
                fill: `url(#linearGradient-2-${unref(id)})`,
                x: "13",
                y: "45",
                width: "40",
                height: "36"
              }, null, 8, ["fill"]),
              createBaseVNode("g", { transform: "translate(53.000000, 45.000000)" }, [
                createBaseVNode("use", {
                  fill: `var(${unref(ns).cssVarBlockName("fill-color-8")})`,
                  transform: "translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) ",
                  "xlink:href": `#path-3-${unref(id)}`
                }, null, 8, ["fill", "xlink:href"]),
                createBaseVNode("polygon", {
                  fill: `var(${unref(ns).cssVarBlockName("fill-color-9")})`,
                  mask: `url(#mask-4-${unref(id)})`,
                  transform: "translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) ",
                  points: "7 0 24 0 20 18 7 16.5"
                }, null, 8, ["fill", "mask"])
              ]),
              createBaseVNode("polygon", {
                fill: `var(${unref(ns).cssVarBlockName("fill-color-2")})`,
                transform: "translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) ",
                points: "62 45 79 45 70 58 53 58"
              }, null, 8, ["fill"])
            ])
          ])
        ])
      ]);
    };
  }
});
var ImgEmpty = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "img-empty.vue"]]);
const emptyProps = buildProps({
  image: {
    type: String,
    default: ""
  },
  imageSize: Number,
  description: {
    type: String,
    default: ""
  }
});
const __default__ = defineComponent({
  name: "ElEmpty"
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: emptyProps,
  setup(__props) {
    const props = __props;
    const { t } = useLocale();
    const ns = useNamespace("empty");
    const emptyDescription = computed(() => props.description || t("el.table.emptyText"));
    const imageStyle = computed(() => ({
      width: addUnit(props.imageSize)
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(unref(ns).b())
      }, [
        createBaseVNode("div", {
          class: normalizeClass(unref(ns).e("image")),
          style: normalizeStyle(unref(imageStyle))
        }, [
          _ctx.image ? (openBlock(), createElementBlock("img", {
            key: 0,
            src: _ctx.image,
            ondragstart: "return false"
          }, null, 8, ["src"])) : renderSlot(_ctx.$slots, "image", { key: 1 }, () => [
            createVNode(ImgEmpty)
          ])
        ], 6),
        createBaseVNode("div", {
          class: normalizeClass(unref(ns).e("description"))
        }, [
          _ctx.$slots.description ? renderSlot(_ctx.$slots, "description", { key: 0 }) : (openBlock(), createElementBlock("p", { key: 1 }, toDisplayString(unref(emptyDescription)), 1))
        ], 2),
        _ctx.$slots.default ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("bottom"))
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var Empty = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "empty.vue"]]);
const ElEmpty = withInstall(Empty);
const _hoisted_1 = { class: "statistics-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "actions" };
const _hoisted_4 = {
  key: 0,
  class: "loading-container"
};
const _hoisted_5 = {
  key: 1,
  class: "stats-container"
};
const _hoisted_6 = { class: "stats-grid" };
const _hoisted_7 = { class: "stat-card primary" };
const _hoisted_8 = { class: "stat-content" };
const _hoisted_9 = { class: "stat-value" };
const _hoisted_10 = { class: "stat-card success" };
const _hoisted_11 = { class: "stat-content" };
const _hoisted_12 = { class: "stat-value" };
const _hoisted_13 = { class: "stat-card warning" };
const _hoisted_14 = { class: "stat-content" };
const _hoisted_15 = { class: "stat-value" };
const _hoisted_16 = { class: "stat-card info" };
const _hoisted_17 = { class: "stat-content" };
const _hoisted_18 = { class: "stat-value" };
const _hoisted_19 = { class: "stat-card primary" };
const _hoisted_20 = { class: "stat-content" };
const _hoisted_21 = { class: "stat-value" };
const _hoisted_22 = { class: "stat-card secondary" };
const _hoisted_23 = { class: "stat-content" };
const _hoisted_24 = { class: "stat-value" };
const _hoisted_25 = { class: "charts-section" };
const _hoisted_26 = { class: "charts-row" };
const _hoisted_27 = { class: "chart-card" };
const _hoisted_28 = { class: "chart-card" };
const _hoisted_29 = { class: "chart-card" };
const _hoisted_30 = { class: "charts-row" };
const _hoisted_31 = { class: "chart-card" };
const _hoisted_32 = { class: "chart-card" };
const _hoisted_33 = {
  key: 2,
  class: "empty-state"
};
const _hoisted_34 = { class: "export-form" };
const _hoisted_35 = { class: "export-section" };
const _hoisted_36 = { class: "export-section" };
const _hoisted_37 = { class: "export-section" };
const _hoisted_38 = { class: "dialog-footer" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StatisticsNew",
  setup(__props) {
    const loading = ref(false);
    const showExportDialog = ref(false);
    const exporting = ref(false);
    const exportFormat = ref("excel");
    const exportData = ref(["books", "statistics", "annual"]);
    const dateRange = ref([]);
    const data = ref(null);
    const statusChartRef = ref();
    const categoryChartRef = ref();
    const platformChartRef = ref();
    const wordCountChartRef = ref();
    const ratingChartRef = ref();
    let statusChartInstance = null;
    let categoryChartInstance = null;
    let platformChartInstance = null;
    let wordCountChartInstance = null;
    let ratingChartInstance = null;
    const formatNumber = (num) => {
      if (num >= 1e8) {
        return (num / 1e8).toFixed(1) + "亿";
      } else if (num >= 1e4) {
        return (num / 1e4).toFixed(1) + "万";
      }
      return num.toString();
    };
    const createStatusChart = () => {
      if (!statusChartRef.value || !data.value) return;
      try {
        __vitePreload(() => import("./index-BcuNY49p.js"), true ? [] : void 0, import.meta.url).then((echarts) => {
          if (statusChartInstance) {
            statusChartInstance.dispose();
          }
          statusChartInstance = echarts.init(statusChartRef.value);
          const option = {
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow"
              }
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "3%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              data: ["已读完", "阅读中", "未读"],
              axisTick: {
                alignWithLabel: true
              }
            },
            yAxis: {
              type: "value"
            },
            series: [
              {
                name: "书籍数量",
                type: "bar",
                barWidth: "60%",
                data: [
                  { value: data.value.finishedBooks, itemStyle: { color: "#10b981" } },
                  { value: data.value.readingBooks, itemStyle: { color: "#3b82f6" } },
                  { value: data.value.unreadBooks, itemStyle: { color: "#6b7280" } }
                ]
              }
            ]
          };
          statusChartInstance.setOption(option);
        });
      } catch (error) {
        console.error("阅读状态图表创建失败:", error);
      }
    };
    const createCategoryChart = () => {
      if (!categoryChartRef.value || !data.value || !data.value.books) return;
      try {
        __vitePreload(() => import("./index-BcuNY49p.js"), true ? [] : void 0, import.meta.url).then((echarts) => {
          if (categoryChartInstance) {
            categoryChartInstance.dispose();
          }
          categoryChartInstance = echarts.init(categoryChartRef.value);
          const categoryMap = /* @__PURE__ */ new Map();
          data.value.books.forEach((book) => {
            const category = book.category || "未分类";
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
          });
          const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value
          }));
          const option = {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
              orient: "vertical",
              left: "left"
            },
            series: [
              {
                name: "书籍类型",
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: "#fff",
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: "center"
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: "20",
                    fontWeight: "bold"
                  }
                },
                labelLine: {
                  show: false
                },
                data: categoryData
              }
            ]
          };
          categoryChartInstance.setOption(option);
        });
      } catch (error) {
        console.error("类型分布图表创建失败:", error);
      }
    };
    const createPlatformChart = () => {
      if (!platformChartRef.value || !data.value || !data.value.books) return;
      try {
        __vitePreload(() => import("./index-BcuNY49p.js"), true ? [] : void 0, import.meta.url).then((echarts) => {
          if (platformChartInstance) {
            platformChartInstance.dispose();
          }
          platformChartInstance = echarts.init(platformChartRef.value);
          const platformMap = /* @__PURE__ */ new Map();
          data.value.books.forEach((book) => {
            const platform = book.platform || "未知平台";
            platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
          });
          const platformData = Array.from(platformMap.entries()).map(([name, value]) => ({
            name,
            value
          }));
          const option = {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
              orient: "vertical",
              left: "left"
            },
            series: [
              {
                name: "阅读平台",
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: "#fff",
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: "center"
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: "20",
                    fontWeight: "bold"
                  }
                },
                labelLine: {
                  show: false
                },
                data: platformData
              }
            ]
          };
          platformChartInstance.setOption(option);
        });
      } catch (error) {
        console.error("平台分布图表创建失败:", error);
      }
    };
    const createWordCountChart = () => {
      if (!wordCountChartRef.value || !data.value || !data.value.books) return;
      try {
        __vitePreload(() => import("./index-BcuNY49p.js"), true ? [] : void 0, import.meta.url).then((echarts) => {
          if (wordCountChartInstance) {
            wordCountChartInstance.dispose();
          }
          wordCountChartInstance = echarts.init(wordCountChartRef.value);
          const wordCountRanges = [
            { name: "10万字以下", min: 0, max: 1e5, count: 0 },
            { name: "10-30万字", min: 1e5, max: 3e5, count: 0 },
            { name: "30-50万字", min: 3e5, max: 5e5, count: 0 },
            { name: "50-100万字", min: 5e5, max: 1e6, count: 0 },
            { name: "100万字以上", min: 1e6, max: Infinity, count: 0 }
          ];
          data.value.books.forEach((book) => {
            const wordCount = book.wordCount || 0;
            const range = wordCountRanges.find((r) => wordCount >= r.min && wordCount < r.max);
            if (range) {
              range.count++;
            }
          });
          const wordCountData = wordCountRanges.filter((range) => range.count > 0).map((range) => ({
            name: range.name,
            value: range.count
          }));
          const option = {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
              orient: "vertical",
              left: "left"
            },
            series: [
              {
                name: "字数分布",
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: "#fff",
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: "center"
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: "20",
                    fontWeight: "bold"
                  }
                },
                labelLine: {
                  show: false
                },
                data: wordCountData
              }
            ]
          };
          wordCountChartInstance.setOption(option);
        });
      } catch (error) {
        console.error("字数分布图表创建失败:", error);
      }
    };
    const createRatingChart = () => {
      if (!ratingChartRef.value || !data.value || !data.value.books) return;
      try {
        __vitePreload(() => import("./index-BcuNY49p.js"), true ? [] : void 0, import.meta.url).then((echarts) => {
          if (ratingChartInstance) {
            ratingChartInstance.dispose();
          }
          ratingChartInstance = echarts.init(ratingChartRef.value);
          const ratingRanges = [
            { name: "未评分", min: 0, max: 0.1, count: 0 },
            { name: "1-2星", min: 1, max: 2.1, count: 0 },
            { name: "2-3星", min: 2, max: 3.1, count: 0 },
            { name: "3-4星", min: 3, max: 4.1, count: 0 },
            { name: "4-5星", min: 4, max: 5.1, count: 0 }
          ];
          data.value.books.forEach((book) => {
            const rating = book.rating || 0;
            const range = ratingRanges.find((r) => rating >= r.min && rating < r.max);
            if (range) {
              range.count++;
            }
          });
          const ratingData = ratingRanges.filter((range) => range.count > 0).map((range) => ({
            name: range.name,
            value: range.count
          }));
          const option = {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
              orient: "vertical",
              left: "left"
            },
            series: [
              {
                name: "评分分布",
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: "#fff",
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: "center"
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: "20",
                    fontWeight: "bold"
                  }
                },
                labelLine: {
                  show: false
                },
                data: ratingData
              }
            ]
          };
          ratingChartInstance.setOption(option);
        });
      } catch (error) {
        console.error("评分分布图表创建失败:", error);
      }
    };
    const fetchData = async () => {
      loading.value = true;
      try {
        console.log("获取统计数据...");
        const response = await window.api.stats?.getOverview();
        console.log("统计响应:", response);
        if (response && response.success && response.data) {
          data.value = response.data;
          console.log("数据加载成功:", data.value);
          setTimeout(() => {
            createStatusChart();
            createCategoryChart();
            createPlatformChart();
            createWordCountChart();
            createRatingChart();
          }, 100);
        } else {
          throw new Error(response?.error || "获取数据失败");
        }
      } catch (error) {
        console.error("获取统计数据失败:", error);
        ElMessage.error("获取统计数据失败");
      } finally {
        loading.value = false;
      }
    };
    const refreshData = () => {
      if (statusChartInstance) {
        statusChartInstance.dispose();
        statusChartInstance = null;
      }
      if (categoryChartInstance) {
        categoryChartInstance.dispose();
        categoryChartInstance = null;
      }
      if (platformChartInstance) {
        platformChartInstance.dispose();
        platformChartInstance = null;
      }
      if (wordCountChartInstance) {
        wordCountChartInstance.dispose();
        wordCountChartInstance = null;
      }
      if (ratingChartInstance) {
        ratingChartInstance.dispose();
        ratingChartInstance = null;
      }
      fetchData();
      ElMessage.success("数据已刷新");
    };
    const handleExport = async () => {
      exporting.value = true;
      try {
        console.log("开始导出数据...", {
          format: exportFormat.value,
          dataTypes: exportData.value,
          dateRange: dateRange.value
        });
        const exportOptions = {
          format: exportFormat.value,
          dateRange: dateRange.value.length === 2 ? {
            start: dateRange.value[0],
            end: dateRange.value[1]
          } : void 0,
          dataTypes: {
            books: exportData.value.includes("books"),
            statistics: exportData.value.includes("statistics"),
            annual: exportData.value.includes("annual")
          }
        };
        const response = await window.api.stats?.exportData(exportOptions);
        if (response && response.success) {
          ElMessage.success(`数据导出成功！文件：${response.data?.fileName || "导出文件"}`);
          showExportDialog.value = false;
          exportFormat.value = "excel";
          exportData.value = ["books", "statistics", "annual"];
          dateRange.value = [];
        } else {
          throw new Error(response?.error || "导出失败");
        }
      } catch (error) {
        console.error("导出数据失败:", error);
        ElMessage.error("导出数据失败，请重试");
      } finally {
        exporting.value = false;
      }
    };
    onMounted(() => {
      console.log("统计分析页面加载");
      fetchData();
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_icon = ElIcon;
      const _component_el_empty = ElEmpty;
      const _component_el_radio = ElRadio;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_checkbox_group = ElCheckboxGroup;
      const _component_el_date_picker = ElDatePicker;
      const _component_el_dialog = ElDialog;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[9] || (_cache[9] = createBaseVNode("h1", null, "统计分析", -1)),
          _cache[10] || (_cache[10] = createBaseVNode("p", { class: "subtitle" }, "查看您的阅读数据和统计信息", -1)),
          createBaseVNode("div", _hoisted_3, [
            createVNode(_component_el_button, {
              onClick: refreshData,
              loading: loading.value
            }, {
              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                createTextVNode("刷新数据", -1)
              ])]),
              _: 1
            }, 8, ["loading"]),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: _cache[0] || (_cache[0] = ($event) => showExportDialog.value = true)
            }, {
              default: withCtx(() => [..._cache[8] || (_cache[8] = [
                createTextVNode("导出数据", -1)
              ])]),
              _: 1
            })
          ])
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
          createVNode(_component_el_icon, { class: "is-loading" }, {
            default: withCtx(() => [
              createVNode(unref(loading_default))
            ]),
            _: 1
          }),
          _cache[11] || (_cache[11] = createBaseVNode("p", null, "正在加载统计数据...", -1))
        ])) : data.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              _cache[13] || (_cache[13] = createBaseVNode("div", { class: "stat-icon" }, "📚", -1)),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("div", _hoisted_9, toDisplayString(data.value.totalBooks), 1),
                _cache[12] || (_cache[12] = createBaseVNode("div", { class: "stat-label" }, "总书籍数", -1))
              ])
            ]),
            createBaseVNode("div", _hoisted_10, [
              _cache[15] || (_cache[15] = createBaseVNode("div", { class: "stat-icon" }, "📖", -1)),
              createBaseVNode("div", _hoisted_11, [
                createBaseVNode("div", _hoisted_12, toDisplayString(formatNumber(data.value.totalWordCount)), 1),
                _cache[14] || (_cache[14] = createBaseVNode("div", { class: "stat-label" }, "总字数", -1))
              ])
            ]),
            createBaseVNode("div", _hoisted_13, [
              _cache[17] || (_cache[17] = createBaseVNode("div", { class: "stat-icon" }, "⭐", -1)),
              createBaseVNode("div", _hoisted_14, [
                createBaseVNode("div", _hoisted_15, toDisplayString(data.value.averageRating.toFixed(1)), 1),
                _cache[16] || (_cache[16] = createBaseVNode("div", { class: "stat-label" }, "平均评分", -1))
              ])
            ]),
            createBaseVNode("div", _hoisted_16, [
              _cache[19] || (_cache[19] = createBaseVNode("div", { class: "stat-icon" }, "✅", -1)),
              createBaseVNode("div", _hoisted_17, [
                createBaseVNode("div", _hoisted_18, toDisplayString(data.value.finishedBooks), 1),
                _cache[18] || (_cache[18] = createBaseVNode("div", { class: "stat-label" }, "已读完", -1))
              ])
            ]),
            createBaseVNode("div", _hoisted_19, [
              _cache[21] || (_cache[21] = createBaseVNode("div", { class: "stat-icon" }, "📖", -1)),
              createBaseVNode("div", _hoisted_20, [
                createBaseVNode("div", _hoisted_21, toDisplayString(data.value.readingBooks), 1),
                _cache[20] || (_cache[20] = createBaseVNode("div", { class: "stat-label" }, "阅读中", -1))
              ])
            ]),
            createBaseVNode("div", _hoisted_22, [
              _cache[23] || (_cache[23] = createBaseVNode("div", { class: "stat-icon" }, "📋", -1)),
              createBaseVNode("div", _hoisted_23, [
                createBaseVNode("div", _hoisted_24, toDisplayString(data.value.unreadBooks), 1),
                _cache[22] || (_cache[22] = createBaseVNode("div", { class: "stat-label" }, "未读", -1))
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_25, [
            createBaseVNode("div", _hoisted_26, [
              createBaseVNode("div", _hoisted_27, [
                _cache[24] || (_cache[24] = createBaseVNode("h3", null, "阅读状态分布", -1)),
                createBaseVNode("div", {
                  ref_key: "statusChartRef",
                  ref: statusChartRef,
                  class: "chart"
                }, null, 512)
              ]),
              createBaseVNode("div", _hoisted_28, [
                _cache[25] || (_cache[25] = createBaseVNode("h3", null, "类型分布", -1)),
                createBaseVNode("div", {
                  ref_key: "categoryChartRef",
                  ref: categoryChartRef,
                  class: "chart"
                }, null, 512)
              ]),
              createBaseVNode("div", _hoisted_29, [
                _cache[26] || (_cache[26] = createBaseVNode("h3", null, "平台分布", -1)),
                createBaseVNode("div", {
                  ref_key: "platformChartRef",
                  ref: platformChartRef,
                  class: "chart"
                }, null, 512)
              ])
            ]),
            createBaseVNode("div", _hoisted_30, [
              createBaseVNode("div", _hoisted_31, [
                _cache[27] || (_cache[27] = createBaseVNode("h3", null, "字数分布", -1)),
                createBaseVNode("div", {
                  ref_key: "wordCountChartRef",
                  ref: wordCountChartRef,
                  class: "chart"
                }, null, 512)
              ]),
              createBaseVNode("div", _hoisted_32, [
                _cache[28] || (_cache[28] = createBaseVNode("h3", null, "评分分布", -1)),
                createBaseVNode("div", {
                  ref_key: "ratingChartRef",
                  ref: ratingChartRef,
                  class: "chart"
                }, null, 512)
              ])
            ])
          ])
        ])) : (openBlock(), createElementBlock("div", _hoisted_33, [
          createVNode(_component_el_empty, { description: "暂无统计数据" }, {
            default: withCtx(() => [
              createVNode(_component_el_button, {
                type: "primary",
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$router.push("/add"))
              }, {
                default: withCtx(() => [..._cache[29] || (_cache[29] = [
                  createTextVNode("添加第一本书", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ])),
        createVNode(_component_el_dialog, {
          modelValue: showExportDialog.value,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => showExportDialog.value = $event),
          title: "导出数据",
          width: "500px"
        }, {
          footer: withCtx(() => [
            createBaseVNode("div", _hoisted_38, [
              createVNode(_component_el_button, {
                onClick: _cache[5] || (_cache[5] = ($event) => showExportDialog.value = false)
              }, {
                default: withCtx(() => [..._cache[38] || (_cache[38] = [
                  createTextVNode("取消", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: handleExport,
                loading: exporting.value,
                disabled: exportData.value.length === 0
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(exporting.value ? "导出中..." : "导出"), 1)
                ]),
                _: 1
              }, 8, ["loading", "disabled"])
            ])
          ]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_34, [
              createBaseVNode("div", _hoisted_35, [
                _cache[32] || (_cache[32] = createBaseVNode("h4", null, "导出格式", -1)),
                createVNode(_component_el_radio_group, {
                  modelValue: exportFormat.value,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => exportFormat.value = $event)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_radio, { label: "excel" }, {
                      default: withCtx(() => [..._cache[30] || (_cache[30] = [
                        createTextVNode("Excel文件 (.xlsx)", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_radio, { label: "csv" }, {
                      default: withCtx(() => [..._cache[31] || (_cache[31] = [
                        createTextVNode("CSV文件 (.csv)", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              createBaseVNode("div", _hoisted_36, [
                _cache[36] || (_cache[36] = createBaseVNode("h4", null, "包含数据", -1)),
                createVNode(_component_el_checkbox_group, {
                  modelValue: exportData.value,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => exportData.value = $event)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_checkbox, { label: "books" }, {
                      default: withCtx(() => [..._cache[33] || (_cache[33] = [
                        createTextVNode("书籍信息", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_checkbox, { label: "statistics" }, {
                      default: withCtx(() => [..._cache[34] || (_cache[34] = [
                        createTextVNode("统计数据", -1)
                      ])]),
                      _: 1
                    }),
                    createVNode(_component_el_checkbox, { label: "annual" }, {
                      default: withCtx(() => [..._cache[35] || (_cache[35] = [
                        createTextVNode("年度报告", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              createBaseVNode("div", _hoisted_37, [
                _cache[37] || (_cache[37] = createBaseVNode("h4", null, "时间范围（可选）", -1)),
                createVNode(_component_el_date_picker, {
                  modelValue: dateRange.value,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => dateRange.value = $event),
                  type: "daterange",
                  "range-separator": "至",
                  "start-placeholder": "开始日期",
                  "end-placeholder": "结束日期",
                  format: "YYYY-MM-DD",
                  "value-format": "YYYY-MM-DD",
                  style: { "width": "100%" }
                }, null, 8, ["modelValue"])
              ])
            ])
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
const StatisticsNew = /* @__PURE__ */ _export_sfc$1(_sfc_main, [["__scopeId", "data-v-d32e6721"]]);
export {
  StatisticsNew as default
};
