import PostTweet from "@/components/forms/PostTweet";
import { fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/onboarding");
  }

  const userInfo = await fetchUserById(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <h1 className="head-text">Create Tweet</h1>
      <PostTweet userId={user.id} />
    </>
  );
};

export default Page;
