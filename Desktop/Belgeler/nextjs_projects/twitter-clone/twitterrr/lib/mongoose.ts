import mongoose from "mongoose";
let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("Missing MongoDB Url");

  if (isConnected) {
    return console.log("MongoDB connected already istablished");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL as string);

    isConnected = true;
    console.log("MongoDB connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`Error connecting to Database ${err.message}`);
    } else {
      console.log("Error connecting to Database", err);
    }
  }
};
