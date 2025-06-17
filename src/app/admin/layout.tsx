import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="relative w-full h-full m-0 p-0">
            <body>
                <SidebarProvider>
                    <SidebarInset>
                        <div className="flex flex-1">
                            <AppSidebar variant="inset" />
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
