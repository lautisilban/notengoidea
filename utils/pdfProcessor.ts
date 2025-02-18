import * as pdfjsLib from "pdfjs-dist"
import * as XLSX from "xlsx"

// Set up the worker source
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function processFiles(files: FileList, outputFormat = "json"): Promise<any> {
  const results: any[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const arrayBuffer = await file.arrayBuffer()

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages

      for (let j = 1; j <= numPages; j++) {
        const page = await pdf.getPage(j)
        const textContent = await page.getTextContent()
        const text = textContent.items.map((item: any) => item.str).join(" ")

        const tables = extractTablesFromText(text)
        results.push(...tables)
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      throw new Error(`Failed to process file ${file.name}: ${error.message}`)
    }
  }

  // Convert results to the selected output format
  return convertToFormat(results, outputFormat)
}

function extractTablesFromText(text: string): any[] {
  // This is a simple implementation and may not work for all PDFs
  // You might need to adjust this based on the structure of your PDFs
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const tables: any[] = []
  let currentTable: string[][] = []

  for (const line of lines) {
    const cells = line.split(/\s{2,}/)
    if (cells.length > 1) {
      currentTable.push(cells)
    } else if (currentTable.length > 0) {
      tables.push(processTable(currentTable))
      currentTable = []
    }
  }

  if (currentTable.length > 0) {
    tables.push(processTable(currentTable))
  }

  return tables
}

function processTable(table: string[][]): any[] {
  if (!table || table.length === 0) return []

  const headers = table[0]
  const data = table.slice(1)

  return data.map((row) => {
    const rowData: any = {}
    headers.forEach((header, index) => {
      rowData[header] = row[index]
    })
    return rowData
  })
}

function convertToFormat(data: any[], format: string): any {
  try {
    switch (format) {
      case "xlsx":
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
        return XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      case "csv":
        return XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data))
      case "json":
      default:
        return JSON.stringify(data, null, 2)
    }
  } catch (error) {
    console.error("Error converting data to format:", error)
    throw new Error(`Failed to convert data to ${format} format: ${error.message}`)
  }
}

