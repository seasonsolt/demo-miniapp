Page({
  data: {
    showTestDataEntry: false
  },

  onLoad(options) {
    this.applyEntryOptions(options || {});
  },

  onShow() {
    this.syncTestDataVisibility();
  },

  goHealth() {
    wx.navigateTo({
      url: "/pages/health/health"
    });
  },

  goSession() {
    wx.navigateTo({
      url: "/pages/session/session"
    });
  },

  goProbe() {
    wx.navigateTo({
      url: "/pages/probe/probe"
    });
  },

  goError() {
    wx.navigateTo({
      url: "/pages/error/error"
    });
  },

  goTestData() {
    wx.navigateTo({
      url: "/pages/test-data/test-data"
    });
  },

  applyEntryOptions(options) {
    const app = getApp();
    if (options.apiBase) {
      app.globalData.apiBase = decodeURIComponent(options.apiBase);
    }
    if (options.e2e !== undefined) {
      app.globalData.e2eMode = options.e2e === "1";
    }
    if (options.resetSession === "1") {
      app.globalData.sessionToken = "";
    }
    this.syncTestDataVisibility();
  },

  syncTestDataVisibility() {
    const app = getApp();
    this.setData({
      showTestDataEntry: app.globalData.e2eMode && !!app.globalData.sessionToken
    });
  }
});
