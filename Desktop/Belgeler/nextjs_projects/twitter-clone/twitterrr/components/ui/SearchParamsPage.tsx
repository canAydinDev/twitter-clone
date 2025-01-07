"use client";

import { fetchTweets, isTweetByUser } from "@/lib/actions/tweet.actions";
import { fetchUserByIdLiked } from "@/lib/actions/user.actions";

import { redirect, useSearchParams } from "next/navigation";
import TweetCard from "../cards/TweetCards";

interface Props {
  user: {
    image?: string;
    name?: string;
    id: string;
    email?: string;
    username?: string;
    bio?: string;
    onboarded?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export default async function SearchParamsPage({ user }: Props) {
  const userInfo = await fetchUserByIdLiked(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  const searchParams = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const result = await fetchTweets(page ? +page : 1, 3);
  console.log("Fetched tweets:", result);

  const retweetOk = result.posts.map((tweet) => !!tweet.retweetOf);

  const ownerStatuses = await Promise.all(
    result.posts.map((tweet) => isTweetByUser(userInfo?.id, tweet.id))
  );

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          result.posts.map((tweet, index) => (
            <div className="mt-10" key={tweet.id}>
              <TweetCard
                id={tweet.id}
                currentUserId={user.id}
                owner={ownerStatuses[index]}
                DB_userID={userInfo.id}
                retweetOk={retweetOk[index]}
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
          ))
        )}
      </section>
    </>
  );
}
