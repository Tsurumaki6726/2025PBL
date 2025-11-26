# News to Chat アプリケーション - セットアップガイド

「ニュース記事を会話形式に変換するAIアプリケーション」のセットアップ手順です。

## 概要

このアプリケーションは以下で構成されています：
- **フロントエンド**: Next.js + React (モダンUI)
- **バックエンド**: FastAPI (Python LLM統合)
- **推論エンジン**: Swallow v0.3 (Llama 3.1ベースの日本語LLM)

## プロジェクト構造

\`\`\`
news-to-chat-app/
├── app/                     # Next.js フロントエンド
├── components/              # React コンポーネント
├── backend/
│   ├── main.py              # FastAPI サーバー（Swallow統合済み）
│   ├── requirements.txt     # Python依存パッケージ
│   └── data/
│       └── ehime_kiji_001.csv  # ニュース記事CSV
├── .env.local               # 環境変数
└── SETUP_GUIDE.md           # このファイル
\`\`\`

---

## セットアップ手順

### ステップ1：バックエンド（FastAPI + Swallow）のセットアップ

#### 1.1 前提条件

- Python 3.10以上
- CUDA対応GPU（VRAM 8GB以上推奨）
- Google Colabで動作確認済みの環境

#### 1.2 仮想環境の作成

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
\`\`\`

#### 1.3 Unslothのインストール（重要）

Unslothは特別なインストール方法が必要です（Colab Cell 1相当）：

\`\`\`bash
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes pandas
\`\`\`

#### 1.4 FastAPI依存パッケージのインストール

\`\`\`bash
pip install fastapi uvicorn pydantic python-multipart
\`\`\`

#### 1.5 CSVファイルの配置

\`\`\`bash
mkdir -p data
cp /path/to/ehime_kiji_001.csv data/
\`\`\`

CSVファイルの要件：
- 列名: `honbun`（記事本文）
- エンコーディング: UTF-8

#### 1.6 サーバー起動

\`\`\`bash
python main.py
\`\`\`

起動時に以下が表示されます：
\`\`\`
🚀 News to Chat API を起動しています...
📂 ファイル確認中: .../data/ehime_kiji_001.csv
✅ CSV読み込み成功: XX 件の記事をロードしました。
⏳ [tokyotech-llm/Llama-3.1-Swallow-8B-Instruct-v0.3] をロードしています...
※Swallowは高精度なため、初回ダウンロードとロードに3〜5分程度かかります。
✅ Swallowモデルのロードが完了しました！
✅ 起動完了！
\`\`\`

---

### ステップ2：フロントエンド（Next.js）のセットアップ

#### 2.1 依存パッケージのインストール

\`\`\`bash
npm install
\`\`\`

#### 2.2 環境変数の設定

`.env.local` を作成：

\`\`\`env
FASTAPI_URL=http://localhost:8000
\`\`\`

#### 2.3 開発サーバー起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで `http://localhost:3000` を開きます。

---

## APIエンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/health` | GET | ヘルスチェック（モデル状態確認） |
| `/articles` | GET | CSV記事一覧取得 |
| `/convert` | POST | 記事→会話変換 |

### ヘルスチェック

\`\`\`bash
curl http://localhost:8000/health
\`\`\`

レスポンス：
\`\`\`json
{
  "status": "healthy",
  "model_loaded": true,
  "articles_count": 10
}
\`\`\`

### 会話変換

\`\`\`bash
curl -X POST http://localhost:8000/convert \
  -H "Content-Type: application/json" \
  -d '{"article_id": 0}'
\`\`\`

---

## トラブルシューティング

### モデルがロードされない
- GPU VRAMが不足している可能性（8GB以上推奨）
- CUDAドライバーが正しくインストールされているか確認
- `torch.cuda.is_available()` でGPU確認

### CSVが読み込めない
- ファイルパス確認: `backend/data/ehime_kiji_001.csv`
- 列名が `honbun` であることを確認
- エンコーディングがUTF-8であることを確認

### 推論が遅い
- 初回は10〜30秒程度かかります（正常動作）
- GPUメモリ不足で遅くなる場合があります

### CORS エラー
- `backend/main.py` の CORS 設定確認
- 本番では `allow_origins` を制限してください

---

## Google Colabでの実行（GPU環境がない場合）

\`\`\`python
# セル1: インストール
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes pandas
!pip install fastapi uvicorn pyngrok

# セル2: main.py をアップロード
# ngrok でトンネルを作成してNext.jsから接続
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_NGROK_TOKEN")
public_url = ngrok.connect(8000)
print(f"Public URL: {public_url}")

# セル3: サーバー起動
!python main.py
\`\`\`

---

## 本番デプロイ

- 環境変数 `FASTAPI_URL` を本番URLに変更
- GPU対応クラウドサービス使用（AWS EC2 GPU, GCP, Runpod等）
- セキュリティ設定（CORS、認証）を適切に設定
