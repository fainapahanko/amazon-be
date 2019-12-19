const express = require("express")
const server = express()
const booksRoute = require("./src/books/index")
const commentsRoute = require("./src/comments/index")
const cors = require("cors")
require('dotenv').config()

const port = process.env.PORT || 4400

server.use(express.json({limit: '5000mb'}))
server.use(cors())

server.use(express.static('./public/images'))
server.use("/books", booksRoute)
server.use("/comments", commentsRoute)

server.listen(port,() => {
    console.log("We are running on localhost " + port)
})