const path = require("path")
const pdfPrinter = require("pdfmake")
const fs = require("fs-extra")

const createPdf = (title, price, asin, img, category) =>
    new Promise((resolve, reject) => {
    try{
        const fonts = {
            Roboto: {
                normal: "Helvetica",
                bold: "Helvetica-Bold",
                italics: "Helvetica-Oblique",
                bolditalics: "Helvetica-BoldOblique"
            }
        }
        const printer = new pdfPrinter(fonts)
        const pdfContent = {
            content: [
                {
                    text: 'Book detail'
                },
                {
                    table: {
                        body: [
                            [{ text: 'page #1', bold: true }, { text: 'title', bold: true }],
                            [{ text: `Title: ${title}`, alignment: 'left' }, '01'],
                            [{ text: `Asin: ${asin}`, alignment: 'left' }, '02'],
                            [{ text: `Price: ${price}$`, alignment: 'left' }, '03'],
                            [{ text: `Category: ${category}`, alignment: 'left' }, '04'],
                            [{
                                image: `${img}`
                            }, '05']
                        ]
                    }
                }
            ]
        }
        const pdfPath = path.join(__dirname, `../../public/pdfs/${asin}.pdf`)
        console.log(pdfPath)
        const pdfDocument = printer.createPdfKitDocument(pdfContent, {})
        pdfDocument.pipe(fs.createWriteStream(pdfPath))
        pdfDocument.end()
        resolve()
    } catch(err){
        console.log(err)
        reject(err)
    }
})

module.exports = createPdf