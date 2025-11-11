const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyznij5.mongodb.net/smart_db?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dabt5dh.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart server is running");
});

async function run() {
  try {
    await client.connect();

    // const db = client.db("smart_db");
    const db = client.db("habit_db");
    const habitsCollection = db.collection("habits");
    const bidsCollection = db.collection("bids");
    const usersCollection = db.collection("users");

    // USERS APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // habits APIs
    app.get("/habits", async (req, res) => {
      // const projectFields = { title: 1, price_min: 1, price_max: 1, image: 1 }
      // const cursor = habitsCollection.find().sort({ price_min: -1 }).skip(2).limit(2).project(projectFields);

      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = habitsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latest-habits", async (req, res) => {
      const cursor = habitsCollection.find().sort({ createdAt: -1 }).limit(6);

      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habitsCollection.findOne(query);
      res.send(result);
    });

    app.post("/habits", async (req, res) => {
      const newHabit = req.body;
      newHabit.createdAt = new Date()
      const result = await habitsCollection.insertOne(newHabit);
      res.send(result);
    });

    app.patch("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const updatedHabit = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          startTime: updatedHabit.startTime,
        },
      };

      const result = await habitsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habitsCollection.deleteOne(query);
      res.send(result);
    });

    // bids related apis
    app.get("/createHabit", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/habits/createHabit/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/createHabit", async (req, res) => {
      const query = {};
      if (query.email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/createHabit", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    app.delete("/createHabit/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart server is running on port: ${port}`);
});
