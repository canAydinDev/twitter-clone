import LandingPage from "@/components/shared/LandingPage";
import { fetchUserByIdLiked } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchTweets, isTweetByUser } from "@/lib/actions/tweet.actions";
import TweetCard from "@/components/cards/TweetCards";
import { getSearchParams } from "@/lib/utils";

export default async function Home() {
  try {
    const user = await currentUser();
    if (!user) {
      return <LandingPage />;
    }

    const userInfo = await fetchUserByIdLiked(user.id);
    if (!userInfo?.onboarded) {
      redirect("/onboarding");
    }

    const searchParams = await getSearchParams();
    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;
    const result = await fetchTweets(page ? +page : 1, 3);
    console.log("Fetched tweets:", result);

    const retweetOk = result.posts.map((tweet) => !!tweet.retweetOf);

    const ownerStatuses = await Promise.all(
      result.posts.map((tweet) => isTweetByUser(userInfo?.id, tweet.id))
    );

    return (
      <section className="mt-10 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No tweets found</p>
        ) : (
          result.posts.map((tweet, index) => (
            <div className="mt-10" key={tweet.id}>
              <TweetCard
                id={tweet.id}
                currentUserId={user.id}
                owner={ownerStatuses[index]} // `Promise.all` sonuçlarını kullanıyoruz
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
    );
  } catch (error) {
    console.error("Render sırasında hata oluştu:", error);
    return <p>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>;
  }
}
