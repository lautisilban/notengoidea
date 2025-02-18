"use client"

import { useState } from "react"
import { processFiles } from "../utils/pdfProcessor"
import FileUpload from "../components/FileUpload"
import ResultsTable from "../components/ResultsTable"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [results, setResults] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"xlsx" | "json" | "csv">("csv")
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true)
    setError(null)
    try {
      const processedData = await processFiles(files, outputFormat)
      if (typeof processedData === "string") {
        setResults(JSON.parse(processedData))
      } else if (Array.isArray(processedData)) {
        setResults(processedData)
      } else {
        throw new Error("Unexpected data format returned from processFiles")
      }
    } catch (error) {
      console.error("Error processing files:", error)
      setError(`Error processing files: ${error.message}`)
      setResults([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (results.length === 0) return

    try {
      let content: string | ArrayBuffer
      let mimeType: string
      let fileExtension: string

      switch (outputFormat) {
        case "xlsx":
          content = processFiles(results as any, "xlsx")
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          fileExtension = "xlsx"
          break
        case "json":
          content = JSON.stringify(results, null, 2)
          mimeType = "application/json"
          fileExtension = "json"
          break
        case "csv":
        default:
          content = processFiles(results as any, "csv")
          mimeType = "text/csv"
          fileExtension = "csv"
          break
      }

      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `processed_data.${fileExtension}`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      setError(`Error downloading file: ${error.message}`)
    }
  }

  return (
    <main className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">PDF Table Extractor</h1>

      <div className="mb-8 space-x-4">
        <Button variant={outputFormat === "xlsx" ? "default" : "secondary"} onClick={() => setOutputFormat("xlsx")}>
          XLSX
        </Button>
        <Button variant={outputFormat === "json" ? "default" : "secondary"} onClick={() => setOutputFormat("json")}>
          JSON
        </Button>
        <Button variant={outputFormat === "csv" ? "default" : "secondary"} onClick={() => setOutputFormat("csv")}>
          CSV
        </Button>
      </div>

      <FileUpload onUpload={handleFileUpload} isProcessing={isProcessing} />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="w-full mt-8">
          <ResultsTable data={results} />
          <div className="mt-8 flex justify-center">
            <Button onClick={handleDownload} variant="default">
              Download {outputFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

