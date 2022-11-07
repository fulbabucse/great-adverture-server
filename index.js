const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Great Adventure with Fahim Server Running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbConnect = async () => {
  try {
    const Services = client.db("greatAdventure").collection("services");
    const Reviews = client.db("greatAdventure").collection("reviews");
    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      res.send(result);
      console.log(result);
    });

    app.get("/home-services", async (req, res) => {
      const query = {};
      const cursor = Services.find(query);
      const result = await cursor.limit(3).toArray();
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = Services.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Services.findOne(query);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await Reviews.insertOne(review);
      res.send(result);
      console.log(result);
    });
  } finally {
  }
};
dbConnect().catch((err) => console.log(err.name, err.message));

app.listen(port, () => {
  console.log(`Great Adventure with Fahim Server Running on: ${port}`);
});
