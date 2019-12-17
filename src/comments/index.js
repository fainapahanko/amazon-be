const express = require("express")
const fs = require("fs-extra")
const router = express.Router()
const path = require("path")
const uuid = require('uuid/v1');
const { check, validationResult, sanitizeBody } = require("express-validator")

const commentsPath = path.join(__dirname, "../../data/comments.json")

const readComments = async() => {
    const buffer = await fs.readFile(commentsPath)
    return JSON.parse(buffer.toString())
}

const writeComments = async(data) => {
    await fs.writeFile(commentsPath, JSON.stringify(data))
}

router.get("/", async(req,res) => {
    return res.send(await readComments())
})

router.get("/:commentID", async(req, res) => {
    const comments = await readComments()
    const comment = comments.find(comment => comment.commentID === req.params.commentID)
    if(comment) return res.status(200).send(comment)
    else return res.status(404).send("Non found")
})

router.post("/:asin",[
    check("bookID")
        .exists().withMessage("Asin is required"),
    check("text")
        .isLength({min:4,max:1000}).withMessage("Text is required"),
    check("userName")
        .isLength({min:4,max:50}),
    sanitizeBody("asin").toInt()
    ],
    async(req,res) => {
        const comments = await readComments()
        const obj = {
            ...req.body,
            bookID: req.params.asin,
            commentID: uuid(),
            createdAt: new Date()
        }
        const errors = validationResult(req)
        if(!errors.isEmpty()) return res.status(400).send({errors: errors.array()})
        comments.push(obj)
        await writeComments(comments)
        return res.status(200).send("OK")
})

router.delete("/:commentID", async(req,res) => {
    const comments = await readComments()
    const filteredComments = comments.filter(comment => comment.commentID !== req.params.commentID)
    if(filteredComments.length === comments.length) return res.status(404).send("Not found")
    else {
        await writeBooks(filteredComments)
        return res.status(200).send("Deleted")
    }
})

module.exports = router