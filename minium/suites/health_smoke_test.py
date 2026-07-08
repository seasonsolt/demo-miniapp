import os
import sys

import minium

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class HealthSmokeTest(minium.MiniTest):
    def test_home_to_health_success(self):
        page = self.app.get_current_page()
        self.assertIsNotNone(page, "小程序未启动或未获取到当前页面")
        self.capture("HEALTH-001-01-entry")

        entry = page.get_element("[data-testid='health-entry']")
        self.assertIsNotNone(entry, "首页缺少健康检查入口")
        entry.tap()

        health_page = self.app.get_current_page()
        success = health_page.wait_for("[data-testid='health-success']", max_timeout=10)
        self.assertTrue(success, "健康检查成功状态未展示")
        self.capture("HEALTH-001-02-assert")
