"use server";

import { revalidatePath } from "next/cache";
import db from "../../utils/db";

interface CreateGroupParams {
  id: string;
  name: string;
  username: string;
  image?: string;
  createdById: string;
}

export async function createGroupAction({
  id,
  name,
  username,
  image,
  createdById,
}: CreateGroupParams) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: createdById,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const createdGroup = await db.group.create({
      data: {
        id,
        name,
        username,
        image,
        createdBy: {
          connect: { id: createdById },
        },
      },
    });

    revalidatePath("/groups");

    return createdGroup;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error creating group: ${err.message}`);
    } else {
      console.error("Error creating group:", err);
      throw err;
    }
  }
}
