"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // 书籍操作
  book: {
    create: (input) => electron.ipcRenderer.invoke("book:create", input),
    update: (id, input) => electron.ipcRenderer.invoke("book:update", id, input),
    delete: (id) => electron.ipcRenderer.invoke("book:delete", id),
    deleteBatch: (ids) => electron.ipcRenderer.invoke("book:deleteBatch", ids),
    getById: (id) => electron.ipcRenderer.invoke("book:getById", id),
    getAll: () => electron.ipcRenderer.invoke("book:getAll"),
    search: (keyword) => electron.ipcRenderer.invoke("book:search", keyword)
  },
  // 文档操作
  document: {
    selectFile: () => electron.ipcRenderer.invoke("document:selectFile"),
    upload: (filePath, bookId) => electron.ipcRenderer.invoke("document:upload", filePath, bookId),
    delete: (id) => electron.ipcRenderer.invoke("document:delete", id),
    open: (fileName) => electron.ipcRenderer.invoke("document:open", fileName),
    countWords: (fileName) => electron.ipcRenderer.invoke("document:countWords", fileName),
    getByBookId: (bookId) => electron.ipcRenderer.invoke("document:getByBookId", bookId),
    update: (id, input) => electron.ipcRenderer.invoke("document:update", id, input)
  },
  // 搜索操作
  search: {
    youshu: (keyword) => electron.ipcRenderer.invoke("search:youshu", keyword),
    detail: (sourceUrl) => electron.ipcRenderer.invoke("search:youshuDetail", sourceUrl),
    downloadCover: (url, title) => electron.ipcRenderer.invoke("search:downloadCover", { url, title })
  },
  // 统计分析操作
  stats: {
    // 获取总体统计数据
    getOverview: () => electron.ipcRenderer.invoke("stats:getOverview"),
    // 获取分类统计数据
    getCategoryStats: () => electron.ipcRenderer.invoke("stats:getCategoryStats"),
    // 获取平台统计数据
    getPlatformStats: () => electron.ipcRenderer.invoke("stats:getPlatformStats"),
    // 获取阅读状态统计数据
    getStatusStats: () => electron.ipcRenderer.invoke("stats:getStatusStats"),
    // 获取月度统计数据
    getMonthlyStats: (months) => electron.ipcRenderer.invoke("stats:getMonthlyStats", months),
    // 导出统计数据
    exportData: (options) => electron.ipcRenderer.invoke("stats:exportData", options),
    // 导出年度报告
    exportYearlyReport: (year) => electron.ipcRenderer.invoke("stats:exportYearlyReport", year),
    // 获取指定年份的统计数据
    getYearlyStats: (year) => electron.ipcRenderer.invoke("stats:getYearlyStats", year),
    // 重新计算统计数据
    recalculateStats: () => electron.ipcRenderer.invoke("stats:recalculateStats")
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
