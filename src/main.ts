import express, { Express, Request, Response } from "express";
import cors from 'cors'; 

const app: Express = express()

const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

app.get('/', (req: Request , res: Response) => {
    res.send("Bienvenido Pato!")
}) 

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`)
})




