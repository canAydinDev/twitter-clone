"use server";

import { revalidatePath } from "next/cache";
import db from "../../utils/db";

interface TweetParams {
  text: string;
  author: string;
  path: string;
  retweetOf?: string;
}

export const createTweetAction = async ({
  text,
  author,
  path,
  retweetOf,
}: TweetParams) => {
  try {
    const createdTweet = await db.tweet.create({
      data: {
        text,
        author: {
          connect: {
            id: author,
          },
        },
        ...(retweetOf && {
          retweetOf: {
            connect: {
              id: retweetOf,
            },
          },
        }),
      },
    });
    if (retweetOf) {
      await db.user.update({
        where: {
          id: author,
        },
        data: {
          retweets: {
            connect: {
              id: createdTweet.id,
            },
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
    }
  }
};
