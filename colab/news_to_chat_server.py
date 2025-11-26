# ============================================================
# News to Chat: Google Colab Backend Server
# ============================================================
# このファイルの内容をGoogle Colabにコピーして使用してください。
# 各セルの区切りは「# ====== CELL X ======」で示しています。
# ============================================================

# ====== CELL 1: ライブラリのインストール ======
# 最初に実行してください（約3-5分かかります）

"""
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes
!pip install fastapi uvicorn pyngrok nest-asyncio pandas
"""

# ====== CELL 2: ngrok認証トークンの設定 ======
# https://dashboard.ngrok.com/get-started/your-authtoken から取得してください

"""
NGROK_AUTH_TOKEN = "your_ngrok_auth_token_here"  # ここにトークンを貼り付け

from pyngrok import ngrok
ngrok.set_auth_token(NGROK_AUTH_TOKEN)
"""

# ====== CELL 3: モデルのロード ======
# GPU接続を確認してから実行してください（約2-3分かかります）

"""
import torch
from unsloth import FastLanguageModel

print("=" * 50)
print("モデルをロード中...")
print("=" * 50)

# モデル設定
MODEL_NAME = "tokyotech-llm/Swallow-7b-instruct-v0.1"
MAX_SEQ_LENGTH = 2048
DTYPE = None
LOAD_IN_4BIT = True

# モデルとトークナイザーをロード
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=DTYPE,
    load_in_4bit=LOAD_IN_4BIT,
)

# 推論モードに設定
FastLanguageModel.for_inference(model)

print("=" * 50)
print("モデルのロードが完了しました")
print("=" * 50)
"""

# ====== CELL 4: CSVデータのアップロードと読み込み ======
# Colabにehime_kiji_001.csvをアップロードしてから実行

"""
import pandas as pd
from google.colab import files

# ファイルをアップロード（ポップアップが表示されます）
print("CSVファイルをアップロードしてください...")
uploaded = files.upload()

# アップロードされたファイル名を取得
csv_filename = list(uploaded.keys())[0]
print(f"アップロードされたファイル: {csv_filename}")

# CSVを読み込み
df = pd.read_csv(csv_filename)
print(f"記事数: {len(df)}")
print(f"カラム: {df.columns.tolist()}")
df.head()
"""

# ====== CELL 5: 会話生成関数の定義 ======

"""
def generate_conversation(article_text: str) -> dict:
    '''
    記事テキストから要約と会話を生成する
    '''
    import time
    start_time = time.time()
    
    # Step 1: 要約を生成
    summary_prompt = f'''以下のニュース記事を3文程度で要約してください。

記事:
{article_text}

要約:'''
    
    inputs = tokenizer(summary_prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.7,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
    summary = summary.replace(summary_prompt, "").strip()
    
    # Step 2: 会話形式に変換
    conversation_prompt = f'''以下の要約を、博士と生徒の会話形式に変換してください。
博士は専門的な解説をし、生徒は質問をする形式でお願いします。

要約:
{summary}

会話:
博士:'''
    
    inputs = tokenizer(conversation_prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.8,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    conversation_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    conversation_text = "博士:" + conversation_text.split("博士:")[-1].strip()
    
    # 会話をパース
    messages = []
    lines = conversation_text.split("\n")
    
    for line in lines:
        line = line.strip()
        if line.startswith("博士:") or line.startswith("博士："):
            content = line.replace("博士:", "").replace("博士：", "").strip()
            if content:
                messages.append({"role": "博士", "content": content})
        elif line.startswith("生徒:") or line.startswith("生徒："):
            content = line.replace("生徒:", "").replace("生徒：", "").strip()
            if content:
                messages.append({"role": "生徒", "content": content})
    
    # メッセージが空の場合のフォールバック
    if not messages:
        messages = [
            {"role": "博士", "content": summary},
            {"role": "生徒", "content": "なるほど、よく分かりました。"},
        ]
    
    elapsed_time = time.time() - start_time
    
    return {
        "summary": summary,
        "conversation": messages,
        "processing_time": round(elapsed_time, 2)
    }

print("会話生成関数を定義しました")
"""

# ====== CELL 6: FastAPIサーバーの定義 ======

"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import nest_asyncio
import uvicorn

# nest_asyncioを適用（Colab環境用）
nest_asyncio.apply()

# FastAPIアプリケーション
app = FastAPI(
    title="News to Chat API",
    description="ニュース記事を会話形式に変換するAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエスト/レスポンスモデル
class Article(BaseModel):
    id: int
    title: str
    content: str
    date: Optional[str] = None

class ConvertRequest(BaseModel):
    article_id: int
    article_text: str

class Message(BaseModel):
    role: str
    content: str

class ConvertResponse(BaseModel):
    summary: str
    conversation: List[Message]
    processing_time: float

# エンドポイント
@app.get("/")
async def root():
    return {"message": "News to Chat API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": MODEL_NAME}

@app.get("/articles", response_model=List[Article])
async def get_articles():
    '''CSVから記事一覧を取得'''
    articles = []
    for idx, row in df.iterrows():
        articles.append(Article(
            id=idx,
            title=row.get("title", row.get("タイトル", f"記事 {idx + 1}")),
            content=row.get("content", row.get("本文", row.get("記事本文", ""))),
            date=str(row.get("date", row.get("日付", "")))
        ))
    return articles

@app.post("/convert", response_model=ConvertResponse)
async def convert_article(request: ConvertRequest):
    '''記事を会話形式に変換'''
    try:
        result = generate_conversation(request.article_text)
        return ConvertResponse(
            summary=result["summary"],
            conversation=[Message(**msg) for msg in result["conversation"]],
            processing_time=result["processing_time"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

print("FastAPIサーバーを定義しました")
"""

# ====== CELL 7: サーバーの起動（ngrokトンネル） ======
# このセルを実行すると、公開URLが表示されます

"""
import threading

# ngrokトンネルを開始
public_url = ngrok.connect(8000)
print("=" * 60)
print("サーバーが起動しました!")
print("=" * 60)
print(f"公開URL: {public_url}")
print("=" * 60)
print("")
print("このURLをNext.jsの環境変数に設定してください:")
print(f"FASTAPI_URL={public_url}")
print("")
print("=" * 60)

# サーバーをバックグラウンドで起動
def run_server():
    uvicorn.run(app, host="0.0.0.0", port=8000)

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()

print("サーバーはバックグラウンドで実行中です")
print("Colabのセッションを閉じるとサーバーも停止します")
"""

# ====== CELL 8: 動作確認（オプション） ======

"""
import requests

# ヘルスチェック
response = requests.get(f"{public_url}/health")
print("ヘルスチェック:", response.json())

# 記事一覧取得
response = requests.get(f"{public_url}/articles")
articles = response.json()
print(f"記事数: {len(articles)}")

# テスト変換（最初の記事で試す）
if articles:
    test_article = articles[0]
    print(f"テスト記事: {test_article['title'][:50]}...")
    
    response = requests.post(
        f"{public_url}/convert",
        json={
            "article_id": test_article["id"],
            "article_text": test_article["content"]
        }
    )
    result = response.json()
    print(f"処理時間: {result['processing_time']}秒")
    print(f"要約: {result['summary'][:100]}...")
    print(f"会話数: {len(result['conversation'])}ターン")
"""
