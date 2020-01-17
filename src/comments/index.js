const express = require("express")
//const fs = require("fs-extra")
const router = express.Router()
const db = require("../../db")
//const path = require("path")
//const uuid = require('uuid/v1');
//const { check, validationResult, sanitizeBody } = require("express-validator")

//const commentsPath = path.join(__dirname, "../../data/comments.json")

router.get('/',async(req,res) => {
    try{
        const reviews = await db.query("SELECT * FROM Reviews")
        res.status(200).send(reviews.rows)
    }catch(err) {
        console.log(err)
        res.send(err)
    }
})

router.get('/:id',async(req,res) => {
    try{
        const reviews = await db.query(`SELECT * FROM Reviews WHERE _id = $1`, [req.params.id])
        res.status(200).send(reviews.rows)
    }catch(err) {
        console.log(err)
        res.send(err)
    }
})

router.post("/:id", async (req,res) => {
    try{
        const review = await db.query(`INSERT INTO Reviews 
        (productid,  comment, rate)
        VALUES($1, $2, $3)
        RETURNING Reviews`,
        [req.params.id, req.body.comment, req.body.rate])
        return res.send(review.rows[0])
    } catch(err){
        res.send(err)
    }
})

module.exports = router