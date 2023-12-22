const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dokkyfc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const todoCollection = client.db("todo").collection("todos");

    // Create a single new todo
    app.post("/todos", async (req, res) => {
      const newTodo = req.body;
      const result = await todoCollection.insertOne(newTodo);
      console.log("Got a POST request for the homepage");
      res.json(result);
    });

    app.get("/todos", async (req, res) => {
      const cursor = todoCollection.find({});
      const todos = await cursor.toArray();
      res.json(todos);
    });

    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todoCollection.deleteOne(query);
      res.json(result);
    });

    app.patch("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTodo = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedTodo.status,
        },
      };
      const result = await todoCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.get("/todos/:userEmail", async (req, res) => {
      const userEmail = req.params.userEmail;
      const query = { userEmail: userEmail };
      const cursor = todoCollection.find(query);
      const todos = await cursor.toArray();
      res.json(todos);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
