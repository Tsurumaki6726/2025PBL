import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article, tone } = body

    if (!article) {
      return NextResponse.json({ error: "記事テキストが必要です" }, { status: 400 })
    }

    // FastAPIサーバーへのリクエスト
    // 環境変数から FastAPI サーバーのURLを取得
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000"

    const response = await fetch(`${fastApiUrl}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article: article,
        tone: tone,
      }),
    })

    if (!response.ok) {
      throw new Error(`FastAPI エラー: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API エラー:", error)
    return NextResponse.json({ error: "ユーザーの処理に失敗しました" }, { status: 500 })
  }
}
