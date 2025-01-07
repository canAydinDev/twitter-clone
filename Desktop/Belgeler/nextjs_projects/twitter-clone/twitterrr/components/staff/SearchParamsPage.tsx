"use client";

import { useEffect, useState } from "react";
import { fetchTweets, isTweetByUser } from "@/lib/actions/tweet.actions";
import { fetchUserByIdLiked } from "@/lib/actions/user.actions";
import { useSearchParams, redirect } from "next/navigation";
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

export default function SearchParamsPage({ user }: Props) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [tweets, setTweets] = useState<any[]>([]);
  const [ownerStatuses, setOwnerStatuses] = useState<boolean[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const fetchedUserInfo = await fetchUserByIdLiked(user.id);
      if (!fetchedUserInfo?.onboarded) {
        redirect("/onboarding");
        return;
      }

      setUserInfo(fetchedUserInfo);

      const result = await fetchTweets(page, 3);
      setTweets(result.posts);

      const statuses = await Promise.all(
        result.posts.map((tweet) => isTweetByUser(fetchedUserInfo.id, tweet.id))
      );

      setOwnerStatuses(statuses);
    }

    fetchData();
  }, [page, user.id]);

  if (!userInfo) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <section className="mt-10 flex flex-col gap-10">
        {tweets.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          tweets.map((tweet, index) => (
            <div className="mt-10" key={tweet.id}>
              <TweetCard
                id={tweet.id}
                currentUserId={user.id}
                owner={ownerStatuses[index]}
                DB_userID={userInfo.id}
                retweetOk={!!tweet.retweetOf}
                parentId={tweet.parentId}
                content={tweet.text}
                author={tweet.author}
                group={tweet.group}
                createdAt={tweet.createdAt}
                comments={tweet.children}
                likes={tweet.likes}
                liked={userInfo.likedTweets.some(
                  (likedTweet: any) => likedTweet.id === tweet.id
                )}
              />
            </div>
          ))
        )}
      </section>
    </>
  );
}
