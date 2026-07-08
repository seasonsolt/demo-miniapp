#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$HERE/.." && pwd)"
WS_ROOT="$(cd "$PROJECT_ROOT/../.." && pwd)"
if [ -d "$WS_ROOT/.venv-qa/bin" ]; then
  PATH="$WS_ROOT/.venv-qa/bin:$PATH"
fi
DEVTOOLS_CLI="${WECHAT_DEVTOOLS_CLI:-/Applications/wechatwebdevtools.app/Contents/MacOS/cli}"
MINIUM_RUN="${MINIUM_CMD:-minitest}"
OUT_DIR="$HERE/selfcheck-output"

fail() { echo "FAIL(preflight): $1" >&2; exit 2; }

python3 -c "import minium" 2>/dev/null || fail "minium 未安装：python3 -m pip install minium"
command -v "$MINIUM_RUN" >/dev/null 2>&1 || fail "找不到 Minium 运行命令 '$MINIUM_RUN'（MINIUM_CMD 可覆盖）"
[ -x "$DEVTOOLS_CLI" ] || fail "微信开发者工具 CLI 不可用：$DEVTOOLS_CLI"
git -C "$PROJECT_ROOT" rev-parse HEAD >/dev/null 2>&1 || fail "项目路径不是 git 检出，无法记录 project_commit_sha"

PROJECT_SHA="$(git -C "$PROJECT_ROOT" rev-parse HEAD)"
PROJECT_DIRTY="false"
if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
  PROJECT_DIRTY="true"
fi
mkdir -p "$OUT_DIR"

python3 - "$HERE/minium.base.json" "$OUT_DIR/minium.json" "$PROJECT_ROOT" "$DEVTOOLS_CLI" "$OUT_DIR" <<'PY'
import json, sys
base, out, project, cli, outputs = sys.argv[1:6]
cfg = json.load(open(base))
cfg.pop("base_comment", None)
cfg.update(project_path=project, dev_tool_path=cli, outputs=outputs)
json.dump(cfg, open(out, "w"), ensure_ascii=False, indent=2)
PY

echo "OK preflight 全部通过；project_commit_sha=$PROJECT_SHA project_dirty=$PROJECT_DIRTY"
echo "RUN $MINIUM_RUN -s $HERE/suites/smoke-suite.json -c $OUT_DIR/minium.json"
cd "$HERE/suites"
rm -f "$OUT_DIR/summary.json"
set +e
"$MINIUM_RUN" -s "$HERE/suites/smoke-suite.json" -c "$OUT_DIR/minium.json" -g
MINIUM_EXIT=$?
set -e

python3 - "$OUT_DIR/summary.json" "$MINIUM_EXIT" <<'PY'
import json, sys
summary_path = sys.argv[1]
minium_exit = int(sys.argv[2])
try:
    summary = json.load(open(summary_path))
except Exception as exc:
    print(f"FAIL: 无法读取 summary.json（{exc}）；minium_exit={minium_exit}")
    sys.exit(1)
tests = summary.get("test_num", 0)
errors = summary.get("errors") or []
failures = summary.get("failures") or []
if tests < 1:
    print(f"FAIL: 0 条用例被执行；minium_exit={minium_exit}")
    sys.exit(1)
if errors or failures:
    print(f"FAIL: 用例未通过（errors={len(errors)} failures={len(failures)}）")
    print(str((errors or failures)[0])[:300])
    sys.exit(1)
if minium_exit != 0:
    print(f"FAIL: minium 退出码异常但 summary 未记录失败；minium_exit={minium_exit}")
    sys.exit(1)
print(f"OK summary 重算通过：tests={tests} errors=0 failures=0")
PY

echo "OK smoke 完成；证据见 $OUT_DIR，project_commit_sha=$PROJECT_SHA project_dirty=$PROJECT_DIRTY"
