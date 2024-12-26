import { createUserAction, fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

const Page = async () => {
  const user = await currentUser();
  if (user) {
    const dbUser = await fetchUserById(user.id);
    if (!dbUser) {
      const userId = user.id;
      const email = user.emailAddresses[0]?.emailAddress || "";
      const username = user.username || "";
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      const image = user.imageUrl || "";
      const bio = "";

      await createUserAction({
        userId,
        email,
        username,
        name,
        image,
        bio,
      });
    }
  }
  return (
    <>
      <h1 className="text-light-1">Onboarding page ...</h1>
    </>
  );
};

export default Page;
