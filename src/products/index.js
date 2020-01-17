const express = require("express")
const fs = require("fs-extra")
const router = express.Router()
const path = require("path")
const db = require("../../db")
// const uuid = require("uuid/v1")
// const createPdf = require("../lib/pdfMaker")
//const { check, validationResult, sanitizeBody } = require("express-validator")
const multer = require("multer")
//const { Transform } = require("json2csv");

router.get('/', async(req,res) => {
    try{
        if(req.query.category){
            const products = await db.query(`SELECT * FROM Products WHERE category = $1`,[req.query.category])
            res.status(200).send({
                products: products.rows,
                total: products.rowCount
            })
        } else {
            const products = await db.query(`SELECT * FROM Products`)
            res.status(200).send({
                products: products.rows,
                total: products.rowCount
            })
        }
    } catch(err){
        res.send(err)
    }
})

router.get('/:id', async(req,res) => {
    try{
        const products = await db.query(`SELECT * FROM Products WHERE _id = $1`, [req.params.id])
        res.status(200).send(products.rows[0])
    } catch(err){
        res.send(err)
    }
})

router.get("/:id/reviews", async(req,res) => {
    try{
        const reviews = await db.query(`SELECT * FROM Reviews WHERE productId = $1`, [req.params.id])
        res.status(200).send(reviews.rows)
    } catch(err){
        res.send(err)
    }
})

const upload = multer({})
router.post('/', upload.single("imageUrl"), async(req,res) => {
    try{
        const imgDest = path.join(__dirname, "../../img/")
        await fs.writeFile(imgDest + req.file.originalname, req.file.buffer)
        const imgDestination = req.protocol + "://" + req.get("host") + "/img/" + req.file.originalname;
        const product = await db.query(`INSERT INTO Products 
                                        (name, description, brand, imageUrl, price, category)
                                        VALUES($1, $2, $3, $4, $5, $6)
                                        RETURNING *`,
                                        [req.body.name, req.body.description,req.body.brand, imgDestination, req.body.price, req.body.category])
        return res.status(200).send(product)
    } catch(err){
        res.send(err)
    }
})

router.put("/:id",upload.single("imageUrl"), async(req,res) => {
    try{
        if(req.file){
            const imgDest = path.join(__dirname, "../../public/img/")
            const fileName = req.file.originalname  + path.extname(req.file.originalname)
            await fs.writeFile(imgDest + fileName, req.file.buffer)
            req.body.imageUrl = req.protocol + "://" + req.get("host") + "/img/" + fileName;
        }
        const product = await db.query(`UPDATE Products 
                                        SET name = $1,
                                        description = $2,
                                        brand = $3,
                                        imageUrl = $4,
                                        price = $5,
                                        category = $6 
                                        WHERE _id = $7`,
                                        [req.body.name, req.body.description,req.body.brand, imgDestination, req.body.price, req.body.category])
        res.status(200).send(product)
    } catch(err){
        res.send(err)
    }
})

router.delete("/:id", async(req,res) => {
    const product = await db.query(`DELETE FROM Products WHERE _id = $1`, [req.params.id])
    if(product.rowCount === 1)res.status(200).send("OK")
    else res.status(404).send("Not found")
})

// const readBooks = async() => {
//     const buffer = await fs.readFile(booksPath)
//     return JSON.parse(buffer.toString())
// }

// const writeBooks = async(data) => {
//     await fs.writeFile(booksPath, JSON.stringify(data))
// }

// router.get("/", async(req,res) => {
//     return res.send(await readBooks())
// })

// router.get("/sendEmail", (req,res) => {
//     const sgMail = require('@sendgrid/mail');
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//         to: 'f.poganko@gmail.com',
//         from: 'hello-yo@example.com',
//         subject: 'Hello',
//         text: 'Yo',
//         html: '<strong>Yo</strong>',
//     };
//     sgMail.send(msg);
//     res.send("OK")
// })

// router.get("/csv", async(req, res) => {
//     const filePath = path.join(__dirname, "../../data/books.json");
  
//     const fields = ["title", "price", "asin", "category"];
//     const opts = { fields };
  
//     const json2csv = new Transform(opts);
//     res.setHeader("Content-Disposition", `attachment; filename=file.csv`);
//     const ended = fs.createReadStream(filePath)
//         .pipe(json2csv)
//         .pipe(res)
//   });

// router.get("/:asin/exportToPDF", async(req,res) => {
//     const books = await readBooks()
//     const book = books.find(book => book.asin === req.params.asin)
//     if(book){
//         const asin = book.asin
//         const title = book.title
//         const category = book.category
//         const price = book.price
//         const img = book.img
//         await createPdf(title, price, asin, img, category)
//         return res.status(200).send("OK")
//     } else {
//         return res.status(404).send("book not found")
//     }
// })

// router.get("/:asin", async(req, res) => {
//     const books = await readBooks()
//     const book = books.find(book => book.asin === req.params.asin)
//     if(book) return res.status(200).send(book)
//     else return res.status(404).send("Non found")
// })

// const upload = multer({})
// router.post("/", upload.single("img"),
// // [
// //     check("asin")
// //         .exists().withMessage("Asin is required"),
// //     check("title")
// //         .isLength({min:4,max:50}).withMessage("Title is required"),
// //     check("price")
// //         .isNumeric().withMessage("Price should be a number"),
// //     check("category")
// //         .exists().withMessage("Category is required"),
// //     sanitizeBody("price").toFloat()
// //     ],
//     async(req,res) => {
//         const books = await readBooks()
//         const obj = {
//             ...req.body,
//             updatedAt: new Date()
//         }
//         const imgDest = path.join(__dirname, "../../public/img/" + obj.asin + ".jpg")
//         await fs.writeFile(imgDest, req.file.buffer)
//         obj.img = imgDest
//         // const err = validationResult(req)
//         // if(!err.isEmpty()) return res.status(400).send({errors: err.array()})
//         books.push(obj)
//         await writeBooks(books)
//         return res.status(200).send("OK")
// })

// router.put("/:asin", async(req, res) => {
//     const books = await readBooks()
//     const book = books.find(book => book.asin === req.params.asin)
//     if(book){
//         const position = books.indexOf(book)
//         const updatedBook = Object.assign(book, req.body)
//         books[position] = updatedBook
//         await writeBooks(books)
//         res.status(200).send(updatedBook)
//     } else return res.status(404).send("Book not found")
// })

// router.delete("/:asin", async(req,res) => {
//     const books = await readBooks()
//     const filteredBooks = books.filter(book => book.asin !== req.params.asin)
//     if(filteredBooks.length === books.length) return res.status(404).send("Not found")
//     else {
//         await writeBooks(filteredBooks)
//         return res.status(200).send("Deleted")
//     }
// })

module.exports = router