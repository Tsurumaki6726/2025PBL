"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CsvUploaderProps {
  apiUrl: string
  onUploadSuccess: () => void
}

export default function CsvUploader({ apiUrl, onUploadSuccess }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [uploadError, setUploadError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadError("")
      setUploadMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError("ファイルを選択してください")
      return
    }

    setIsUploading(true)
    setUploadError("")
    setUploadMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadMessage(data.message)
        setFile(null)
        onUploadSuccess()
      } else {
        const error = await response.json()
        setUploadError(error.detail || "アップロードに失敗しました")
      }
    } catch (error) {
      console.error("アップロードエラー:", error)
      setUploadError("アップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Upload CSV File</h3>
        <p className="text-sm text-muted-foreground mb-3">
          honbun（本文）とmidasi（見出し）カラムを含むCSVファイルをアップロードしてください。
        </p>
      </div>

      <div className="flex gap-2">
        <Input type="file" accept=".csv" onChange={handleFileChange} className="flex-1" disabled={isUploading} />
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? "アップロード中..." : "アップロード"}
        </Button>
      </div>

      {uploadMessage && <p className="text-sm text-green-600">{uploadMessage}</p>}
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
    </div>
  )
}
