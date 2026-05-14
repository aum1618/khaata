const mongoose = require("mongoose");

const connectDb = async () => {
  const uri =
    "mongodb+srv://muhammadumerabbas2005:gGcU9SjSISuc1Vyj@cluster0.asvutfu.mongodb.net/?appName=Cluster0";
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDb;
