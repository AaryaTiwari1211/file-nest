import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
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
          redirectUrl="/dashboard/files"
        />
      </div>
    </div>
  );
}
