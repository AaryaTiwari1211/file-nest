"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  OrganizationSwitcher,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.publicMetadata && user.publicMetadata.role) {
      const role = user.publicMetadata.role as string;
      if (role === "admin" || role === "super-admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  }, [user]);

  return (
    <div className="relative z-10 border-b py-4 bg-gray-50">
      <div className="items-center flex mx-10 justify-between">
        <Link href="/" className="flex gap-2 items-center text-xl text-black">
          <Image src="/logo.png" width="50" height="50" alt="file drive logo" />
          File Nest
        </Link>

        <div className="flex gap-10 items-center">
          <OrganizationSwitcher />
          <SignedOut>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
              <Button onClick={() => router.push("/sign-up")}>Sign Up</Button>
            </div>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <Button onClick={()=>router.push("/")}>Sign Out</Button>
            </SignOutButton>
            {
              isAdmin && (
                <Button onClick={() => router.push("/admin")}>
                  Admin Dashboard
                </Button>
              )
            }
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
