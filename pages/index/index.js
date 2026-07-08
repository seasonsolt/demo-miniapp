Page({
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
  }
});
