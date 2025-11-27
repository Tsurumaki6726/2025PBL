# ============================================================
# News to Chat API - FastAPI Backend
# Swallow v0.3 (Llama 3.1ベース) を使用した会話変換
# ============================================================

# --- セル1相当: ライブラリインポート ---
# pip install で以下をインストール済みの前提:
# unsloth, xformers, trl, peft, accelerate, bitsandbytes, pandas, fastapi, uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import os

# --- セル2相当: モデル関連インポート ---
import torch
import pandas as pd
from unsloth import FastLanguageModel

# ============================================================
# 設定
# ============================================================

# Swallow v0.3 (Llama 3.1ベースの最新日本語モデル)
MODEL_ID = "tokyotech-llm/Llama-3.1-Swallow-8B-Instruct-v0.3"

CSV_FILE_NAME = os.path.join(os.path.dirname(__file__), "articles", "ehime_kiji_001.csv")
COLUMN_NAME = "honbun"

# ============================================================
# グローバル変数（モデルと記事データ）
# ============================================================

model = None
tokenizer = None
ARTICLES = []

# ============================================================
# FastAPI アプリケーション
# ============================================================

app = FastAPI(
    title="News to Chat API",
    description="Swallow v0.3を使用してニュース記事を会話形式に変換するAPI",
    version="1.0.0"
)

# CORS設定（ローカル開発用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# リクエスト/レスポンスモデル
# ============================================================

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
    preview: str  # This will now hold midasi (headline)
    content: str  # honbun (article body)

class ArticlesResponse(BaseModel):
    articles: list[ArticleItem]

# ============================================================
# セル2相当: データの読み込み
# ============================================================

def load_articles():
    """CSVファイルから記事を読み込む"""
    global ARTICLES
    
    print(f"📂 ファイル確認中: {CSV_FILE_NAME}")
    
    if os.path.exists(CSV_FILE_NAME):
        try:
            df = pd.read_csv(CSV_FILE_NAME, encoding="utf-8")
            if "honbun" in df.columns and "midasi" in df.columns:
                ARTICLES = []
                for idx in range(len(df)):
                    ARTICLES.append({
                        "honbun": str(df["honbun"][idx]),
                        "midasi": str(df["midasi"][idx])
                    })
                print(f"✅ CSV読み込み成功: {len(ARTICLES)} 件の記事をロードしました。")
            elif "honbun" in df.columns:
                # Fallback: honbun only (midasi not available)
                ARTICLES = []
                for idx in range(len(df)):
                    content = str(df["honbun"][idx])
                    ARTICLES.append({
                        "honbun": content,
                        "midasi": content[:30] + "..."  # Use first 30 chars as preview
                    })
                print(f"✅ CSV読み込み成功 (honbunのみ): {len(ARTICLES)} 件の記事をロードしました。")
            else:
                print(f"❌ 列名 'honbun' が見つかりません。")
                ARTICLES = []
        except Exception as e:
            print(f"❌ CSVエラー: {e}")
            ARTICLES = []
    else:
        print(f"❌ エラー: '{CSV_FILE_NAME}' が見つかりません。")
        ARTICLES = []

# ============================================================
# セル3相当: Swallowモデルのロード
# ============================================================

def load_model():
    """Swallowモデルをロードする（初回のみ）"""
    global model, tokenizer
    
    if model is not None:
        return True
    
    if not ARTICLES:
        print("⚠️ 記事がロードされていません。")
        return False
    
    print(f"⏳ [{MODEL_ID}] をロードしています...")
    print("※Swallowは高精度なため、初回ダウンロードとロードに3〜5分程度かかります。")
    
    try:
        # Unslothを使ってSwallowを4bit量子化でロード
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name=MODEL_ID,
            max_seq_length=4096,  # Swallowは長文に強いため長めに確保
            dtype=None,
            load_in_4bit=True,
        )
        FastLanguageModel.for_inference(model)
        print("✅ Swallowモデルのロードが完了しました！")
        return True
    except Exception as e:
        print(f"❌ モデルロードエラー: {e}")
        model = None
        tokenizer = None
        return False

# ============================================================
# セル4相当: 生成処理（Swallowに最適化したプロンプト）
# ============================================================

def process_article(article_id: int) -> dict:
    """
    記事を要約し、会話形式に変換する
    
    Returns:
        dict: {
            "summary": str,
            "conversation": list[dict],
            "processing_time": str
        }
    """
    global model, tokenizer, ARTICLES
    
    if model is None:
        raise Exception("モデルがロードされていません。")
    
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
        temperature=0.3,  # 事実関係を正確にするため低め
        use_cache=True
    )
    summary_text = tokenizer.decode(
        outputs1[0][inputs1.shape[-1]:],
        skip_special_tokens=True
    )
    
    # --- ステップB: 会話変換 (Swallowのロールプレイ能力活用) ---
    roleplay_prompt = [
        {
            "role": "system",
            "content": """
あなたはプロの脚本家です。
以下の【要約】の内容を、二人の登場人物の会話劇（スクリプト）に書き換えてください。

【登場人物】
1. **博士**: 語尾は「〜じゃ」「〜じゃのう」を使う。知恵袋のような老人。
2. **生徒**: 丁寧語（〜ですね、〜ですか？）で話す。教えを乞う若者。

【構成ルール】
- 挨拶は省略し、生徒が記事の内容について質問するところから始めること。
- 博士が解説し、生徒が納得する流れにすること。
- 記事に含まれない情報は創作しないこと。
- 会話は「生徒: 」「博士: 」の形式で記述すること。
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
        temperature=0.7,  # 会話の自然さを出すため少し上げる
        use_cache=True
    )
    conversation_text = tokenizer.decode(
        outputs2[0][inputs2.shape[-1]:],
        skip_special_tokens=True
    )
    
    elapsed_time = time.time() - start_time
    
    # 会話テキストをパースしてリストに変換
    conversation = parse_conversation(conversation_text)
    
    return {
        "summary": summary_text,
        "conversation": conversation,
        "processing_time": f"{elapsed_time:.2f} 秒"
    }


def parse_conversation(text: str) -> list[dict]:
    """
    会話テキストをパースして構造化データに変換
    
    例:
    "生徒: こんにちは\n博士: やあ"
    → [{"role": "character_b", "content": "こんにちは"}, {"role": "character_a", "content": "やあ"}]
    """
    lines = text.strip().split("\n")
    conversation = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith("博士:") or line.startswith("博士："):
            content = line.replace("博士:", "").replace("博士：", "").strip()
            if content:
                conversation.append({"role": "character_a", "content": content})
        elif line.startswith("生徒:") or line.startswith("生徒："):
            content = line.replace("生徒:", "").replace("生徒：", "").strip()
            if content:
                conversation.append({"role": "character_b", "content": content})
    
    return conversation

# ============================================================
# APIエンドポイント
# ============================================================

@app.get("/articles", response_model=ArticlesResponse)
async def get_articles():
    """CSVから読み込んだ記事一覧を返す"""
    articles = []
    for i, article in enumerate(ARTICLES):
        preview = article["midasi"]  # Use midasi as preview
        articles.append(ArticleItem(
            id=i,
            preview=preview,
            content=article["honbun"]
        ))
    return ArticlesResponse(articles=articles)


@app.post("/convert", response_model=ConvertResponse)
async def convert_endpoint(request: ConvertRequest):
    """記事を会話形式に変換する"""
    try:
        if model is None:
            raise HTTPException(
                status_code=503,
                detail="モデルがまだロードされていません。しばらくお待ちください。"
            )
        
        result = process_article(request.article_id)
        
        return ConvertResponse(
            summary=result["summary"],
            conversation=[
                ConversationMessage(**msg) for msg in result["conversation"]
            ],
            processing_time=result["processing_time"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"エラーが発生しました: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "articles_count": len(ARTICLES)
    }

# ============================================================
# 起動時の初期化
# ============================================================

@app.on_event("startup")
async def startup_event():
    """アプリ起動時にモデルと記事をロード"""
    print("🚀 News to Chat API を起動しています...")
    load_articles()
    load_model()
    print("✅ 起動完了！")

# ============================================================
# メイン実行
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
