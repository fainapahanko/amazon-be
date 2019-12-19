const express = require("express")
const server = express()
const booksRoute = require("./src/books/index")
const commentsRoute = require("./src/comments/index")
const cors = require("cors")
require('dotenv').config()

const port = process.env.PORT || 4400

server.use(express.json({limit: '5000mb'}))
server.use(cors())
server.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
})
server.use(express.static('./public/images'))
server.use("/books", booksRoute)
server.use("/comments", commentsRoute)

server.listen(port,() => {
    console.log("We are running on localhost " + port)
})