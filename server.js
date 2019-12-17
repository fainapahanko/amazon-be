const express = require("express")
const server = express()
const booksRoute = require("./src/books/index")
const commentsRoute = require("./src/comments/index")
const cors = require("cors")
require('dotenv').config()

const port = process.env.PORT || 4000

server.use(express.json())

var whitelist = ['http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

server.use("/books", cors(corsOptions), booksRoute)
server.use("/comments", cors(corsOptions), commentsRoute)

server.get("/", () => {
    res.send("toyoy")
})


server.listen(port,() => {
    console.log("We are running on localhost " + port)
})