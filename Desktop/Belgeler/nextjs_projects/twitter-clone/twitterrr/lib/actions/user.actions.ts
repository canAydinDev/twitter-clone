"use server";

import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CreateUserParams {
  userId: String;
  email: String;
  username: String;
  name: String;
  image: String;
}

export const createUser = async ({
  userId,
  email,
  username,
  name,
  image,
}: CreateUserParams): Promise<void> => {
  try {
    connectToDB();
    await User.create({
      id: userId,
      username: username?.toLowerCase(),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to create user: ${err.message}`);
    } else {
      console.log("Failed to create user", err);
    }
  }
};
