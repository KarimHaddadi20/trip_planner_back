import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import bodyParser from "body-parser";

app.use(bodyParser.json());

import mongoose from "mongoose";

app.post("/games", async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_SRV);
    const dbGames = mongoose.connection.db.collection("games");
    const games = await dbGames.find({}).toArray();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({});
  }
});

app.get("/games/:id", async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_SRV);
    const dbGames = mongoose.connection.db.collection("games");
    const game = await dbGames.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });

    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ });
  }
});
app.get("/test", async (req, res) => {
  await mongoose.connect(process.env.MONGODB_SRV);
  const dbGames = mongoose.connection.db.collection("games");
  await dbGames.insertOne({
    title: "MineCraft",
  });
  res.status(201).json({ res: "OK" });
});

app.get("/", (req, res) => {
  res.json({ hello: "World" });
});


app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
