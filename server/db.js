const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/mydb";

async function connectToDB() {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  console.log("📃 Database ready!");
  return client.db("test");
}

module.exports = { connectToDB };