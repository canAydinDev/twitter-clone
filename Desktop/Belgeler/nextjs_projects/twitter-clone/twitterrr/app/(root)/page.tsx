import LandingPage from "@/components/shared/LandingPage";
import { fetchUserByIdLiked } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import { fetchTweets, isTweetByUser } from "@/lib/actions/tweet.actions";
import TweetCard from "@/components/cards/TweetCards";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) {
    return (
      <>
        <LandingPage />
      </>
    );
  }
  const userInfo = await fetchUserByIdLiked(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchTweets(
    searchParams.page ? +searchParams.page : 1,
    3
  );

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          <div>
            {result.posts.map(async (tweet) => {
              const isOwner = await isTweetByUser(userInfo?.id, tweet?.id);
              const formattedRetweetOf = tweet.retweetOf
                ? {
                    _id: tweet.retweetOf.id, // 'id' yerine '_id' olarak yeniden adlandırıldı
                    text: tweet.retweetOf.text,
                    parentId: tweet.retweetOf.parentId,
                    author: {
                      name: tweet.retweetOf.author.name,
                      image: tweet.retweetOf.author.image,
                      id: tweet.retweetOf.author.id,
                    },
                    group: tweet.retweetOf.group
                      ? {
                          id: tweet.retweetOf.group.id,
                          name: tweet.retweetOf.group.name,
                          image:
                            tweet.retweetOf.group.image ||
                            "/default-group-image.png",
                        }
                      : null,
                    createdAt: tweet.retweetOf.createdAt.toISOString(),
                    children: tweet.retweetOf.children.map((child) => ({
                      author: {
                        image: child.author.image,
                      },
                    })),
                  }
                : null;
              const formattedGroup = tweet.group
                ? {
                    id: tweet.group.id,
                    name: tweet.group.name,
                    image: tweet.group.image || "/default-group-image.png", // Null kontrolü ve varsayılan resim
                  }
                : null;
              return (
                <div className="mt-10">
                  <TweetCard
                    key={tweet.id}
                    id={tweet.id}
                    currentUserId={user.id}
                    owner={isOwner}
                    DB_userID={userInfo.id}
                    retweetOf={formattedRetweetOf}
                    parentId={tweet.parentId}
                    content={tweet.text}
                    author={tweet.author}
                    group={formattedGroup}
                    createdAt={tweet.createdAt}
                    comments={tweet.children}
                    likes={tweet.likes}
                    liked={
                      userInfo?.likedTweets?.some(
                        (likedTweet) => likedTweet.id === tweet.id
                      ) || false
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
