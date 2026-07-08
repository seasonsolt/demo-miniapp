import os
import sys
import time

import minium

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class SessionSmokeTest(minium.MiniTest):
    def test_login_query_and_missing_token_probe(self):
        page = self.app.get_current_page()
        self.assertIsNotNone(page, "小程序未启动或未获取到当前页面")

        entry = page.get_element(".session-entry")
        self.assertIsNotNone(entry, "首页缺少测试登录入口")
        entry.tap()

        time.sleep(1)
        session_page = self.app.get_current_page()
        logged_out = session_page.wait_for(".session-logged-out", max_timeout=5)
        self.assertTrue(logged_out, "未登录状态未展示")
        self.capture("SESSION-001-01-logged-out")

        session_page.get_element(".session-login").tap()
        login_success = session_page.wait_for(".session-login-success", max_timeout=10)
        self.assertTrue(login_success, "登录成功状态未展示")
        self.capture("SESSION-001-02-login-success")

        session_page.get_element(".session-query").tap()
        authenticated = session_page.wait_for(".session-authenticated", max_timeout=10)
        self.assertTrue(authenticated, "会话有效状态未展示")
        self.capture("SESSION-001-03-authenticated")

        session_page.get_element(".session-probe-missing").tap()
        missing_token = session_page.wait_for(".session-missing-token", max_timeout=10)
        self.assertTrue(missing_token, "缺 token 拒绝状态未展示")
        self.capture("SESSION-001-04-missing-token")
