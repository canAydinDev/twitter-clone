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

export async function addMemberToGroupAction(
  groupId: string,
  memberId: string
) {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new Error("Group not found");
    }

    const user = await db.user.findUnique({
      where: { id: memberId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const alreadyMember = await db.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: { id: memberId },
        },
      },
    });
    if (alreadyMember) {
      throw new Error("User is already a member of the group");
    }

    const updatedGroup = await db.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: memberId },
        },
      },
      include: {
        members: true,
      },
    });

    return updatedGroup;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to adding member to group: ${err.message}`);
    } else {
      console.error("Failed to adding member to group:", err);
    }
  }
}

export async function removeUserFromGroupAction(
  userId: string,
  groupId: string
) {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new Error("Group not found");
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    await db.group.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error remove group: ${err.message}`);
    } else {
      console.error("Error remove group:", err);
      throw err;
    }
  }
}

export const updateGroupInfo = async (
  groupId: string,
  name: string,
  username: string,
  image: string
) => {
  try {
    // Önce grup var mı yok mu kontrol etmek isterseniz:
    const existingGroup = await db.group.findUnique({
      where: { id: groupId },
    });
    if (!existingGroup) {
      throw new Error("Group not found");
    }

    const updatedGroup = await db.group.update({
      where: { id: groupId },
      data: {
        name,
        username,
        image,
      },
    });

    return updatedGroup;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error updating group: ${err.message}`);
    } else {
      console.error("Error updating group:", err);
      throw err;
    }
  }
};
interface DeleteGroupResult {
  id: string;
  name: string;
}

export const deleteGroup = async (groupId: string) => {
  try {
    const existingGroup = await db.group.findUnique({
      where: { id: groupId },
    });
    if (!existingGroup) {
      throw new Error("Group not found");
    }

    await db.tweet.deleteMany({
      where: { groupId },
    });

    const deletedGroup = await db.group.delete({
      where: { id: groupId },
    });

    return deletedGroup;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error deleted group: ${err.message}`);
    } else {
      console.error("Error deleted group:", err);
      throw err;
    }
  }
};
