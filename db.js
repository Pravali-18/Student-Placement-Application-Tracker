require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000
});

async function connectDB() {
    await client.connect();

    console.log("MongoDB Atlas connected!");

    return client.db(
        process.env.DB_NAME || "placement_tracker"
    );
}

module.exports = {
    connectDB,
    client
};