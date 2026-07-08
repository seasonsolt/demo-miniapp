Page({
  data: {
    loading: false,
    state: "loggedOut",
    account: "",
    message: "未登录"
  },

  login() {
    const app = getApp();
    this.setData({ loading: true, message: "" });

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
          this.setData({
            state: "loginSuccess",
            account: body.account,
            message: "登录成功"
          });
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "登录失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  querySession() {
    this.requestSession(getApp().globalData.sessionToken);
  },

  probeWithoutToken() {
    this.requestProtectedProbe("");
  },

  useInvalidToken() {
    getApp().globalData.sessionToken = "invalid-token";
    this.requestSession("invalid-token");
  },

  requestSession(token) {
    const app = getApp();
    this.setData({ loading: true, message: "" });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/session`,
      method: "GET",
      header: this.authHeader(token),
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200 && body.status === "AUTHENTICATED") {
          this.setData({
            state: "authenticated",
            account: body.account,
            message: "会话有效"
          });
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "会话查询失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  requestProtectedProbe(token) {
    const app = getApp();
    this.setData({ loading: true, message: "" });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/protected-probe`,
      method: "GET",
      header: this.authHeader(token),
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200 && body.status === "AUTHORIZED") {
          this.setData({
            state: "authenticated",
            account: body.account,
            message: "受保护探针通过"
          });
          return;
        }
        this.applyError(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "受保护探针失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  authHeader(token) {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`
    };
  },

  applyError(statusCode, body) {
    if (statusCode === 401 && body.code === "TOKEN_MISSING") {
      this.setData({
        state: "missingToken",
        message: body.message
      });
      return;
    }
    if (statusCode === 401 && body.code === "TOKEN_INVALID_OR_EXPIRED") {
      this.setData({
        state: "invalidToken",
        message: body.message
      });
      return;
    }
    this.setData({
      state: "error",
      message: body.message || `请求失败：HTTP ${statusCode}`
    });
  }
});
