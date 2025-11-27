import { NextResponse } from "next/server"

const MOCK_ARTICLES = [
  {
    id: 0,
    preview: "愛媛県で新しい観光施策が発表",
    content:
      "愛媛県は本日、県内観光の活性化を目指した新たな施策を発表した。この施策では、デジタル技術を活用した観光案内システムの導入や、地域の特産品を活かした体験型ツアーの開発などが含まれている。県の担当者は「持続可能な観光地づくりを目指し、地域経済の活性化につなげたい」と述べた。",
  },
  {
    id: 1,
    preview: "松山市でIT企業の進出が加速",
    content:
      "松山市では、IT企業の進出が相次いでいる。市の支援制度や良好な生活環境が評価され、首都圏からの移転を検討する企業が増加している。市長は「デジタル人材の育成と雇用創出を両立させ、若者が活躍できるまちづくりを進めたい」とコメントした。",
  },
  {
    id: 2,
    preview: "今治タオルが海外展開を強化",
    content:
      "今治タオル工業組合は、海外市場への展開を強化する方針を発表した。品質の高さで知られる今治タオルは、アジアや欧米での需要が高まっており、現地パートナーとの協業を通じてブランド認知度の向上を図る。組合長は「日本のものづくりの価値を世界に届けたい」と意気込みを語った。",
  },
]

export async function GET() {
  const FASTAPI_URL = process.env.FASTAPI_URL

  if (FASTAPI_URL) {
    try {
      const response = await fetch(`${FASTAPI_URL}/articles`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
      console.error("FastAPI response not ok:", response.status)
    } catch (error) {
      console.error("FastAPI connection error:", error)
    }
  }

  // Return mock data for v0 preview or when backend is not available
  return NextResponse.json({
    articles: MOCK_ARTICLES,
  })
}
