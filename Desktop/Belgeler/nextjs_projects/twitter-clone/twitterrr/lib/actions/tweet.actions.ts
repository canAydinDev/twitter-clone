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

interface FetchTweetsResult {
  posts: Array<{
    id: string;
    text: string;
    userId: string;
    createdAt: string;
    parentId: string | null;
    likes: number;
    author: {
      id: string;
      name: string;
      image: string;
    };
    group: {
      id: string;
      name: string;
      username: string;
      image: string | null;
    } | null;
    children: Array<{
      id: string;
      createdAt: string;
      text: string;
      author: {
        id: string;
        name: string;
        image: string;
      };
    }>;
    retweetOf: {
      id: string;
      text: string;
      parentId: string | null;
      author: {
        id: string;
        name: string;
        image: string;
      };
      group: {
        id: string;
        name: string;
        image: string | null;
      } | null;
      createdAt: string;
    } | null;
  }>;
  isNext: boolean;
}

export const fetchTweets = async (
  pageNumber = 1,
  pageSize = 20
): Promise<FetchTweetsResult> => {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const filter = {
      parentId: null,
    };

    // Tweet'leri Prisma ile sorgula
    const posts = await db.tweet.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        children: {
          select: {
            id: true,
            createdAt: true,
            text: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        retweetOf: {
          select: {
            id: true,
            text: true,
            parentId: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            children: {
              select: {
                id: true,
                text: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Toplam tweet sayısını sorgula
    const totalPostsCount = await db.tweet.count({
      where: filter,
    });

    // Daha fazla veri olup olmadığını kontrol et
    const isNext = totalPostsCount > skipAmount + posts.length;

    // `createdAt`'ı string'e dönüştür
    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      children: post.children.map((child) => ({
        ...child,
        createdAt: child.createdAt.toISOString(),
      })),
      retweetOf: post.retweetOf
        ? {
            ...post.retweetOf,
            createdAt: post.retweetOf.createdAt.toISOString(),
          }
        : null,
    }));

    return { posts: formattedPosts, isNext };
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
};
interface RetweetParams {
  userId: string;
  tweetId: string;
  path: string;
  groupId: string | null;
}

export const retweetTweet = async ({
  userId,
  tweetId,
  path,
  groupId,
}: RetweetParams) => {
  try {
    // Transaction başlatıyoruz. Bu, tüm işlemlerin atomik olarak gerçekleştirilmesini sağlar.
    await db.$transaction(async (prisma) => {
      // 1. Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { retweets: { select: { id: true } } },
      });
      if (!user) {
        throw new Error("User not found");
      }

      // 2. Orijinal tweet'i bul
      const originalTweet = await prisma.tweet.findUnique({
        where: { id: tweetId },
      });
      if (!originalTweet) {
        throw new Error("Original tweet not found");
      }

      // 3. Kullanıcı zaten bu tweet'i retweet etmiş mi kontrol et
      const hasRetweeted = user.retweets.some((tweet) => tweet.id === tweetId);
      if (hasRetweeted) {
        throw new Error("You have already retweeted this tweet");
      }

      // 4. Yeni bir retweet tweet'i oluştur
      await prisma.tweet.create({
        data: {
          text: originalTweet.text,
          retweetOf: {
            connect: { id: tweetId },
          },
          author: {
            connect: { id: userId },
          },
          group: groupId ? { connect: { id: groupId } } : undefined,
        },
      });

      // 5. Kullanıcının retweets alanına orijinal tweet'i ekle
      await prisma.user.update({
        where: { id: userId },
        data: {
          retweets: {
            connect: { id: tweetId },
          },
        },
      });
    });

    // 6. Path'i yeniden önbelleğe al
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to retweet: ${error.message}`);
  }
};

export const deleteTweet = async (
  userId: string,
  tweetId: string,
  path: string
): Promise<void> => {
  try {
    await db.$transaction(async (db) => {
      // 1. Tweet'i bul ve varlığını kontrol et
      const tweet = await db.tweet.findUnique({
        where: { id: tweetId },
        select: {
          userId: true, // 'authorId' yerine 'userId'
          retweetOfId: true,
          parentId: true,
          groupId: true,
        },
      });

      if (!tweet) {
        throw new Error("Tweet not found");
      }

      // 2. Kullanıcının bu tweet'in sahibi olup olmadığını kontrol et
      if (tweet.userId !== userId) {
        throw new Error("You are not authorized to delete this tweet");
      }

      // 3. Kullanıcının `tweets` alanından tweet'i çıkar
      await db.user.update({
        where: { id: userId },
        data: {
          tweets: {
            disconnect: { id: tweetId },
          },
          ...(tweet.retweetOfId && {
            retweets: {
              disconnect: { id: tweet.retweetOfId },
            },
          }),
          ...(tweet.parentId && {
            replies: {
              disconnect: { id: tweetId },
            },
          }),
        },
      });

      // 4. Eğer tweet bir reply ise, parent tweet'in `children` alanından tweet'i çıkar
      if (tweet.parentId) {
        await db.tweet.update({
          where: { id: tweet.parentId },
          data: {
            children: {
              disconnect: { id: tweetId },
            },
          },
        });
      }

      // 5. Eğer tweet bir gruba aitse, grubun `tweets` alanından tweet'i çıkar
      if (tweet.groupId) {
        await db.group.update({
          where: { id: tweet.groupId },
          data: {
            tweets: {
              disconnect: { id: tweetId },
            },
          },
        });
      }

      if (tweet.groupId) {
        await db.group.update({
          where: { id: tweet.groupId }, // Grubun ID'sine göre eşleşme
          data: {
            tweets: {
              disconnect: { id: tweetId }, // Tweet'i gruptan kaldırma
            },
          },
        });
      }

      // 7. Orijinal tweet'i sil
      await db.tweet.delete({
        where: { id: tweetId },
      });
    });

    // Path'i yeniden önbelleğe al
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete tweet: ${error.message}`);
  }
};

export const isTweetByUser = async (
  userId: string,
  tweetId: string
): Promise<boolean> => {
  try {
    // Tweet'i ID'ye göre bul ve yazarını seç
    const tweet = await db.tweet.findUnique({
      where: { id: tweetId },
      select: { userId: true }, // Sadece userId alanını çekiyoruz
    });

    // Eğer tweet bulunamadıysa hata fırlat
    if (!tweet) {
      throw new Error("Tweet not found");
    }

    // Kullanıcının ID'si ile tweet'in yazarı eşleşiyor mu kontrol et
    return tweet.userId === userId;
  } catch (error: any) {
    throw new Error(`Failed to check tweet ownership: ${error.message}`);
  }
};
