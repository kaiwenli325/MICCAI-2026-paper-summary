# 发布到 GitHub Pages

这个项目是纯静态网页，不需要服务器，也不需要购买云主机。最简单的方式是使用 GitHub Pages 免费发布。

## 第一步：在 GitHub 新建仓库

登录 GitHub，点击右上角 **+ > New repository**：

- Repository name：建议填写 `MICCAI2026-website`
- Visibility：选择 **Public**
- 不要勾选添加 README、`.gitignore` 或 License

创建后，GitHub 会显示新仓库地址。

## 第二步：把网页推送到 GitHub

在终端进入本项目目录，然后运行：

```bash
cd /Users/kaiwenli/Desktop/MICCAI2026-website
git init
git add .
git commit -m "Build MICCAI 2026 paper explorer"
git branch -M main
git remote add origin https://github.com/kaiwenli325/MICCAI2026-website.git
git push -u origin main
```

如果你创建仓库时用了不同的名称，请把上面 `git remote add origin` 后面的地址替换为 GitHub 页面显示的地址。

## 第三步：开启 GitHub Pages

在新仓库页面中：

1. 点击 **Settings**。
2. 在左侧点击 **Pages**。
3. 在 **Build and deployment** 下，将 Source 设为 **Deploy from a branch**。
4. Branch 选择 **main**，文件夹选择 **/ (root)**。
5. 点击 **Save**。

等待约 1–3 分钟，页面顶部会显示网站地址。按上面的仓库名，地址通常是：

```text
https://kaiwenli325.github.io/MICCAI2026-website/
```

以后修改网页后，只要再次运行以下命令，网站就会自动更新：

```bash
git add .
git commit -m "Update website"
git push
```

## 更新论文数据

网页当前已经包含生成好的论文数据，可以直接发布。如果原总结仓库新增或修改了内容，并且电脑安装了 Node.js 18 或更高版本，可以在本目录运行：

```bash
npm run build:data
```

这个命令会从 `MICCAI-2026-paper-summary` 仓库重新读取中英文 README，并更新 `data/` 目录中的网页数据。检查后提交并推送即可。

## 可选：使用自定义域名

如果以后购买了域名，可以在 **Settings > Pages > Custom domain** 中填写域名。GitHub 会给出需要添加的 DNS 记录；配置完成后勾选 **Enforce HTTPS**。
