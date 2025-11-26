import { type NextRequest, NextResponse } from "next/server"

const MOCK_ARTICLES = [
  {
    id: 1,
    content:
      "愛媛県は本日、県内観光の活性化を目指した新たな施策を発表した。この施策では、デジタル技術を活用した観光案内システムの導入や、地域の特産品を活かした体験型ツアーの開発などが含まれている。県の担当者は「持続可能な観光地づくりを目指し、地域経済の活性化につなげたい」と述べた。",
  },
  {
    id: 2,
    content:
      "松山市では、IT企業の進出が相次いでいる。市の支援制度や良好な生活環境が評価され、首都圏からの移転を検討する企業が増加している。市長は「デジタル人材の育成と雇用創出を両立させ、若者が活躍できるまちづくりを進めたい」とコメントした。",
  },
  {
    id: 3,
    content:
      "今治タオル工業組合は、海外市場への展開を強化する方針を発表した。品質の高さで知られる今治タオルは、アジアや欧米での需要が高まっており、現地パートナーとの協業を通じてブランド認知度の向上を図る。組合長は「日本のものづくりの価値を世界に届けたい」と意気込みを語った。",
  },
]

function generateMockConversation(articleId: number) {
  const article = MOCK_ARTICLES.find((a) => a.id === articleId)
  const content = article?.content || "記事が見つかりません"

  const conversations: Record<number, { summary: string; conversation: Array<{ role: string; content: string }> }> = {
    1: {
      summary: "愛媛県が観光活性化のため、デジタル観光案内と体験型ツアーを導入する新施策を発表。",
      conversation: [
        { role: "character_b", content: "博士、愛媛県で新しい観光の取り組みが始まるそうですね。" },
        {
          role: "character_a",
          content:
            "そうじゃ。デジタル技術を使った観光案内システムや、地元の特産品を活かした体験ツアーを開発するそうじゃ。",
        },
        { role: "character_b", content: "体験型ツアーって、どんなものがあるんでしょうか？" },
        {
          role: "character_a",
          content:
            "例えば、みかんの収穫体験や、今治タオルの工場見学なんかが考えられるのう。地域の魅力を直接感じられる内容じゃ。",
        },
        { role: "character_b", content: "持続可能な観光地づくりを目指しているんですね。" },
        {
          role: "character_a",
          content: "その通りじゃ。環境に配慮しながら、地域経済も活性化させる。これからの観光のあり方じゃな。",
        },
      ],
    },
    2: {
      summary: "松山市でIT企業の進出が加速。支援制度と生活環境が評価され、首都圏からの移転が増加。",
      conversation: [
        { role: "character_b", content: "博士、松山市にIT企業がたくさん来ているんですか？" },
        {
          role: "character_a",
          content:
            "そうなんじゃ。市の支援制度や生活のしやすさが評価されて、東京などから移転する企業が増えておるのじゃ。",
        },
        { role: "character_b", content: "どうしてIT企業は松山市を選ぶんでしょうか？" },
        {
          role: "character_a",
          content:
            "リモートワークが普及して、必ずしも東京にいなくても仕事ができるようになったからのう。家賃も安いし、自然も豊かじゃ。",
        },
        { role: "character_b", content: "若い人にとっても良いニュースですね。" },
        {
          role: "character_a",
          content: "うむ。市長もデジタル人材の育成に力を入れると言っておる。地元で働ける機会が増えるのは良いことじゃ。",
        },
      ],
    },
    3: {
      summary: "今治タオルが海外展開を強化。アジア・欧米での需要増加に応え、現地パートナーと協業へ。",
      conversation: [
        { role: "character_b", content: "今治タオルって海外でも人気なんですか？" },
        {
          role: "character_a",
          content: "そうじゃとも。品質の高さが評価されて、アジアや欧米で需要が高まっておるのじゃ。",
        },
        { role: "character_b", content: "どうしてそんなに品質が良いんですか？" },
        {
          role: "character_a",
          content:
            "今治は良質な水が豊富でな。それに、長年培われた職人の技術が合わさって、柔らかくて吸水性の高いタオルができるのじゃ。",
        },
        { role: "character_b", content: "日本のものづくりの価値を世界に届けたいそうですね。" },
        {
          role: "character_a",
          content:
            "うむ。現地のパートナー企業と協力して、もっと多くの人に知ってもらおうという計画じゃ。素晴らしいことじゃな。",
        },
      ],
    },
  }

  return (
    conversations[articleId] || {
      summary: "記事の要約を生成中...",
      conversation: [
        { role: "character_b", content: "この記事について教えてください。" },
        { role: "character_a", content: "FastAPIバックエンドを起動すると、実際のAI生成会話が表示されるのじゃ。" },
      ],
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_id } = body

    if (article_id === undefined || article_id === null) {
      return NextResponse.json({ error: "記事IDが必要です" }, { status: 400 })
    }

    const fastApiUrl = process.env.FASTAPI_URL

    if (fastApiUrl) {
      try {
        const response = await fetch(`${fastApiUrl}/convert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            article_id: article_id,
          }),
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

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockData = generateMockConversation(article_id)

    return NextResponse.json({
      ...mockData,
      processing_time: "1.50 秒 (デモモード)",
    })
  } catch (error) {
    console.error("API エラー:", error)
    return NextResponse.json({ error: "変換に失敗しました" }, { status: 500 })
  }
}
