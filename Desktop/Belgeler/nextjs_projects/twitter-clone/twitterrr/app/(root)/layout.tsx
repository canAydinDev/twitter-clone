import { Inter } from "next/font/google";
import { Metadata } from "next";

import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TopBar from "@/components/shared/TopBar";
import LeftSideBar from "@/components/shared/LeftSideBar";
import RightSideBar from "@/components/shared/RightSideBar";
import BottomBar from "@/components/shared/BottomBar";

export const metadata: Metadata = {
  title: "Twiddle",
  description:
    "Asocial media app, to discover what is happening now in the world",
};

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <html lang="en">
        <ClerkProvider>
          <body>
            <main className={`${inter.className}`}>
              <TopBar />
              <main className="flex flex-row">
                <LeftSideBar />
                <section className="main-section">
                  <div className="w-full flx justify-center items-center min-h-screen">
                    {children}
                  </div>
                </section>
                <RightSideBar />
              </main>
              <BottomBar />
            </main>
          </body>
        </ClerkProvider>
      </html>
    </>
  );
}
