const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const cors = require("cors");

dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {

        const db=client.db("WhereIsIt");
        const itemsCollection = db.collection("Items");
        //post a items
        app.post("/items", async (req,res)=>{
            const newitem = req.body;
            const result= await itemsCollection.insertOne(newitem);
            res.send(result);
        })


        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // You can add your routes and database operations here

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from WhereIsit Server....')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))