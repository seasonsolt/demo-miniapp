App({
  globalData: {
    apiBase: "http://127.0.0.1:18082",
    sessionToken: "",
    e2eMode: false
  },

  onLaunch(options) {
    this.applyLaunchQuery((options && options.query) || {});
  },

  onShow(options) {
    this.applyLaunchQuery((options && options.query) || {});
  },

  applyLaunchQuery(query) {
    if (query.apiBase) {
      this.globalData.apiBase = decodeURIComponent(query.apiBase);
    }
    if (query.e2e !== undefined) {
      this.globalData.e2eMode = query.e2e === "1";
    }
    if (query.resetSession === "1") {
      this.globalData.sessionToken = "";
    }
  }
});
