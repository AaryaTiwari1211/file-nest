"use client";
import { ChartAreaInteractive } from "./_components/chart-area-interactive"
import { DataTable } from "./_components/data-table"
import { SectionCards } from "./_components/section-cards"
import data from "./data.json"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
    return (
        <Tabs defaultValue="overview" className="w-full p-2">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards />
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="approvals">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <DataTable data={data} />
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}
