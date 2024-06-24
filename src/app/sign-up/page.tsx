import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center my-10">
      <div className="flex max-w-[1200px] items-center justify-center mt-12 gap-10">
        <SignUp
          routing="path"
          path="/sign-up"
          redirectUrl="/"
          signInUrl="/sign-in"
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
