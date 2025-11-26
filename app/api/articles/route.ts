import { NextResponse } from "next/server"

export async function GET() {
  const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

  try {
    const response = await fetch(`${FASTAPI_URL}/articles`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch articles")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching articles:", error)

    // Return mock data for development without backend
    return NextResponse.json({
      articles: [
        {
          id: 1,
          preview: "サンプル記事1...",
          content: "これはサンプル記事1の本文です。FastAPIバックエンドが起動していない場合に表示されます。",
        },
        {
          id: 2,
          preview: "サンプル記事2...",
          content: "これはサンプル記事2の本文です。バックエンドを起動するとCSVから記事が読み込まれます。",
        },
      ],
    })
  }
}
