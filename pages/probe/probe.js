Page({
  data: {
    loading: false,
    state: "empty",
    mode: "idle",
    probeId: "TEST_PROBE_MINIAPP",
    expectedValue: "probe-value-miniapp",
    lastValue: "",
    message: "尚未读取探针数据",
    echoMatched: false
  },

  writeProbe() {
    this.ensureToken((token) => {
      this.requestProbe("PUT", this.data.probeId, token, {
        value: this.data.expectedValue
      }, "write");
    });
  },

  readProbe() {
    this.ensureToken((token) => {
      this.requestProbe("GET", this.data.probeId, token, null, "read");
    });
  },

  resetProbe() {
    this.ensureToken((token) => {
      this.requestProbe("DELETE", this.data.probeId, token, null, "reset");
    });
  },

  writeInvalidProbe() {
    this.ensureToken((token) => {
      this.requestProbe("PUT", "PROBE_NOT_ALLOWED", token, {
        value: this.data.expectedValue
      }, "write");
    });
  },

  ensureToken(onReady) {
    const app = getApp();
    if (app.globalData.sessionToken) {
      onReady(app.globalData.sessionToken);
      return;
    }

    this.setData({ loading: true, state: "empty", message: "请求中" });
    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/login`,
      method: "POST",
      header: {
        "content-type": "application/json"
      },
      data: {
        account: "test-user",
        password: "test-password"
      },
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200 && body.token) {
          app.globalData.sessionToken = body.token;
          onReady(body.token);
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          loading: false,
          state: "error",
          message: "登录失败：无法连接服务"
        });
      }
    });
  },

  requestProbe(method, probeId, token, data, mode) {
    const app = getApp();
    this.setData({ loading: true, mode, message: "请求中", echoMatched: false });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/probes/${probeId}`,
      method,
      header: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      data,
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200) {
          this.applySuccess(mode, body);
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "探针请求失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  applySuccess(mode, body) {
    if (mode === "reset") {
      this.setData({
        state: "empty",
        mode,
        lastValue: "",
        message: "探针数据已清空",
        echoMatched: false
      });
      return;
    }

    const value = body.value || "";
    this.setData({
      state: "success",
      mode,
      lastValue: value,
      message: mode === "write" ? "写入成功" : "读取成功",
      echoMatched: mode === "read" && value === this.data.expectedValue
    });
  },

  applyError(statusCode, body) {
    if (statusCode === 404 && body.code === "PROBE_NOT_FOUND") {
      this.setData({
        loading: false,
        state: "empty",
        lastValue: "",
        message: body.message,
        echoMatched: false
      });
      return;
    }

    this.setData({
      loading: false,
      state: "error",
      message: body.message || `探针请求失败：HTTP ${statusCode}`,
      echoMatched: false
    });
  }
});
