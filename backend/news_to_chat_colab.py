# ============================================================
# News to Chat API - Google Colab版
# Swallow v0.3 (Llama 3.1ベース) を使用した会話変換
# ============================================================

# ============================================================
# 【セル1】ライブラリのインストール（初回のみ）
# ============================================================

"""
!pip install unsloth
!pip install xformers
!pip install trl peft accelerate bitsandbytes
!pip install pandas
!pip install fastapi uvicorn
!npm install -g localtunnel
"""

# ============================================================
# 【セル2】ライブラリのインポート
# ============================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import torch
import pandas as pd
from unsloth import FastLanguageModel
import io

print("✅ ライブラリのインポート完了")

# ============================================================
# 【セル3】記事データの初期化
# ============================================================

# 記事データを格納するリスト（初期は空）
ARTICLES = []

print("✅ 記事データの初期化完了（CSVはフロントエンドからアップロードします）")

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

class UploadResponse(BaseModel):
    message: str
    articles_count: int

@app.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """CSVファイルをアップロードして記事を読み込む"""
    global ARTICLES
    
    try:
        # ファイル内容を読み込む
        contents = await file.read()
        
        # CSVとして解析
        df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
        
        # 記事リストをクリア
        ARTICLES = []
        
        # honbunとmidasiカラムの確認
        if "honbun" in df.columns and "midasi" in df.columns:
            for idx in range(len(df)):
                ARTICLES.append({
                    "honbun": str(df["honbun"][idx]),
                    "midasi": str(df["midasi"][idx])
                })
        elif "honbun" in df.columns:
            for idx in range(len(df)):
                content = str(df["honbun"][idx])
                ARTICLES.append({
                    "honbun": content,
                    "midasi": content[:30] + "..."
                })
        else:
            raise HTTPException(
                status_code=400,
                detail=f"'honbun'カラムが見つかりません。カラム: {df.columns.tolist()}"
            )
        
        return UploadResponse(
            message=f"{len(ARTICLES)}件の記事を読み込みました",
            articles_count=len(ARTICLES)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSVの読み込みに失敗: {str(e)}")

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
# 【セル7】localtunnelでサーバーを公開（このセルを実行）
# ============================================================

"""
import subprocess
import threading
import nest_asyncio
import uvicorn

# nest_asyncioを適用（Colab環境で必要）
nest_asyncio.apply()

# localtunnelを別スレッドで起動
def start_localtunnel():
    subprocess.run(["lt", "--port", "8000"])

tunnel_thread = threading.Thread(target=start_localtunnel, daemon=True)
tunnel_thread.start()

print("🌐 localtunnelを起動中...")
print("⏳ 数秒後にURLが表示されます")
print("")
print("表示されたURLをフロントエンドの設定に使用してください")
print("")
print("注意: localtunnelは登録不要ですが、セッションごとにURLが変わります")
print("")

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
4. 表示されるlocaltunnel URLをフロントエンドに設定
5. フロントエンドからCSVファイルをアップロード

※ localtunnelは登録不要で使えます！

============================================================
""")
