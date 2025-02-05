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
        const RecoveryItemsCollection=db.collection("RecoveryItems");
        //post a items
        app.post("/Additems", async (req,res)=>{
            const newitem = req.body;
            const result= await itemsCollection.insertOne(newitem);
            res.send(result);
        })

        //getting item
        app.get("/getAllitems", async (req,res)=>{
            const result = await itemsCollection.find().toArray();
            res.send(result);
        })
       
        // getting item by id
        app.get("/getAllitems/:id",async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id) };
            const result=await itemsCollection.findOne(query);
            res.send(result);
        })
      
        //delete item
        app.delete("/deleteitem/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })


        //recovey items collection
        app.post("/Recoveryitems",async(req,res)=>{
            const newitem = req.body;
            const result=await RecoveryItemsCollection.insertOne(newitem);
            res.send(result);
        })
        app.get("/AllRecoveryItems",async(req,res)=>{
            const result = await RecoveryItemsCollection.find().toArray();
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