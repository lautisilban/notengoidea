"use client"

import { useState, useEffect } from "react"
import { processFiles } from "../utils/pdfProcessor"
import FileUpload from "../components/FileUpload"
import ResultsTable from "../components/ResultsTable"
import * as pdfjsLib from "pdfjs-dist"

export default function Home() {
  const [results, setResults] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"xlsx" | "json" | "csv">("csv")

  useEffect(() => {
    const script = document.createElement("script")
    script.src = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true)
    try {
      const processedData = await processFiles(files)
      setResults(processedData)
    } catch (error) {
      console.error("Error processing files:", error)
      alert("Error processing files. Please try again.")
    }
    setIsProcessing(false)
  }

  const handleDownload = () => {
    if (results.length === 0) return

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (outputFormat) {
      case "xlsx":
        // For simplicity, we'll just use CSV for XLSX as well
        content = results.map((row) => Object.values(row).join(",")).join("\n")
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
        content = results.map((row) => Object.values(row).join(",")).join("\n")
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
  }

  return (
    <main className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">PDF Processor</h1>

      <div className="mb-8 space-x-4">
        <button
          onClick={() => setOutputFormat("xlsx")}
          className={`px-4 py-2 rounded ${outputFormat === "xlsx" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          XLSX
        </button>
        <button
          onClick={() => setOutputFormat("json")}
          className={`px-4 py-2 rounded ${outputFormat === "json" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          JSON
        </button>
        <button
          onClick={() => setOutputFormat("csv")}
          className={`px-4 py-2 rounded ${outputFormat === "csv" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          CSV
        </button>
      </div>

      <FileUpload onUpload={handleFileUpload} isProcessing={isProcessing} />

      {results.length > 0 && (
        <div className="w-full mt-8">
          <ResultsTable data={results} />
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download {outputFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

