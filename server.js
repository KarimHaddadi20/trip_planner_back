import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import bodyParser from "body-parser";

app.use(bodyParser.json());


mongoose
  .connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

// Routes

// GET /itineraires : pour récupérer tous les itinéraires.
app.get("/itineraires", async (req, res) => {
  try {
    const dbItineraires = mongoose.connection.db.collection("itineraires");
    const itineraires = await dbItineraires.find({}).toArray();
    res.status(200).json(itineraires);
  } catch (error) {
    res.status(500).json({});
  }
});

// GET /itineraires/:id : pour récupérer un itinéraire spécifique.
app.get("/itineraires/:id", async (req, res) => {
  try {
    const dbItineraires = mongoose.connection.db.collection("itineraires");
    const itineraire = await dbItineraires.findOne({_id: mongoose.Types.ObjectId(req.params.id)});
    res.status(200).json(itineraire);
  } catch (error) {
    res.status(500).json({});
  }
});

// POST /itineraires : pour créer un nouvel itinéraire.
app.post("/itineraires", async (req, res) => {
  try {
    const dbItineraires = mongoose.connection.db.collection("itineraires");
    const result = await dbItineraires.insertOne(req.body);
    const itineraire = result.ops[0]; // Le nouvel itinéraire inséré
    res.status(200).json(itineraire);
  } catch (error) {
    res.status(500).json({});
  }
});

// PUT /itineraires/:id : pour mettre à jour un itinéraire existant.
app.put("/itineraires/:id", async (req, res) => {
  try {
    const dbItineraires = mongoose.connection.db.collection("itineraires");
    const result = await dbItineraires.updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: req.body});
    if (result.modifiedCount === 1) {
      const itineraire = await dbItineraires.findOne({_id: mongoose.Types.ObjectId(req.params.id)});
      res.status(200).json(itineraire);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    res.status(500).json({});
  }
});

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
