"use client";

import { sidebarLinks } from "@/constants";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeftSideBar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className="leftsidebar custom-scrollbar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const linkRoute =
            link.route === "/profile" ? `${link.route}/${userId}` : link.route;
          const isActive =
            pathname === linkRoute || pathname.startsWith(linkRoute);

          return (
            <Link
              href={linkRoute}
              key={link.label}
              className={`leftsidebar_link ${
                isActive ? "bg-primary-500" : ""
              } hover:bg-slate-800`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-light-1">{link.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LeftSideBar;
