import LandingPage from "@/components/shared/LandingPage";
import { fetchUserByIdLiked } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchTweetChildren, fetchTweets } from "@/lib/actions/tweet.actions";
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

  const tweetsWithOwner = await Promise.all(
    result.posts.map(async (tweet) => {
      const isOwner = userInfo?.id === tweet.author.id;

      // Retweet edilen tweet'i formatlıyoruz
      const formattedRetweetOf = tweet.retweetOf
        ? {
            _id: tweet.retweetOf.id,
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
                    tweet.retweetOf.group.image || "/default-group-image.png",
                }
              : null,
            createdAt: new Date(tweet.retweetOf.createdAt).toISOString(),
            children: tweet.retweetOf,
          }
        : null;

      // Grup bilgilerini formatlıyoruz
      const formattedGroup = tweet.group
        ? {
            id: tweet.group.id,
            name: tweet.group.name,
            image: tweet.group.image || "/default-group-image.png",
          }
        : null;

      return {
        ...tweet,
        isOwner,
        formattedRetweetOf,
        formattedGroup,
      };
    })
  );
  //hello

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {tweetsWithOwner.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          tweetsWithOwner.map((tweet) => (
            <div className="mt-10" key={tweet.id}>
              <TweetCard
                id={tweet.id}
                currentUserId={user.id}
                owner={tweet.isOwner}
                DB_userID={userInfo.id}
                retweetOf={tweet.formattedRetweetOf}
                parentId={tweet.parentId}
                content={tweet.text}
                author={tweet.author}
                group={tweet.formattedGroup}
                createdAt={new Date(tweet.createdAt).toISOString()} // ISO formatı
                comments={tweet.children.map((child) => ({
                  ...child,
                  createdAt: new Date(child.createdAt).toISOString(), // Çocuk yorumlar için ISO formatı
                }))}
                likes={tweet.likes}
                liked={
                  userInfo?.likedTweets?.some(
                    (likedTweet) => likedTweet.id === tweet.id
                  ) || false
                }
              />
            </div>
          ))
        )}
      </section>
    </>
  );
}
