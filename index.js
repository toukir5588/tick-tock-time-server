// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

// Build Mongo URI: prefer MONGO_URI, otherwise use DB_USER/DB_PASS pair
const MONGO_URI = process.env.MONGO_URI || (() => {
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  if (!user || !pass) return null;
  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@cluster0.dabt5dh.mongodb.net/?retryWrites=true&w=majority`;
})();

if (!MONGO_URI) {
  console.error("ERROR: No MongoDB connection string found. Set MONGO_URI or DB_USER & DB_PASS.");
}

const client = new MongoClient(MONGO_URI || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart server is running");
});

// Health endpoint for Vercel / monitoring
app.get("/health", async (req, res) => {
  try {
    // quick ping
    if (!client || !client.topology || !client.topology.isConnected()) {
      return res.status(500).send({ status: "error", message: "Mongo client not connected" });
    }
    res.send({ status: "ok" });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

async function run() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI. Aborting DB connect.");
    return;
  }

  try {
    // IMPORTANT: connect client before using collections
    await client.connect();
    console.log("MongoDB connected");

    // const db = client.db("products_db");
    const productsCollection = db.collection("products");
    const cartsCollection = db.collection("carts");
    const usersCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const email = newUser.email;
        if (!email) return res.status(400).send({ message: "Email required" });

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.send({ message: "user already exists. do not need to insert again" });
        } else {
          const result = await usersCollection.insertOne(newUser);
          res.send(result);
        }
      } catch (err) {
        console.error("/users error:", err);
        res.status(500).send({ message: "Server error creating user" });
      }
    });

    app.get("/products", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};
        if (email) query.email = email;
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error("/products error:", err);
        res.status(500).send({ message: "Server error fetching products" });
      }
    });

    app.get("/latest-products", async (req, res) => {
      try {
        const result = await productsCollection.find().sort({ createdAt: -1 }).limit(8).toArray();
        res.send(result);
      } catch (err) {
        console.error("/latest-products error:", err);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.findOne(query);
        if (!result) return res.status(404).send({ message: "Product not found" });
        res.send(result);
      } catch (error) {
        console.error("/products/:id error:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/products", async (req, res) => {
      try {
        const productData = req.body;
        productData.createdAt = new Date();
        const result = await productsCollection.insertOne(productData);
        res.send(result);
      } catch (err) {
        console.error("POST /products error:", err);
        res.status(500).send({ message: "Server error adding product" });
      }
    });

    app.post("/carts", async (req, res) => {
      try {
        const { email, productId, quantity = 1 } = req.body;
        if (!email || !productId) {
          return res.status(400).send({ message: "Email and productId are required." });
        }

        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) return res.status(404).send({ message: "Product not found." });

        const cartItem = {
          productId: new ObjectId(productId),
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        };

        const existingCart = await cartsCollection.findOne({ email });

        if (existingCart) {
          const itemIndex = existingCart.items.findIndex(item => item.productId.equals(cartItem.productId));
          if (itemIndex > -1) {
            existingCart.items[itemIndex].quantity += quantity;
          } else {
            existingCart.items.push(cartItem);
          }
          const result = await cartsCollection.updateOne(
            { email },
            { $set: { items: existingCart.items, updatedAt: new Date() } }
          );
          res.send(result);
        } else {
          const newCart = {
            email,
            items: [cartItem],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result = await cartsCollection.insertOne(newCart);
          res.send(result);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send({ message: "Failed to add product to cart." });
      }
    });

    app.get("/myProducts", async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { email } : {};
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error("/myProducts error:", err);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.error("DELETE /products/:id error:", err);
        res.status(500).send({ message: "Server error deleting product" });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Mongo connect / server error:", err);
  }
}

run().catch(err => console.error("Run() uncaught error:", err));

module.exports = app;
