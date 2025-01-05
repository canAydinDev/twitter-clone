"use server";

import { revalidatePath } from "next/cache";
import db from "../../utils/db";

interface TweetParams {
  text: string;
  author: string;
  path: string;
  retweetOf?: string;
  groupId: string | null;
}

export const createTweetAction = async ({
  text,
  author,
  path,
  retweetOf,
  groupId,
}: TweetParams) => {
  try {
    const groupIdObject = groupId
      ? await db.group.findFirst({
          where: {
            id: groupId,
          },
        })
      : null;

    const createdTweet = await db.tweet.create({
      data: {
        text,
        author: {
          connect: { id: author },
        },

        group: groupId ? { connect: { id: groupId } } : undefined,

        ...(retweetOf && {
          retweetOf: {
            connect: { id: retweetOf },
          },
        }),
      },
    });

    if (retweetOf) {
      await db.user.update({
        where: { id: author },
        data: {
          retweets: {
            connect: { id: createdTweet.id },
          },
        },
      });
    }

    if (groupIdObject) {
      await db.group.update({
        where: {
          id: groupIdObject.id,
        },
        data: {
          tweets: {
            connect: { id: createdTweet.id },
          },
        },
      });
    }

    revalidatePath(path);
    return createdTweet;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to create tweet: ${err.message}`);
    } else {
      console.error("Failed to create tweet:", err);
      throw err;
    }
  }
};
