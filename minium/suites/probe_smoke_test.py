import os
import sys
import time

import minium

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class ProbeSmokeTest(minium.MiniTest):
    def test_probe_write_read_echo(self):
        page = self.app.get_current_page()
        self.assertIsNotNone(page, "小程序未启动或未获取到当前页面")

        entry = page.get_element(".probe-entry")
        self.assertIsNotNone(entry, "首页缺少探针读写入口")
        entry.tap()

        time.sleep(1)
        probe_page = self.app.get_current_page()
        empty_state = probe_page.wait_for(".probe-empty", max_timeout=5)
        self.assertTrue(empty_state, "探针页空态未展示")
        self.capture("PROBE-001-01-empty")

        probe_page.get_element(".probe-write").tap()
        write_success = probe_page.wait_for(".probe-write-success", max_timeout=10)
        self.assertTrue(write_success, "探针写入成功状态未展示")
        self.capture("PROBE-001-02-write")

        probe_page.get_element(".probe-read").tap()
        echo_match = probe_page.wait_for(".probe-echo-match", max_timeout=10)
        self.assertTrue(echo_match, "探针读取回显一致状态未展示")
        self.capture("PROBE-001-03-echo")
