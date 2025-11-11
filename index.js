const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8vhjke1.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const db = client.db("echo-track_DB");
    const challengeCollection = db.collection("challenges");
    const tipCollection = db.collection("tips");
    const eventCollection = db.collection("events");
    const userChallengeCollection = db.collection("userChallenges");

    app.post("/userChallenges", async (req, res) => {
      const userChallenge = req.body;
      userChallenge.challengeId = new ObjectId(userChallenge.challengeId);

      const result = await userChallengeCollection.insertOne(userChallenge);
      res.send({ success: true, result });
    });

    app.get("/userChallenges", async (req, res) => {
      const result = await userChallengeCollection.find().toArray();
      res.send(result);
    });

    app.get("/challenges", async (req, res) => {
      const result = await challengeCollection.find().toArray();
      res.send(result);
    });

    app.get("/challenge/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await challengeCollection.findOne({ _id: objectId });
      res.send(result);
    });

    app.get("/active-challenges", async (req, res) => {
      const currentDate = new Date();
      const query = {
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      };

      const result = await challengeCollection
        .find(query)
        .sort({ endDate: 1 })
        .toArray();

      res.send(result);
    });

    app.post("/challenges", async (req, res) => {
      const data = req.body;
      data.startDate = new Date(data.startDate);
      data.endDate = new Date(data.endDate);
      data.duration = Math.max(
        0,
        Math.ceil((data.endDate - data.startDate) / (1000 * 60 * 60 * 24))
      );

      const result = await challengeCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    app.get("/my-activities", async (req, res) => {
      const email = req.query.email;
      const result = await userChallengeCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    app.get("/tips", async (req, res) => {
      const result = await tipCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      res.send(result);
    });

    app.get("/upcoming-events", async (req, res) => {
      const currentDate = new Date();
      const query = {
        date: { $gte: currentDate },
      };
      const result = await eventCollection.find(query).limit(4).toArray();

      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("Echo Track server is running fine!");
});

app.listen(port, () => {
  console.log(`Sever is listening on port ${port}`);
});
