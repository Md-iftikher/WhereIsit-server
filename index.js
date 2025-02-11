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
        

        app.get("/getAllitems/email/:email", async (req, res) => {
            try {
                const email = req.params.email;
                // console.log("Received request for email:", email); 
        
                const query = { email: email }; 
                const results = await itemsCollection.find(query).toArray();
        
                // console.log("Items found:", results); 
                res.send(results);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        
      
        //delete item
        app.delete("/deleteitem/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })
        
        // update items 
        app.patch("/updateitem/:id", async (req, res) => {
            const itemId = req.params.id;
            const updateData = req.body;

            try {
                const result = await itemsCollection.updateOne(
                    { _id: new ObjectId(itemId) },
                    { $set: updateData }
                );

                if (result.modifiedCount === 0) {  
                    return res.status(404).json({ message: "Item not found or not updated" });
                }

                res.status(200).json({ message: "Item updated successfully", result }); 
            } catch (error) {
                console.error("Error updating item:", error);
                res.status(500).json({ message: "Error updating item", error: error.message });
            }
        });

        app.put("/replaceitem/:id", async (req, res) => {
            const itemId = req.params.id;
            let updatedItem = req.body;
        
            
            delete updatedItem._id;
        
            try {
                const result = await itemsCollection.updateOne(
                    { _id: new ObjectId(itemId) },
                    { $set: updatedItem }
                );
        
                if (result.modifiedCount === 0) {
                    return res.status(404).json({ message: "Item not found or not updated" });
                }
        
                res.status(200).json({ message: "Item replaced successfully", result });
            } catch (err) {
                console.error("Error replacing item:", err);
                res.status(500).json({ message: "Error replacing item", error: err.message });
            }
        });


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

        app.get("/AllRecoveryItems/:email", async (req, res) => {
            try {
                const email = req.params.email;
                // console.log("Received request for email:", email); 
        
                const query = { "recoveredBy.email" : email }; 
                const results = await RecoveryItemsCollection.find(query).toArray();
        
                // console.log("Items found:", results); 
                res.send(results);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ message: "Server error" });
            }
        });




        


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