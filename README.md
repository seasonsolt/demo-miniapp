# demo-miniapp

`demo-miniapp` 是用于 Minium E2E baseline 的原生微信小程序。它只承载本地确定性栈验证，不承载真实业务流程。

## 当前页面

- 首页：`pages/index/index`
- 健康检查页：`pages/health/health`
- 测试登录页：`pages/session/session`
- 探针读写页：`pages/probe/probe`
- 错误态验证页：`pages/error/error`
- 测试数据页：`pages/test-data/test-data`，仅在 `e2e=1` 且已登录时从首页开放入口

## 本地服务

默认调用 `http://127.0.0.1:18082/api/e2e/*`。Minium 或微信开发者工具启动时可以通过 query 参数覆盖：

```text
apiBase=http%3A%2F%2F127.0.0.1%3A18082
```

自动化可通过 `e2e=1` 开启测试工具入口，并通过 `resetSession=1` 清理本地测试 token。

## Minium

当前仓库包含最小 smoke 套件，用于验证首页启动、跳转健康页、健康状态展示、测试登录、会话查询、缺 token 拒绝反馈、探针写入、探针读取、回显一致性、受保护 Reset / Seed 测试数据闭环、400 错误态和 500 错误态；测试登录页也提供无效 token 状态入口。

```bash
./minium/run-smoke.sh
```

运行前需要：

- `demo-miniapp-service` 已在本机启动。
- 微信开发者工具 CLI 可用，并开启安全设置中的服务端口。
- Python 环境已安装 `minium`。
