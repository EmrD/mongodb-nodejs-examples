const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const dburl = process.env.DB_URL;
const client = new MongoClient(dburl);
const dbname = "books_db";

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
  res.sendFile(__dirname + "/book.html");
});

app.get("/add_book", async (req, res) => {
  try {
    const name = req.query.name;
    const author = req.query.author;
    const page = parseInt(req.query.page);

    if (!name || !author || isNaN(page)) {
      return res.status(400).send("Geçerli bir ad ve yazar ve sayfa belirtin.");
    }

    if (!collectionNames.includes(name)) {
      await db.createCollection(name);
      collectionNames.push(name);
    }

    const result = await db.collection(name).insertOne({ name, author, page });
    res.send(`Kitap eklendi: ${result.insertedId}`);
  } catch (error) {
    console.error("Kitap ekleme hatası:", error);
    res.status(500).send("Kitap eklenirken bir hata oluştu.");
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
  init_db();
});