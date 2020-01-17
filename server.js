const express = require("express")
const server = express()
const productsRouter = require("./src/products/index")
const reviewsRoute = require("./src/comments/index")
const cors = require("cors")
const bodyParser = require('body-parser');
//const path = require("path")
require('dotenv').config()

const port = process.env.PORT || 4400

//server.use(express.json({limit: '5000mb'}))
server.use(cors())
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
server.use("/img", express.static("img"))
server.use("/products", productsRouter)
server.use("/reviews", reviewsRoute)

server.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.status(err.httpStatusCode || 500).send(err);
    }
});

server.listen(port,() => {
    console.log("We are running on localhost " + port)
})