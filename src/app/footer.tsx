import Link from "next/link";

export function Footer() {
  return (
    <div className="flex w-full h-24 bg-gray-100 mt-12 items-center justify-center">
      <div className="container mx-auto flex justify-evenly items-center">
        <div>FileNest</div>
        <Link className="text-blue-900 hover:text-blue-500" href="#">
          Privacy Policy
        </Link>
        <Link
          className="text-blue-900 hover:text-blue-500"
          href="#"
        >
          Terms of Service
        </Link>
        <Link className="text-blue-900 hover:text-blue-500" href="#">
          About
        </Link>
      </div>
    </div>
  );
}
