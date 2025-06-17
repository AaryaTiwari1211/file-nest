"use client";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
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
        <SignUp
          unsafeMetadata={{
            role: "member"
          }}
        />
        <div>
          <Image
            src="/sign-up.png"
            width="400"
            height="600"
            alt="file drive logo"
          />
        </div>
      </div>
    </div>
  );
}
