const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const dburl = process.env.DB_URL;
const client = new MongoClient(dburl);
const dbname = "users_db";

let db;
let collectionNames = []; 

const init_db = async () => {
  try {
    await client.connect();
    console.log("Database bağlandı.");
    db = client.db(dbname); 
    const collections = await db.listCollections().toArray();
    collectionNames = collections.map((col) => col.name);
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
  }
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/user.html");
});

app.get("/add_user", async (req, res) => {
  try {
    const username = req.query.username;
    const age = parseInt(req.query.age);

    if (!username || isNaN(age)) {
      return res.status(400).send("Geçerli bir kullanıcı adı ve yaş belirtin.");
    }

    if (!collectionNames.includes(username)) {
      await db.createCollection(username);
      collectionNames.push(username);
    }

    const result = await db.collection(username).insertOne({ username, age });
    res.send(`Kullanıcı eklendi: ${result.insertedId}`);
  } catch (error) {
    console.error("Kullanıcı ekleme hatası:", error);
    res.status(500).send("Kullanıcı eklenirken bir hata oluştu.");
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
  init_db();
});
