import Link from "next/link";

export function Footer() {
  return (
    <div className="absolute w-full h-24 bg-gray-100 mt-12 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
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
