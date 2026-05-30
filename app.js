require("dotenv").config()
const express = require('express')
const cors = require("cors");
const mongoose = require('mongoose')

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const Router = require('./routers/transferRouter')
app.use(express.json())


const dbURI = process.env.DB_URI
const PORT = process.env.PORT

mongoose.connect(dbURI)
                .then(() => app.listen(PORT,() => {
                    console.log(`Server listening on ${PORT}`)
                }))
                .catch((error) => console.log(error))

app.use(Router)


