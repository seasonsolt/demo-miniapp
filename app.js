App({
  globalData: {
    apiBase: "http://127.0.0.1:18082"
  },

  onLaunch(options) {
    const query = (options && options.query) || {};
    if (query.apiBase) {
      this.globalData.apiBase = decodeURIComponent(query.apiBase);
    }
  }
});
