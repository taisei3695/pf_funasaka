# Vite開発環境

既存のVite・SCSS・WordPress連携設定と `yarn.lock` を使用しています。
依存関係のインストール、開発サーバーの起動、WordPressテーマ用ビルドを確認済みです。

## Windowsでの操作

プロジェクトフォルダのPowerShellで実行してください。
このPCでは `C:\Program Files\nodejs` のNode.jsとCorepackを使用します。
起動スクリプトがプロセス内のPATHとプロジェクト内のYarnキャッシュを設定します。

```powershell
# 開発サーバー（停止は Ctrl+C）
.\bin\yarn.ps1 dev

# WordPressテーマ用ビルド
.\bin\yarn.ps1 build:wp

# 依存関係を再インストールするとき
.\bin\yarn.ps1 install --immutable
```

開発ページ: http://localhost:5173/

編集対象は `src/index.html`、`src/assets/styles/`、`src/assets/js/` です。
ビルド成果物は `wordpress/themes/wp-template/` に出力されます。
画像のWebP変換とSCSSファイルの追加・削除監視は既存設定で実行されます。

## WordPress環境

Docker Desktopはユーザー単位でインストール済みです。Docker Desktopを起動してから実行してください。

```powershell
.\bin\yarn.ps1 wp-start
# 初回の初期設定
.\bin\yarn.ps1 wp-init
# 停止
.\bin\yarn.ps1 wp-stop
```

サイト: http://localhost:8888/
管理画面: http://localhost:8888/wp-admin/ （ローカル開発用: admin / password）

起動スクリプトはDocker CLIのパスを補います。また、WordPressコマンド実行時にNode.jsのDNSでWordPress.orgを解決できない場合だけ、プロセス内で公開DNSへ切り替えます。Windows全体のDNS設定は変更しません。
