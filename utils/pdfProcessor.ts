import * as pdfjsLib from "pdfjs-dist"

// Ensure the worker is available
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function processFiles(files: FileList): Promise<any[]> {
  const results: any[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const numPages = pdf.numPages
    let fullText = ""

    for (let j = 1; j <= numPages; j++) {
      const page = await pdf.getPage(j)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }

    // Here you need to implement the logic to extract and structure the data
    // This is a simple example that splits the text into lines and assumes each line is a field
    const lines = fullText.split("\n").filter((line) => line.trim() !== "")
    const structuredData: Record<string, string> = {}

    lines.forEach((line, index) => {
      const [key, value] = line.split(":").map((part) => part.trim())
      if (key && value) {
        structuredData[key] = value
      } else {
        structuredData[`Field${index + 1}`] = line.trim()
      }
    })

    results.push(structuredData)
  }

  return results
}

