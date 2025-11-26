import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_id } = body

    if (article_id === undefined || article_id === null) {
      return NextResponse.json({ error: "記事IDが必要です" }, { status: 400 })
    }

    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000"

    const response = await fetch(`${fastApiUrl}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article_id: article_id,
      }),
    })

    if (!response.ok) {
      throw new Error(`FastAPI エラー: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API エラー:", error)

    return NextResponse.json({
      summary: "これはモックの要約です。FastAPIバックエンドが起動するとSwallowモデルによる実際の要約が表示されます。",
      conversation: [
        { role: "character_b", content: "博士、このニュースについて教えてください。" },
        {
          role: "character_a",
          content: "これはサンプルの会話じゃ。バックエンドを起動すると実際のAI生成会話が表示されるのじゃ。",
        },
        { role: "character_b", content: "なるほど、FastAPIサーバーを起動する必要があるんですね。" },
        {
          role: "character_a",
          content: "その通りじゃ。backend/main.py を実行すれば、Swallowモデルが会話を生成してくれるぞ。",
        },
      ],
      processing_time: "0.00 秒 (モック)",
    })
  }
}
