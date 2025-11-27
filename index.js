const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        const db = client.db("products_db");
        const productsCollection = db.collection("products");
        const cartsCollection = db.collection("carts");
        const usersCollection = db.collection("users");

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

        app.get("/products", async (req, res) => {
            console.log(req.query);
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }

            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/latest-products", async (req, res) => {
            const cursor = productsCollection.find().sort({ createdAt: -1 }).limit(8);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            console.log(`Requested ID: ${id}`); 
            
            try {
                const query = { _id: new ObjectId(id) };
                const result = await productsCollection.findOne(query);
                
                console.log('Database Result:', result); 
                
                res.send(result);

            } catch (error) {
                console.error('Error:', error);
                res.status(500).send({ message: "Server error" });
            }
        });

        app.post("/products", async (req, res) => {
            const productData = req.body; 
            productData.createdAt = new Date();
            const result = await productsCollection.insertOne(productData);
            res.send(result);
        });

        app.post("/carts", async (req, res) => {
    const { email, productId, quantity = 1 } = req.body;

    if (!email || !productId) {
        return res.status(400).send({ message: "Email and productId are required." });
    }

    try {
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).send({ message: "Product not found." });
        }

        const cartItem = {
            productId: new ObjectId(productId),
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
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
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { email: email };
            }

            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

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