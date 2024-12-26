import LandingPage from "@/components/shared/LandingPage";
import { createUserAction, fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import db from "../../utils/db";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return <LandingPage />;
  }

  return <></>;
}
