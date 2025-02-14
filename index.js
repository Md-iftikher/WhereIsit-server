const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionalSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "Unauthorized access" });
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    const db = client.db("WhereIsIt");
    const itemsCollection = db.collection("Items");
    const RecoveryItemsCollection = db.collection("RecoveryItems");

    // Generate JWT
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout
    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Verify Token Endpoint
    app.get("/verify-token", (req, res) => {
      res.send({ success: true, user: req.user });
    });

    // Add an item
    app.post("/Additems", async (req, res) => {
      const newitem = req.body;
      const result = await itemsCollection.insertOne(newitem);
      res.send(result);
    });

    // Get all items
    app.get("/getAllitems", async (req, res) => {
      const result = await itemsCollection.find().toArray();
      res.send(result);
    });

    // Get item by ID
    app.get("/getAllitems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });
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

    // Delete item
    app.delete("/deleteitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    // Update item
    app.patch("/updateitem/:id", async (req, res) => {
      const itemId = req.params.id;
      const updateData = req.body;

      const result = await itemsCollection.updateOne(
        { _id: new ObjectId(itemId) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Item not found or not updated" });
      }

      res.status(200).json({ message: "Item updated successfully", result });
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
          return res
            .status(404)
            .json({ message: "Item not found or not updated" });
        }

        res.status(200).json({ message: "Item replaced successfully", result });
      } catch (err) {
        console.error("Error replacing item:", err);
        res
          .status(500)
          .json({ message: "Error replacing item", error: err.message });
      }
    });

    //recovey items collection
    app.post("/Recoveryitems", async (req, res) => {
      const newitem = req.body;
      const result = await RecoveryItemsCollection.insertOne(newitem);
      res.send(result);
    });
    app.get("/AllRecoveryItems", async (req, res) => {
      const result = await RecoveryItemsCollection.find().toArray();
      res.send(result);
    });

    app.get("/AllRecoveryItems/:email", async (req, res) => {
      try {
        const email = req.params.email;
        // console.log("Received request for email:", email);

        const query = { "recoveredBy.email": email };
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
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // You can add your routes and database operations here
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from WhereIsit Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
