# ============================================================
# News to Chat API - Google Colab版
# Swallow v0.3 (Llama 3.1ベース) を使用した会話変換
# ============================================================
# このファイルをGoogle Colabにコピー＆ペーストして使用してください
# セルごとに分けて実行することを推奨します
# ============================================================

# ============================================================
# 【セル1】ライブラリのインストール（初回のみ）
# ============================================================
# 以下を1つのセルで実行してください

"""
!pip install unsloth
!pip install xformers
!pip install trl peft accelerate bitsandbytes
!pip install pandas
!pip install fastapi uvicorn pyngrok
"""

# ============================================================
# 【セル2】ライブラリのインポート
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import torch
import pandas as pd
from unsloth import FastLanguageModel

print("✅ ライブラリのインポート完了")

# ============================================================
# 【セル3】CSVファイルのアップロードと読み込み
# ============================================================

from google.colab import files

# CSVファイルをアップロード
print("📂 CSVファイルをアップロードしてください...")
uploaded = files.upload()

# アップロードされたファイル名を取得
CSV_FILE_NAME = list(uploaded.keys())[0]
print(f"✅ アップロード完了: {CSV_FILE_NAME}")

# 記事データを格納するリスト
ARTICLES = []

# CSVを読み込む
df = pd.read_csv(CSV_FILE_NAME, encoding="utf-8")
print(f"📊 カラム一覧: {df.columns.tolist()}")

if "honbun" in df.columns and "midasi" in df.columns:
    for idx in range(len(df)):
        ARTICLES.append({
            "honbun": str(df["honbun"][idx]),
            "midasi": str(df["midasi"][idx])
        })
    print(f"✅ {len(ARTICLES)} 件の記事をロードしました")
    print(f"📝 最初の記事の見出し: {ARTICLES[0]['midasi']}")
elif "honbun" in df.columns:
    for idx in range(len(df)):
        content = str(df["honbun"][idx])
        ARTICLES.append({
            "honbun": content,
            "midasi": content[:30] + "..."
        })
    print(f"✅ {len(ARTICLES)} 件の記事をロード（honbunのみ）")
else:
    print(f"❌ 'honbun'カラムが見つかりません。カラム: {df.columns.tolist()}")

# ============================================================
# 【セル4】Swallowモデルのロード（3〜5分かかります）
# ============================================================

MODEL_ID = "tokyotech-llm/Llama-3.1-Swallow-8B-Instruct-v0.3"

print(f"⏳ Swallowモデルをロード中...")
print("※初回は3〜5分かかります。お待ちください...")

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_ID,
    max_seq_length=4096,
    dtype=None,
    load_in_4bit=True,
)
FastLanguageModel.for_inference(model)

print("✅ Swallowモデルのロード完了！")

# ============================================================
# 【セル5】生成関数の定義
# ============================================================

def parse_conversation(text: str) -> list:
    """会話テキストをパースして構造化データに変換"""
    lines = text.strip().split("\n")
    conversation = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith("先生:") or line.startswith("先生："):
            content = line.replace("先生:", "").replace("先生：", "").strip()
            if content:
                conversation.append({"role": "character_a", "content": content})
        elif line.startswith("生徒:") or line.startswith("生徒："):
            content = line.replace("生徒:", "").replace("生徒：", "").strip()
            if content:
                conversation.append({"role": "character_b", "content": content})
    
    return conversation


def process_article(article_id: int) -> dict:
    """記事を要約し、会話形式に変換する"""
    
    if article_id < 0 or article_id >= len(ARTICLES):
        raise Exception(f"無効な記事ID: {article_id}")
    
    original_text = ARTICLES[article_id]["honbun"]
    start_time = time.time()
    
    # --- ステップA: 要約 ---
    summary_prompt = [
        {
            "role": "system",
            "content": "あなたは優秀な編集者です。以下のニュース記事の要点を、事実に基づいて200文字程度の日本語で要約してください。"
        },
        {
            "role": "user",
            "content": f"## 記事本文\n{original_text}"
        }
    ]
    
    inputs1 = tokenizer.apply_chat_template(
        summary_prompt,
        add_generation_prompt=True,
        tokenize=True,
        return_tensors="pt"
    ).to(model.device)
    
    outputs1 = model.generate(
        inputs1,
        max_new_tokens=300,
        temperature=0.3,
        use_cache=True
    )
    summary_text = tokenizer.decode(
        outputs1[0][inputs1.shape[-1]:],
        skip_special_tokens=True
    )
    
    # --- ステップB: 会話変換 ---
    roleplay_prompt = [
        {
            "role": "system",
            "content": """
あなたはプロの脚本家です。
以下の【要約】の内容を、二人の登場人物の会話劇（スクリプト）に書き換えてください。

【登場人物】
1. **先生**: 丁寧語（〜です、〜ますね、〜でしょう）で話す。親しみやすく分かりやすく教える教師。
2. **生徒**: 丁寧語（〜ですね、〜ですか？）で話す。教えを乞う学習者。

【構成ルール】
- 挨拶は省略し、生徒が記事の内容について質問するところから始めること。
- 先生が丁寧に解説し、生徒が納得する流れにすること。
- 記事に含まれない情報は創作しないこと。
- 会話は「生徒: 」「先生: 」の形式で記述すること。
- 最低でも4往復（合計8行以上）の会話にすること。
"""
        },
        {
            "role": "user",
            "content": f"【要約】\n{summary_text}\n\nこの内容で会話劇を作成してください。"
        }
    ]
    
    inputs2 = tokenizer.apply_chat_template(
        roleplay_prompt,
        add_generation_prompt=True,
        tokenize=True,
        return_tensors="pt"
    ).to(model.device)
    
    outputs2 = model.generate(
        inputs2,
        max_new_tokens=1024,
        temperature=0.7,
        use_cache=True
    )
    conversation_text = tokenizer.decode(
        outputs2[0][inputs2.shape[-1]:],
        skip_special_tokens=True
    )
    
    elapsed_time = time.time() - start_time
    conversation = parse_conversation(conversation_text)
    
    return {
        "summary": summary_text,
        "conversation": conversation,
        "processing_time": f"{elapsed_time:.2f} 秒"
    }

print("✅ 生成関数の定義完了")

# ============================================================
# 【セル6】FastAPIアプリの定義
# ============================================================

app = FastAPI(
    title="News to Chat API",
    description="Swallow v0.3を使用してニュース記事を会話形式に変換するAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエスト/レスポンスモデル
class ConvertRequest(BaseModel):
    article_id: int

class ConversationMessage(BaseModel):
    role: str
    content: str

class ConvertResponse(BaseModel):
    summary: str
    conversation: list[ConversationMessage]
    processing_time: str

class ArticleItem(BaseModel):
    id: int
    preview: str
    content: str

class ArticlesResponse(BaseModel):
    articles: list[ArticleItem]

# エンドポイント
@app.get("/articles", response_model=ArticlesResponse)
async def get_articles():
    """記事一覧を返す（previewにはmidasiを使用）"""
    articles = []
    for i, article in enumerate(ARTICLES):
        articles.append(ArticleItem(
            id=i,
            preview=article["midasi"],
            content=article["honbun"]
        ))
    return ArticlesResponse(articles=articles)

@app.post("/convert", response_model=ConvertResponse)
async def convert_endpoint(request: ConvertRequest):
    """記事を会話形式に変換する"""
    try:
        result = process_article(request.article_id)
        return ConvertResponse(
            summary=result["summary"],
            conversation=[
                ConversationMessage(**msg) for msg in result["conversation"]
            ],
            processing_time=result["processing_time"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "articles_count": len(ARTICLES)
    }

print("✅ FastAPIアプリの定義完了")

# ============================================================
# 【セル7】ngrokでサーバーを公開（このセルを実行）
# ============================================================
# 以下を別のセルで実行してください

"""
from pyngrok import ngrok
import nest_asyncio
import uvicorn

# ngrokの認証トークンを設定（https://dashboard.ngrok.com/get-started/your-authtoken で取得）
# ngrok.set_auth_token("YOUR_NGROK_AUTH_TOKEN")

# nest_asyncioを適用（Colab環境で必要）
nest_asyncio.apply()

# ngrokトンネルを開始
public_url = ngrok.connect(8000)
print(f"🌐 公開URL: {public_url}")
print(f"📋 このURLをフロントエンドの設定に使用してください")
print(f"")
print(f"API エンドポイント:")
print(f"  - GET  {public_url}/articles  - 記事一覧")
print(f"  - POST {public_url}/convert   - 会話変換")
print(f"  - GET  {public_url}/health    - ヘルスチェック")

# サーバー起動
uvicorn.run(app, host="0.0.0.0", port=8000)
"""

# ============================================================
# 使い方まとめ
# ============================================================
print("""
============================================================
📖 使い方
============================================================

1. 【セル1】のpipコマンドを実行（初回のみ）
2. 【セル2】〜【セル6】を順番に実行
3. 【セル7】のコメントを外して実行
4. 表示されるngrok URLをフロントエンドに設定

※ ngrokの認証トークンが必要です：
   https://dashboard.ngrok.com/get-started/your-authtoken

============================================================
""")
