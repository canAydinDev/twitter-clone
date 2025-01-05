import LandingPage from "@/components/shared/LandingPage";
import { fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import db from "../../utils/db";
import { redirect } from "next/navigation";
import { fetchTweets, isTweetByUser } from "@/lib/actions/tweet.actions";
import TweetCard from "@/components/cards/TweetCards";
import Pagination from "@/components/shared/Pagination";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = (await currentUser()) || null;

  if (!user) {
    return <LandingPage />;
  }
  const userInfo = await fetchUserById(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchTweets(
    searchParams.page ? +searchParams.page : 1,
    3
  );

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="text-light-1">No tweets found</p>
        ) : (
          <div>
            {result.posts.map(async (tweet) => {
              const isOwner = await isTweetByUser(userInfo?._id, tweet?._id);
              return (
                <div className="mt-10">
                  <TweetCard
                    key={tweet._id}
                    id={tweet._id}
                    currentUserId={user.id}
                    owner={isOwner}
                    DB_userID={userInfo._id}
                    retweetOf={tweet.retweetOf}
                    parentId={tweet.parentId}
                    content={tweet.text}
                    author={tweet.author}
                    group={tweet.group}
                    createdAt={tweet.createdAt}
                    comments={tweet.children}
                    likes={tweet.likes}
                    liked={userInfo.likedTweets.includes(tweet._id)}
                  />
                </div>
              );
            })}
            <Pagination
              path="/"
              pageNumber={searchParams?.page ? +searchParams.page : 1}
              isNext={result.isNext}
            />
          </div>
        )}
      </section>
    </>
  );
}
