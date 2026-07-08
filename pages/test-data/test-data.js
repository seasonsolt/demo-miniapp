Page({
  data: {
    loading: false,
    state: "blocked",
    mode: "idle",
    allowed: false,
    seedId: "TEST_SEED_PROBE",
    expectedValue: "seed-value-miniapp",
    lastValue: "",
    deletedCount: 0,
    seededCount: 0,
    echoMatched: false,
    message: "Reset / Seed 仅在测试模式且登录后可用"
  },

  onLoad(options) {
    this.applyEntryOptions(options || {});
  },

  onShow() {
    this.refreshGuard();
  },

  resetData() {
    if (!this.refreshGuard()) {
      return;
    }
    this.requestTestData("reset", "reset");
  },

  seedData() {
    if (!this.refreshGuard()) {
      return;
    }
    this.requestTestData("seed", "seed");
  },

  readSeededProbe() {
    if (!this.refreshGuard()) {
      return;
    }

    const app = getApp();
    this.setData({
      loading: true,
      state: "loading",
      mode: "read",
      message: "请求中",
      echoMatched: false
    });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/probes/${this.data.seedId}`,
      method: "GET",
      header: this.authHeader(app.globalData.sessionToken),
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200) {
          const value = body.value || "";
          this.setData({
            state: "readDone",
            lastValue: value,
            echoMatched: value === this.data.expectedValue,
            message: "读取成功"
          });
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "读取播种数据失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
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
    this.refreshGuard();
  },

  requestTestData(action, mode) {
    const app = getApp();
    this.setData({
      loading: true,
      state: "loading",
      mode,
      message: "请求中",
      echoMatched: false
    });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/test-data/${action}`,
      method: "POST",
      header: this.authHeader(app.globalData.sessionToken),
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200 && action === "reset") {
          this.applyResetSuccess(body);
          return;
        }
        if (response.statusCode === 200 && action === "seed") {
          this.applySeedSuccess(body);
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "测试数据请求失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  refreshGuard() {
    const app = getApp();
    const allowed = app.globalData.e2eMode && !!app.globalData.sessionToken;
    if (!allowed) {
      this.setData({
        allowed: false,
        loading: false,
        state: "blocked",
        message: "Reset / Seed 仅在测试模式且登录后可用"
      });
      return false;
    }

    const state = this.data.state === "blocked" ? "ready" : this.data.state;
    this.setData({
      allowed: true,
      state,
      message: state === "ready" ? "可执行测试数据 reset / seed" : this.data.message
    });
    return true;
  },

  applyResetSuccess(body) {
    this.setData({
      state: "resetDone",
      mode: "reset",
      deletedCount: body.deletedCount || 0,
      seededCount: 0,
      lastValue: "",
      echoMatched: false,
      message: "Reset 完成"
    });
  },

  applySeedSuccess(body) {
    const probes = body.probes || [];
    const probe = probes.length > 0 ? probes[0] : {};
    this.setData({
      state: "seedDone",
      mode: "seed",
      deletedCount: body.deletedCount || 0,
      seededCount: body.seededCount || 0,
      lastValue: probe.value || "",
      echoMatched: probe.value === this.data.expectedValue,
      message: "Seed 完成"
    });
  },

  applyError(statusCode, body) {
    this.setData({
      loading: false,
      state: "error",
      message: body.message || `测试数据请求失败：HTTP ${statusCode}`,
      echoMatched: false
    });
  },

  authHeader(token) {
    return {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json"
    };
  }
});
