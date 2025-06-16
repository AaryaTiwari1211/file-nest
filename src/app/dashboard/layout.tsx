"use client";
import { SideNav } from "./side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen">
      <div className="flex gap-8 h-screen ">
        <SideNav />
        <div className="w-full m-6">{children}</div>
      </div>
    </main>
  );
}
