Page({
  data: {
    loading: false,
    state: "idle",
    serviceName: "",
    message: ""
  },

  onLoad() {
    this.checkHealth();
  },

  checkHealth() {
    const app = getApp();
    this.setData({
      loading: true,
      state: "idle",
      message: ""
    });

    wx.request({
      url: `${app.globalData.apiBase}/api/e2e/health`,
      method: "GET",
      success: (response) => {
        const body = response.data || {};
        if (response.statusCode === 200 && body.status === "UP") {
          this.setData({
            state: "success",
            serviceName: body.service,
            message: `${body.service} ${body.version} is ${body.status}`
          });
          return;
        }
        this.setData({
          state: "error",
          message: `健康检查失败：HTTP ${response.statusCode}`
        });
      },
      fail: () => {
        this.setData({
          state: "error",
          message: "健康检查失败：无法连接服务"
        });
      },
      complete: () => {
        this.setData({
          loading: false
        });
      }
    });
  }
});
