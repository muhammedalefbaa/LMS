import mongoose from "mongoose";

// connect to mongo DB
const connectDB = async () => {
  mongoose.connection.once("connected", () => {
    console.log("MongoDB connected");
  });

  await mongoose.connect(`${process.env.MONGO_URI}/lms`);
};

export default connectDB;
