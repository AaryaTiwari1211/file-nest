"use client";
import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation"

export function Header() {
  const router = useRouter();
  return (
    <div className="relative z-10 border-b py-4 bg-gray-50">
      <div className="items-center flex mx-10 justify-between">
        <Link href="/" className="flex gap-2 items-center text-xl text-black">
          <Image src="/logo.png" width="50" height="50" alt="file drive logo" />
          FileDrive
        </Link>

        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <Button onClick={()=>router.push("/sign-in")}>Sign In</Button>
            <Button onClick={()=>router.push("/sign-up")}>Sign Up</Button>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
