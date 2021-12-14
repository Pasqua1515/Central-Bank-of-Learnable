require("dotenv").config()
const express = require("express")
const db = require("./db/db")
const cors = require("cors")
const router = require("express").Router()
const routeHandler = require("./routes/")(router)

const app = express()
const port = process.env.PORT || 5050

app.use(express.json())
app.use(cors())
app.use("/api", routeHandler)

app.listen(port, () => {
    console.log("server is up on port " + port)
})