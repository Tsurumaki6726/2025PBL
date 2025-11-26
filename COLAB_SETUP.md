# Google Colab セットアップガイド

## 概要

このガイドでは、Google ColabをバックエンドサーバーとしてmacOSのNext.jsフロントエンドと連携する方法を説明します。

## 前提条件

1. Googleアカウント
2. [ngrok](https://ngrok.com/) アカウント（無料）
3. CSVファイル（`ehime_kiji_001.csv`）

## セットアップ手順

### Step 1: ngrokアカウントの作成

1. [ngrok.com](https://ngrok.com/) にアクセス
2. 「Sign up」でアカウント作成
3. ダッシュボードから「Your Authtoken」をコピー

### Step 2: Google Colabの準備

1. [Google Colab](https://colab.research.google.com/) にアクセス
2. 「新しいノートブック」を作成
3. **ランタイム → ランタイムのタイプを変更 → GPU（T4）を選択**

### Step 3: コードの実行

`colab/news_to_chat_server.py` の内容を、セルごとに分けてColabに貼り付けます。

#### Cell 1: ライブラリのインストール
\`\`\`python
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes
!pip install fastapi uvicorn pyngrok nest-asyncio pandas
\`\`\`
（約3-5分かかります）

#### Cell 2: ngrok認証
\`\`\`python
NGROK_AUTH_TOKEN = "your_token_here"  # ここにトークンを貼り付け

from pyngrok import ngrok
ngrok.set_auth_token(NGROK_AUTH_TOKEN)
\`\`\`

#### Cell 3: モデルのロード
Cell 3のコードを実行（約2-3分）

#### Cell 4: CSVのアップロード
Cell 4を実行すると、ファイル選択ダイアログが表示されます。
`ehime_kiji_001.csv` をアップロードしてください。

#### Cell 5-6: 関数とサーバーの定義
Cell 5とCell 6を順番に実行

#### Cell 7: サーバーの起動
実行すると以下のような出力が表示されます：
\`\`\`
============================================================
サーバーが起動しました!
============================================================
公開URL: NgrokTunnel: "https://xxxx-xx-xx-xxx-xxx.ngrok-free.app"
============================================================

このURLをNext.jsの環境変数に設定してください:
FASTAPI_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
============================================================
\`\`\`

### Step 4: Next.jsの設定

1. v0の「Vars」セクションを開く
2. 以下の環境変数を追加：
   - `FASTAPI_URL`: Colabで表示されたngrok URL

### Step 5: 動作確認

1. Next.jsアプリを開く
2. 記事を選択して「会話に変換する」をクリック
3. Colabのログで処理が行われていることを確認

## 注意事項

### セッションの制限
- 無料版Colabは約12時間でセッションが切れます
- セッションが切れた場合は、Cell 1から再実行してください
- ngrok URLも再起動時に変わるため、環境変数の更新が必要です

### ngrokの制限（無料版）
- 同時接続数: 4
- リクエスト制限: 40リクエスト/分

### GPU使用量
- Colabの無料GPUには使用制限があります
- 長時間使用すると一時的にGPUが使えなくなることがあります

## トラブルシューティング

### エラー: "CUDA out of memory"
→ ランタイムを再起動してください（ランタイム → ランタイムを再起動）

### エラー: "ngrok tunnel not found"
→ ngrokのauthtokenが正しいか確認してください

### 接続エラー
→ ngrok URLが最新か確認してください（再起動するとURLが変わります）

## 本番環境への移行

本番環境では以下のサービスを検討してください：
- [Hugging Face Spaces](https://huggingface.co/spaces) (GPU対応)
- [Modal](https://modal.com/) (サーバーレスGPU)
- [Replicate](https://replicate.com/) (API形式でモデル提供)
- AWS/GCP/Azure の GPU インスタンス
