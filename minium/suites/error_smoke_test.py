import os
import sys
import time

import minium

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class ErrorSmokeTest(minium.MiniTest):
    def test_bad_request_and_server_error_states(self):
        page = self.app.get_current_page()
        self.assertIsNotNone(page, "小程序未启动或未获取到当前页面")

        entry = page.get_element(".error-entry")
        self.assertIsNotNone(entry, "首页缺少错误态验证入口")
        entry.tap()

        time.sleep(1)
        error_page = self.app.get_current_page()
        idle_state = error_page.wait_for(".error-idle", max_timeout=5)
        self.assertTrue(idle_state, "错误态页初始状态未展示")
        self.capture("ERROR-001-01-idle")

        error_page.get_element(".error-bad-request-trigger").tap()
        bad_request_state = error_page.wait_for(".error-bad-request", max_timeout=10)
        self.assertTrue(bad_request_state, "400 错误态未展示")
        self.capture("ERROR-001-02-bad-request")

        error_page.get_element(".error-server-trigger").tap()
        server_error_state = error_page.wait_for(".error-server", max_timeout=10)
        self.assertTrue(server_error_state, "500 错误态未展示")
        self.capture("ERROR-001-03-server-error")
