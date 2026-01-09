# News to Chat App

ニュース記事を「先生」と「生徒」の会話形式に自動変換するWebアプリケーション

## 概要

このアプリは、ニュース記事（CSV形式）をLLM（大規模言語モデル）で処理し、分かりやすい会話形式に変換します。

- **フロントエンド**: Next.js + React + Tailwind CSS
- **バックエンド**: Python + FastAPI + Swallow LLM (8B)
- **実行環境**: Google Colab (GPU)

## システム構成

```
フロントエンド (Next.js)
    ↓ HTTP接続
バックエンド (Google Colab + localtunnel)
    ↓ CSVアップロード
記事データ (honbun, midasi)
```

## セットアップ手順

### 前提条件

- Node.js 18以上
- Google アカウント（Colab用）
- **登録不要**: localtunnelはアカウント登録なしで使えます！

### 1. リポジトリのクローン

```bash
git clone <このリポジトリのURL>
cd 2025PBL
```

### 2. フロントエンドのセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

### 3. Google Colab のセットアップ

#### 3-1. Colabノートブックを開く

配布された `news_to_chat_colab.py` をGoogle Colabで開く

#### 3-2. 記事CSVを準備

記事データをCSV形式で準備（必須カラム: `honbun`, `midasi`）
ehime_kiji_001.csvをダウンロードすればOK

例:
```csv
honbun,midasi
"記事本文の内容がここに入ります...", "記事の見出し"
"別の記事本文...", "別の見出し"
```

#### 3-3. Colabを実行

1. 「ランタイム」→「すべてのセルを実行」
2. 最後のセルで **localtunnel URL** が表示される（例: `https://xxxx.loca.lt`）
3. このURLをコピー
4. URLをwebの検索欄に貼り付け
5. パスワードを入力してclick to submitを押下

### 4. アプリの使用

1. フロントエンド（`http://localhost:3000`）を開く
2. 入力欄に **localtunnel URL** を貼り付け
3. 「接続」をクリック
4. **CSVファイルをアップロード**（フロントエンドから直接アップロード可能）
5. 記事を選択して「会話形式に変換」をクリック

## 使い方

### CSVファイルのアップロード

1. 接続後、左パネルに「Upload CSV File」セクションが表示される
2. 「ファイルを選択」でCSVファイルを選択
3. 「アップロード」ボタンをクリック
4. 記事一覧が表示される

### 記事の選択

1. 左パネルの記事一覧から記事を選択
2. 選択した記事の内容がプレビュー表示される

### 会話形式への変換

1. 「会話形式に変換」ボタンをクリック
2. 処理が完了するまで待つ（10〜30秒程度）
3. 右パネルに会話が表示される

### 会話の構成

- **先生（character_a）**: 解説役、丁寧語（〜です、〜ますね）
- **生徒（character_b）**: 質問役、丁寧語（〜ですね、〜ですか？）

## トラブルシューティング

### 「接続できません」と表示される

- Google Colabが起動しているか確認
- localtunnel URLが正しいか確認
- Colabのセッションが切れていないか確認

### 「記事が表示されない」

- CSVファイルが正しくアップロードされているか確認
- CSVに `honbun` と `midasi` カラムがあるか確認

### CSVアップロードに失敗する

- ファイルがCSV形式（UTF-8エンコード）か確認
- `honbun` カラムが存在するか確認（`midasi`は任意）

### メモリエラーが出る

- Google Colab無料版のGPU制限に達している可能性
- 時間を置いてから再実行

### 処理が遅い

- モデルサイズが大きい場合は処理に時間がかかります
- GPU制限に近づいている可能性があります

## モデルの変更

バックエンド（Colabノートブック）の `MODEL_ID` を変更することで、使用するLLMを変更できます。

```python
# 例: より高性能な13Bモデルに変更
MODEL_ID = "tokyotech-llm/Llama-3.1-Swallow-13B-Instruct-v0.3"
```

注意: モデルサイズが大きいほどメモリを消費します。

## 注意事項

- Google Colab無料版ではGPU使用時間に制限があります
- Colabセッションは最大12時間、アイドル時間90分で切断されます
- localtunnelは登録不要ですが、セッションごとにURLが変わります
- 記事データに個人情報が含まれる場合は取り扱いに注意してください


## ライセンス

このプロジェクトは無償提供を前提としています。

### コードのライセンス

- **フロントエンド**: MIT License
  - Next.js, React, Tailwind CSS, shadcn/ui など
- **バックエンド**: MIT / Apache 2.0 License
  - FastAPI, unsloth, transformers など

### LLMモデルのライセンス

- **Swallow (Llama 3.1 based)**: Llama 3.1 Community License
  - ライセンス詳細: https://llama.meta.com/llama3/license/
  - 非商用利用であれば制限なく使用可能
  - 商用利用の場合は月間アクティブユーザー（MAU）が7億未満まで可能




