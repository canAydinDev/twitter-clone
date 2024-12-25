import { fetchUser } from "@/lib/actions/user.actions";
import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { dark } from "@clerk/themes";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) redirect("/");
  return (
    <>
      <main className="mx-auto flex flex-coll justify-start px-10 py-20">
        <div className="text-center">
          <h1 className="head-text">Welcome to Twitterrr</h1>
          <p className="mt-3 text-base-regular text-light-2">
            Complete your profile to use Twitterrr
          </p>
        </div>
        <div className="mt-10">
          <UserProfile
            appearance={{
              baseTheme: dark,
            }}
            routing="hash"
          />
        </div>
      </main>
    </>
  );
};

export default Page;
