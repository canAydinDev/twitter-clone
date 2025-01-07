import LandingPage from "@/components/shared/LandingPage";
import { currentUser } from "@clerk/nextjs/server";
import SearchParamsPage from "@/components/ui/searchParamsPage";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return <LandingPage />;
  }

  const enrichedUser = {
    id: user.id,
    image: user.imageUrl || "",
    name: user.fullName || "Unknown",
    email: user.emailAddresses[0]?.emailAddress || "",
    username: user.username || "",
    bio: "User bio not provided",
    onboarded: false, // Varsayılan onboard durumu
    createdAt: new Date(), // Varsayılan tarih
    updatedAt: new Date(), // Varsayılan tarih
  };

  return <SearchParamsPage user={enrichedUser} />;
}
