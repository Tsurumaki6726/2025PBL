# News to Chat アプリケーション - セットアップガイド

「ニュース記事を会話形式に変換するAIアプリケーション」のセットアップ手順です。

## 概要

このアプリケーションは以下で構成されています：
- **フロントエンド**: Next.js + React (モダンUI)
- **バックエンド**: FastAPI (Python LLM統合)
- **推論エンジン**: Google Colab で開発したQwenモデル

## セットアップ手順

### ステップ1：プロジェクト構造の作成

\`\`\`bash
# プロジェクトルートディレクトリを作成
mkdir news-to-chat-app
cd news-to-chat-app
\`\`\`

### ステップ2：フロントエンド（Next.js）のセットアップ

\`\`\`bash
# v0 から zip をダウンロードするか、以下で新規プロジェクトを作成
npx create-next-app@latest --typescript

# または v0 で生成したコードをコピーしてください
\`\`\`

#### 環境変数を設定

プロジェクトルートに `.env.local` ファイルを作成：

\`\`\`env
# FastAPI サーバーの URL
FASTAPI_URL=http://localhost:8000
\`\`\`

#### 依存パッケージをインストール

\`\`\`bash
npm install
\`\`\`

#### 開発サーバーを起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで `http://localhost:3000` にアクセスしてください。

---

### ステップ3：バックエンド（FastAPI）のセットアップ

#### 3.1 Python 仮想環境を作成

\`\`\`bash
# プロジェクトルートで
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
\`\`\`

#### 3.2 依存パッケージをインストール

\`\`\`bash
cd backend
pip install -r requirements.txt

# Google Colab のコードで使用したパッケージも追加
pip install "unsloth[colab-new]"
pip install transformers accelerate bitsandbytes pandas
\`\`\`

#### 3.3 FastAPI サーバーを起動

\`\`\`bash
python main.py
\`\`\`

ターミナルに以下が表示されたら成功です：
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000
\`\`\`

#### 3.4 FastAPI ドキュメントで確認

ブラウザで `http://localhost:8000/docs` にアクセスしてください。
Swagger UIが表示され、APIエンドポイントをテストできます。

---

### ステップ4：Pythonモデルの統合

`backend/main.py` の `convert_article_to_chat()` 関数に、Google Colab で開発したコードを統合します。

#### 現在の構成：

\`\`\`python
def convert_article_to_chat(article_text: str, tone: str = "frank") -> list[dict]:
    """
    ここに実装を追加してください
    """
\`\`\`

#### 統合方法：

1. **Google Colab のコードを関数化**
   - モデルロード: `__init__` か グローバル変数で一度だけ実行
   - 推論ロジック: `convert_article_to_chat()` 内に実装

2. **例：**
\`\`\`python
# グローバルで一度だけモデルをロード
from transformers import AutoModelForCausalLM, AutoTokenizer

model = None
tokenizer = None

def load_model():
    global model, tokenizer
    if model is None:
        # Unslothでモデルをロード
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name="Qwen/Qwen2-7B",
            max_seq_length=2048,
            load_in_4bit=True,
        )
    return model, tokenizer

def convert_article_to_chat(article_text: str, tone: str = "frank") -> list[dict]:
    model, tokenizer = load_model()
    
    # プロンプト作成
    prompt = f"ニュース記事を{tone}なトーンで会話形式に変換してください:\n{article_text}"
    
    # 推論実行
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=500)
    response = tokenizer.decode(outputs[0])
    
    # 会話形式に整形
    conversation = parse_conversation(response)
    return conversation
\`\`\`

---

## 実行確認

### ターミナル1: FastAPI サーバー

\`\`\`bash
cd backend
source venv/bin/activate  # または venv\Scripts\activate (Windows)
python main.py
\`\`\`

### ターミナル2: Next.js 開発サーバー

\`\`\`bash
npm run dev
\`\`\`

### ブラウザで確認

`http://localhost:3000` を開き、以下をテスト：
1. 記事テキストを入力
2. トーンを選択（フランク / 真面目 / 解説風）
3. 「変換する」ボタンをクリック
4. チャット形式で会話が表示される

---

## CSV ファイルの配置

Google Colab で使用した `ehime_kiji_001.csv` ファイルがある場合：

\`\`\`
backend/
├── main.py
├── requirements.txt
├── data/
│   └── ehime_kiji_001.csv   # ここに配置
└── venv/
\`\`\`

Python コード内でアクセス：
\`\`\`python
import pandas as pd

df = pd.read_csv("data/ehime_kiji_001.csv")
\`\`\`

---

## トラブルシューティング

### ❌ CORS エラーが出る
→ `backend/main.py` の CORS 設定確認（本番では `allow_origins` を制限してください）

### ❌ FastAPI に接続できない
→ `FASTAPI_URL` 環境変数が正しいか確認
→ FastAPI サーバーが起動しているか確認 (`http://localhost:8000/health`)

### ❌ モデルのメモリ不足
→ Unsloth の 4-bit 量子化を使用（既に実装）
→ より小さいモデルを使用 (Qwen2-1.5B など)

### ❌ 推論が遅い
→ GPU の利用を確認 (`torch.cuda.is_available()`)
→ CPU での推論は非常に遅いため、ローカルでは GPU 環境を推奨

---

## デプロイ（本番環境）

### Vercel にデプロイ（フロントエンド）

\`\`\`bash
vercel deploy
\`\`\`

### Python バックエンド のデプロイ

以下のサービスで FastAPI をデプロイ可能：
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Hugging Face Spaces**: https://huggingface.co/spaces
- **AWS Lambda** (Mangum使用)

詳細は各サービスのドキュメントを参照してください。

---

## ファイル構成

\`\`\`
news-to-chat-app/
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── convert/
│   │           └── route.ts
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── chat-area.tsx
│   │   ├── article-input.tsx
│   │   └── convert-button.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── data/
│   │   └── ehime_kiji_001.csv
│   └── venv/
│
└── SETUP_GUIDE.md (このファイル)
\`\`\`

---

## サポート

問題が発生した場合：
1. このガイドのトラブルシューティング を確認
2. FastAPI ドキュメント: https://fastapi.tiangolo.com
3. Next.js ドキュメント: https://nextjs.org

Happy coding! 🚀
