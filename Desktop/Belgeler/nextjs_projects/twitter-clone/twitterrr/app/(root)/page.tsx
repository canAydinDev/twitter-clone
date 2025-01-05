import LandingPage from "@/components/shared/LandingPage";
import { createUserAction, fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import db from "../../utils/db";

export default async function Home() {
  const user = (await currentUser()) || null;
  const tweets = await db.tweet.findMany({
    where: {
      userId: user?.id,
    },
  });

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      {tweets.map((tweet, index) => {
        return (
          <h1 className="text-white" key={index}>
            {tweet.text}
          </h1>
        );
      })}
    </>
  );
}
