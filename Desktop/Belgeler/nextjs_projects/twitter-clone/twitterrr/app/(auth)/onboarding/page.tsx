// app/onboarding/page.tsx (server component)
import OnboardingClient from "./OnboardingPageClient";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function OnboardingPageServer() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) {
    redirect("/");
  }

  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    userName: userInfo ? userInfo?.username : user?.username,
    name: userInfo ? userInfo?.name : user?.firstName || "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user?.imageUrl,
  };

  return <OnboardingClient userData={userData} />;
}
