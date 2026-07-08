# demo-miniapp

`demo-miniapp` 是用于 Minium E2E baseline 的原生微信小程序。它只承载本地确定性栈验证，不承载真实业务流程。

## 当前页面

- 首页：`pages/index/index`
- 健康检查页：`pages/health/health`
- 测试登录页：`pages/session/session`

## 本地服务

默认调用 `http://127.0.0.1:18082/api/e2e/*`。Minium 或微信开发者工具启动时可以通过 query 参数覆盖：

```text
apiBase=http%3A%2F%2F127.0.0.1%3A18082
```

## Minium

当前仓库包含最小 smoke 套件，用于验证首页启动、跳转健康页、健康状态展示、测试登录、会话查询和缺 token 拒绝反馈；测试登录页也提供无效 token 状态入口。

```bash
./minium/run-smoke.sh
```

运行前需要：

- `demo-miniapp-service` 已在本机启动。
- 微信开发者工具 CLI 可用，并开启安全设置中的服务端口。
- Python 环境已安装 `minium`。
