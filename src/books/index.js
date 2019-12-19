const express = require("express")
const fs = require("fs-extra")
const router = express.Router()
const path = require("path")
const uuid = require("uuid/v1")
const { check, validationResult, sanitizeBody } = require("express-validator")
const multer = require("multer")
const booksPath = path.join(__dirname, "../../data/books.json")

const readBooks = async() => {
    const buffer = await fs.readFile(booksPath)
    return JSON.parse(buffer.toString())
}

const writeBooks = async(data) => {
    await fs.writeFile(booksPath, JSON.stringify(data))
}

router.get("/", async(req,res) => {
    return res.send(await readBooks())
})

router.get("/:asin", async(req, res) => {
    const books = await readBooks()
    const book = books.find(book => book.asin === req.params.asin)
    if(book) return res.status(200).send(book)
    else return res.status(404).send("Non found")
})

const upload = multer({})
router.post("/",[
    check("asin")
        .exists().withMessage("Asin is required"),
    check("title")
        .isLength({min:4,max:50}).withMessage("Title is required"),
    check("price")
        .isNumeric().withMessage("Price should be a number"),
    check("category")
        .exists().withMessage("Category is required"),
    sanitizeBody("price").toFloat()
    ], upload.single("img"),
    async(req,res) => {
        const books = await readBooks()
        const obj = {
            ...req.body,
            updatedAt: new Date()
        }
        const imgDest = path.join(__dirname, "../../public/img/" + obj.asin + ".jpg")
        await fs.writeFile(imgDest, req.file.buffer)
        obj.img = imgDest
        const errors = validationResult(req)
        if(!errors.isEmpty()) return res.status(400).send({errors: errors.array()})
        books.push(obj)
        await writeBooks(books)
        return res.status(200).send("OK")
})

router.put("/:asin", async(req, res) => {
    const books = await readBooks()
    const book = books.find(book => book.asin === req.params.asin)
    if(book){
        const position = books.indexOf(book)
        const updatedBook = Object.assign(book, req.body)
        books[position] = updatedBook
        await writeBooks(books)
        res.status(200).send(updatedBook)
    } else return res.status(404).send("Book not found")
})

router.delete("/:asin", async(req,res) => {
    const books = await readBooks()
    const filteredBooks = books.filter(book => book.asin !== req.params.asin)
    if(filteredBooks.length === books.length) return res.status(404).send("Not found")
    else {
        await writeBooks(filteredBooks)
        return res.status(200).send("Deleted")
    }
})

module.exports = router