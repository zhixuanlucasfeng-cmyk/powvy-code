<h1 align="center"><img src="resources/build/icon.png" width="64" valign="middle" /> Powvy Code</h1>

<p align="center"><strong>并行跑多个 Claude Code / Codex agent 的桌面 app，自带 Claude Mem 记忆面板。</strong><br/>
基于 <a href="https://github.com/stablyai/orca">Orca</a>（MIT）修改。</p>

## 比 Orca 多了什么

- **Powvy 记忆面板**：在侧边栏直接看当前工作区的 Claude Mem 记忆，可以搜索；还能读取 Obsidian 里「关于我」的个人档案（只读）。
- **默认中文界面**。
- **关掉了遥测和 Orca 的自动更新**，不会往外发数据。

Orca 原有的功能都在：一个任务拆给多个 agent，每个 agent 在自己的 git worktree 里干活，带 diff、浏览器和 CLI。详见 [Orca 原版 README](docs/readme/ORCA-README.md)。

## 安装（macOS）

1. 从 [Releases](../../releases/latest) 下载 `.dmg`，拖进「应用程序」。
2. app 没有经过 Apple 签名，第一次打开会提示「已损坏」或「无法验证开发者」。在终端运行：
   ```sh
   xattr -cr "/Applications/Powvy Code.app"
   ```
   或者右键 app → 打开 → 打开。
3. 需要已经装好并登录 [Claude Code](https://claude.com/claude-code)（或 Codex）。

> 目前只有 Intel（x64）版本；Apple Silicon（M 系列）Mac 会自动用 Rosetta 运行。

## 从源码构建

```sh
pnpm install && pnpm build:mac
```

跟进 Orca 上游更新：`git fetch upstream && git merge upstream/main`，然后重新构建。

## 许可

MIT。Orca 原作者版权 © Lovecast Inc.，见 [LICENSE](LICENSE)。Powvy Code 与 Orca 官方无关。
