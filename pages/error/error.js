Page({
  data: {
    loading: false,
    state: "idle",
    lastStatusCode: "",
    lastCode: "",
    message: "尚未触发错误探针"
  },

  triggerBadRequest() {
    this.requestError("bad-request");
  },

  triggerServerError() {
    this.requestError("server-error");
  },

  requestError(errorType) {
    const app = getApp();
    this.setData({
      loading: true,
      state: "loading",
      lastStatusCode: "",
      lastCode: "",
      message: "请求中"
    });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/error-probe/${errorType}`,
      method: "GET",
      success: (response) => {
        const body = response.data || {};
        this.applyErrorState(response.statusCode, body);
      },
      fail: () => {
        this.setData({
          state: "networkError",
          message: "错误探针请求失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  applyErrorState(statusCode, body) {
    if (statusCode === 400 && body.code === "E2E_BAD_REQUEST") {
      this.setData({
        state: "badRequest",
        lastStatusCode: statusCode,
        lastCode: body.code,
        message: body.message
      });
      return;
    }
    if (statusCode === 500 && body.code === "E2E_SERVER_ERROR") {
      this.setData({
        state: "serverError",
        lastStatusCode: statusCode,
        lastCode: body.code,
        message: body.message
      });
      return;
    }
    this.setData({
      state: "unexpected",
      lastStatusCode: statusCode,
      lastCode: body.code || "",
      message: body.message || `错误探针返回非预期状态：HTTP ${statusCode}`
    });
  }
});
