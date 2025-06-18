import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative w-full h-full m-0 p-0">
            <div>
                <SidebarProvider>
                    <SidebarInset>
                        <div className="flex flex-1">
                            <AppSidebar variant="inset" />
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}
