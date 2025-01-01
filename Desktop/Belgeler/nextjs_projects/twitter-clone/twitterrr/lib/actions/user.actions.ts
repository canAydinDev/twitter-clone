"use server";

import { revalidatePath } from "next/cache";
import db from "../../utils/db";

export type SortOrder = "asc" | "desc";
interface CreateUserParams {
  userId: string;
  email: string;
  username: string;
  name: string;
  image: string;
  bio: string;
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
interface FetchUserActionParams {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder; // Prisma’da "asc" | "desc"
}

// export const createUser = async ({
//   userId,
//   email,
//   username,
//   name,
//   image,
// }: CreateUserParams): Promise<void> => {
//   try {
//     connectToDB();
//     await User.create({
//       id: userId,
//       username: username?.toLowerCase(),
//       name,
//       email,
//       image,
//     });
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       throw new Error(`Failed to create user: ${err.message}`);
//     } else {
//       console.log("Failed to create user", err);
//     }
//   }
// };

// export const fetchUser = async (userId: string) => {
//   try {
//     connectToDB();
//     return await User.findOne({
//       id: userId,
//     });
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       throw new Error(`Failed to fetch user: ${err.message}`);
//     } else {
//       console.log("Failed to fetch user", err);
//     }
//   }
// };

// export const updateUser = async ({
//   userId,
//   name,
//   email,
//   username,
//   bio,
//   path,
//   image,
// }: updateUserParams): Promise<void> => {
//   try {
//     connectToDB();
//     await User.findOneAndUpdate(
//       { id: userId },
//       {
//         name,
//         email,
//         username,
//         bio,
//         path,
//         image,
//         onboarded: true,
//       }
//     );
//     if (path === "/profile/edit") revalidatePath(path);
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       throw new Error(`Failed to update user: ${err.message}`);
//     } else {
//       console.log("Failed to update user", err);
//     }
//   }
// };

export const createUserAction = async ({
  userId,
  email,
  username,
  name,
  image,
  bio,
}: CreateUserParams): Promise<void> => {
  await db.user.create({
    data: {
      id: userId,
      username: username?.toLowerCase(),
      name,
      email,
      image,
      bio,
    },
  });
};

export const fetchUserById = async (id: string) => {
  const user = await db.user.findFirst({
    where: {
      id,
    },
  });
  return user;
};

export const updateUserAction = async ({
  userId,
  name,
  email,
  username,
  bio,
  path,
  image,
}: updateUserParams): Promise<void> => {
  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        username,
        bio,
        image,
        onboarded: true,
      },
    });
    if (path === "/profile/edit") revalidatePath(path);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to update user: ${err.message}`);
    } else {
      console.log("Failed to update user", err);
    }
  }
};

export const fetchUserAction = async ({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: FetchUserActionParams) => {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const where: any = {
      NOT: {
        id: userId,
      },
    };

    if (searchString.trim() !== "") {
      where.OR = [
        { username: { contains: searchString, mode: "insensitive" } },
        { name: { contains: searchString, mode: "insensitive" } },
      ];
    }

    const totalUserCount = await db.user.count({ where });

    const users = await db.user.findMany({
      where,
      skip: skipAmount,
      take: pageSize,
      orderBy: {
        createdAt: sortBy,
      },
    });

    const isNext = totalUserCount > skipAmount + users.length;

    return { users, isNext };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch user: ${err.message}`);
    } else {
      console.error("Failed to fetch user", err);
    }
  }
};
