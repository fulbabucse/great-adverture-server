const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Great Adventure with Fahim Server Running");
});

// JWT Token Verify
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// Mongodb URL
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbConnect = async () => {
  try {
    // All Collections
    const Services = client.db("greatAdventure").collection("services");
    const Reviews = client.db("greatAdventure").collection("reviews");

    // JWT Token From Client Side
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // Service Create
    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      res.send(result);
    });

    // Home page 3 Services added
    app.get("/home-services", async (req, res) => {
      const query = {};
      const cursor = Services.find(query);
      const result = await cursor.limit(3).toArray();
      res.send(result);
    });

    // All Services for Services page
    app.get("/services", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = Services.find(query);
      const services = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await Services.estimatedDocumentCount();
      res.send({ count, services });
    });

    // Every Single Service for Details
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Services.findOne(query);
      res.send(result);
    });

    // Create Review from Client side
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await Reviews.insertOne(review);
      res.send(result);
    });

    // All Reviews Display UI by Descending orders
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }
      const cursor = Reviews.find(query);
      const result = await cursor.sort({ createAt: -1 }).toArray();
      res.send(result);
    });

    // Every Customer Review, Secure with JWT Token
    app.get("/customerReview", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbidden access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = Reviews.find(query);
      const result = await cursor.sort({ createAt: -1 }).toArray();
      res.send(result);
    });

    // Every single Reviews Delete from My Reviews
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Reviews.deleteOne(query);
      res.send(result);
    });

    // Every Single Review get
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Reviews.findOne(query);
      res.send(result);
    });

    // Every Single Review for Updates
    app.put("/review/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const query = { _id: ObjectId(id) };
      const updatesReview = {
        $set: {
          review: review.review,
          rating: review.rating,
          createAt: review.createAt,
          fullDateAndTime: review.fullDateAndTime,
        },
      };
      const result = await Reviews.updateOne(query, updatesReview);
      res.send(result);
    });
  } finally {
  }
};
dbConnect().catch((err) => console.log(err.name, err.message));

app.listen(port, () => {
  console.log(`Great Adventure with Fahim Server Running on: ${port}`);
});
