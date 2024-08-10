"use client";
import { SignIn } from "@clerk/clerk-react";
import Image from "next/image";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const user = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user.user) {
      router.push("/dashboard/files");
    }
  }, []);
  return (
    <div className="flex justify-center items-center my-10">
      <div className="flex max-w-[1200px] items-center justify-center mt-12 gap-10">
        <div>
          <Image
            src="/sign-in.jpg"
            width="800"
            height="600"
            alt="file drive logo"
          />
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
