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
    return <LandingPage />;
  }

  const userInfo = await fetchUserByIdLiked(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const result = await fetchTweets(page, 3);

  const retweetOk = result.posts.map((tweet) => {
    if (tweet.retweetOf) {
      return true;
    } else {
      return false;
    }
  });

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          <div>
            {result.posts.map(async (tweet) => {
              const isOwner = await isTweetByUser(userInfo?.id, tweet?.id);
              return (
                <div className="mt-10">
                  <TweetCard
                    key={tweet.id}
                    id={tweet.id}
                    currentUserId={user.id}
                    owner={isOwner}
                    DB_userID={userInfo.id}
                    retweetOk={retweetOk[0]}
                    parentId={tweet.parentId}
                    content={tweet.text}
                    author={tweet.author}
                    group={tweet.group}
                    createdAt={tweet.createdAt}
                    comments={tweet.children}
                    likes={tweet.likes}
                    liked={userInfo.likedTweets.some(
                      (likedTweet) => likedTweet.id === tweet.id
                    )}
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
