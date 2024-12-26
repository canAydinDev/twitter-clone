"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CreateUserParams {
  userId: String;
  email: String;
  username: String;
  name: String;
  image: String;
}

interface updateUserParams {
  userId: string;
  email?: string;
  username?: string;
  name?: string;
  bio?: string;
  image?: string;
  path?: string;
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
      name,
      email,
      image,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to create user: ${err.message}`);
    } else {
      console.log("Failed to create user", err);
    }
  }
};

export const fetchUser = async (userId: string) => {
  try {
    connectToDB();
    return await User.findOne({
      id: userId,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch user: ${err.message}`);
    } else {
      console.log("Failed to fetch user", err);
    }
  }
};

export const updateUser = async ({
  userId,
  name,
  email,
  username,
  bio,
  path,
  image,
}: updateUserParams): Promise<void> => {
  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      {
        name,
        email,
        username,
        bio,
        path,
        image,
        onboarded: true,
      }
    );
    if (path === "/profile/edit") revalidatePath(path);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to update user: ${err.message}`);
    } else {
      console.log("Failed to update user", err);
    }
  }
};
