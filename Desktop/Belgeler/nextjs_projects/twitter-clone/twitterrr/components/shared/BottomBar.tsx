"use client";

import { sidebarLinks } from "@/constants";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomBar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          const linkRoute =
            link.route === "/profile" ? `${link.route}/${userId}` : link.route;
          const isActive =
            pathname === linkRoute || pathname.startsWith(linkRoute);

          return (
            <Link
              href={linkRoute}
              key={link.label}
              className={`bottombar_link ${
                isActive ? "bg-primary-500" : ""
              } hover:bg-slate-800`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-light-1 text-subtle-medium">{link.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BottomBar;
