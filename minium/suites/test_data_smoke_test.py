import os
import sys
import time

import minium

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestDataSmokeTest(minium.MiniTest):
    def test_guarded_reset_seed_flow(self):
        self.app.relaunch("/pages/index/index", params={"e2e": "0", "resetSession": "1"})
        home_page = self.current_page()
        hidden_entry = home_page.wait_for(".test-data-entry-hidden", max_timeout=5)
        self.assertTrue(hidden_entry, "普通入口不应展示 Reset / Seed 操作")
        self.capture("TESTDATA-001-01-home-hidden")

        self.app.relaunch("/pages/test-data/test-data", params={"e2e": "0", "resetSession": "1"})
        blocked_page = self.current_page()
        blocked = blocked_page.wait_for(".test-data-blocked", max_timeout=5)
        self.assertTrue(blocked, "非测试模式直达 Reset / Seed 页未被拦截")
        self.capture("TESTDATA-001-02-direct-blocked")

        self.app.relaunch("/pages/index/index", params={"e2e": "1", "resetSession": "1"})
        home_page = self.current_page()
        logged_out_hidden = home_page.wait_for(".test-data-entry-hidden", max_timeout=5)
        self.assertTrue(logged_out_hidden, "测试模式未登录时不应展示 Reset / Seed 入口")
        self.capture("TESTDATA-001-03-e2e-logged-out-hidden")

        home_page.get_element(".session-entry").tap()
        session_page = self.current_page()
        session_page.get_element(".session-login").tap()
        login_success = session_page.wait_for(".session-login-success", max_timeout=10)
        self.assertTrue(login_success, "测试账号登录成功状态未展示")

        self.app.navigate_to("/pages/index/index", params={"e2e": "1"})
        home_page = self.current_page()
        visible_entry = home_page.wait_for(".test-data-entry", max_timeout=5)
        self.assertTrue(visible_entry, "测试模式已登录时 Reset / Seed 入口未展示")
        self.capture("TESTDATA-001-04-entry-visible")
        visible_entry.tap()

        test_data_page = self.current_page()
        ready = test_data_page.wait_for(".test-data-ready", max_timeout=5)
        self.assertTrue(ready, "Reset / Seed 页就绪状态未展示")

        test_data_page.get_element(".test-data-reset").tap()
        reset_done = test_data_page.wait_for(".test-data-reset-done", max_timeout=10)
        self.assertTrue(reset_done, "Reset 完成状态未展示")
        self.capture("TESTDATA-001-05-reset")

        test_data_page.get_element(".test-data-seed").tap()
        seed_done = test_data_page.wait_for(".test-data-seed-done", max_timeout=10)
        self.assertTrue(seed_done, "Seed 完成状态未展示")
        self.capture("TESTDATA-001-06-seed")

        test_data_page.get_element(".test-data-read").tap()
        read_done = test_data_page.wait_for(".test-data-read-done", max_timeout=10)
        self.assertTrue(read_done, "播种后读取一致状态未展示")
        self.capture("TESTDATA-001-07-read")

    def current_page(self):
        time.sleep(1)
        page = self.app.get_current_page()
        self.assertIsNotNone(page, "小程序未启动或未获取到当前页面")
        return page
