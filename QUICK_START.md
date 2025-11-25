# News to Chat - クイックスタート

すぐに始められるように、最小限の手順をまとめました。

## 5分でセットアップ

### 1. フロントエンド起動

\`\`\`bash
# プロジェクトルートで
npm install
npm run dev

# ブラウザで http://localhost:3000 を開く
\`\`\`

### 2. バックエンド起動（別ターミナル）

\`\`\`bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate

# 依存パッケージをインストール
pip install -r requirements.txt

# FastAPI サーバーを起動
python main.py

# ブラウザで http://localhost:8000/docs を開く（APIドキュメント）
\`\`\`

### 3. テスト

1. `http://localhost:3000` で記事テキストを入力
2. トーンを選択
3. 「変換する」をクリック
4. チャット形式の会話が表示される

## ファイル配置

\`\`\`
project_root/
├── app/                          (Next.js フロントエンド)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/convert/route.ts
├── components/                   (React コンポーネント)
│   ├── sidebar.tsx
│   ├── chat-area.tsx
│   ├── article-input.tsx
│   └── convert-button.tsx
├── backend/                      (FastAPI バックエンド)
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
├── package.json
└── .env.local                    (環境変数)
\`\`\`

## 次のステップ

1. **Google Colab の Qwenモデルを統合**
   → `backend/main.py` の `convert_article_to_chat()` を実装

2. **環境変数を設定**
   → `.env.local` で `FASTAPI_URL` を確認

3. **本番環境にデプロイ**
   → `SETUP_GUIDE.md` の「デプロイ」セクションを参照

## トラブル時

1. CORS エラー → FastAPI CORS 設定確認
2. 502 エラー → FastAPI サーバー再起動
3. モデルエラー → Python 依存パッケージを再インストール

詳細は `SETUP_GUIDE.md` を参照してください。

---

**アプリケーション完成！** 🎉
