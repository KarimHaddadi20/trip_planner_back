import express, { json } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import cors from "cors";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

app.use(express.json());
app.use(cors());

// Define Zod schema for PATCH /trips/:id
const patchTripSchema = z.object({
  prompt: z.string(),
});

// Routes

// GET /trips : pour récupérer l'historique des trips.
app.get("/trips", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();
    res.status(200).json(trips);
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

// GET /trips/:id : pour récupérer un voyage spécifique.
app.get("/trips/:id", async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: Number(req.params.id) },
    });
    res.status(200).json(trip);
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

// POST /trips : pour créer un nouveau voyage.
const prePrompt =
  "Tu es un planificateur de voyage, expert en tourisme. Pour la destination, le nombre de jours et le moyen de locomotion que je te donnerai à la fin du message, programme moi un itinéraire en plusieurs étapes Format de données souhaité: une liste d'élement en JSON, avec, pour chaque étape: - le nom du lieu (clef JSON: name) -sa position géographique (clef JSON: location-> avec latitude/longitude en numérique) - une courte description du lieu (clef JSON: description) Donne-moi uniquement cette liste d'étape JSON, tu as interdiction de rajouter des informations supplémentaires en dehors de la liste JSON.Tu ne dois pas rajouter de texte ou des commentaires après m'avoir envoyé la liste JSON.";
app.post("/trips", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'The field "prompt" is required.' });
  }

  try {
    // Envoyer une requête à l'API Mistral
    const mistralResponse = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [{ role: "user", content: prePrompt + "" + prompt }],
        }),
      }
    );

    const mistralData = await mistralResponse.json();

    // Utiliser la réponse de l'API Mistral pour créer un nouveau voyage
    const trip = await prisma.trip.create({
      data: {
        prompt,
        output: JSON.parse(mistralData.choices[0].message.content),
      },
    });

    res.status(200).json(trip);
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

// PATCH /trips/:id : pour modifier un voyage existant.
app.patch("/trips/:id", async (req, res) => {
  try {
    const validatedData = patchTripSchema.parse(req.body);
    const trip = await prisma.trip.update({
      where: { id: Number(req.params.id) },
      data: validatedData,
    });
    res.status(200).json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.log(error);
      res.status(500).json({
        error: "Une erreur s'est produite lors de la mise à jour du voyage.",
      });
    }
  }
});


// DELETE /trips/:id : pour supprimer un voyage existant.
app.delete("/trips/:id", async (req, res) => {
  try {
    const trip = await prisma.trip.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(200).json(trip);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Une erreur s'est produite lors de la suppression du voyage.",
    });
  }
});

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
