"use client";
import { useEffect, useState } from "react";
import { ChartAreaInteractive } from "./_components/chart-area-interactive"
import ApprovalTable from "./_components/data-table";
import { SectionCards } from "./_components/section-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
export default function Page() {
    const approvals = useQuery(api.approvals.getAllApprovals);
    const acceptedApprovals = useQuery(api.approvals.getAcceptedApprovals);
    const rejectedApprovals = useQuery(api.approvals.getRejectedApprovals);
    const pendingApprovals = useQuery(api.approvals.getPendingApprovals);
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
                        <ApprovalTable
                            allData={
                                approvals
                                    ? approvals.map(a => ({
                                        status: a.status ?? "No Status",
                                        approvedBy: typeof a.approvedBy === "string" ? a.approvedBy : "No Approval",
                                        requestedBy: a.requestedBy?.name ?? "Unknown",
                                        fileName: a.fileName ?? "",
                                        remarks: a.remarks
                                    }))
                                    : []
                            }
                            pendingData={
                                pendingApprovals
                                    ? pendingApprovals.map(a => ({
                                        status: a.status ?? "No Status",
                                        approvedBy: typeof a.approvedBy === "string" ? a.approvedBy : "No Approval",
                                        requestedBy: a.requestedBy?.name ?? "Unknown",
                                        fileName: a.fileName ?? "",
                                        remarks: a.remarks
                                    }))
                                    : []
                            }
                            acceptedData={
                                acceptedApprovals
                                    ? acceptedApprovals.map(a => ({
                                        status: a.status ?? "No Status",
                                        approvedBy: typeof a.approvedBy === "string" ? a.approvedBy : "No Approval",
                                        requestedBy: a.requestedBy?.name ?? "Unknown",
                                        fileName: a.fileName ?? "",
                                        remarks: a.remarks
                                    }))
                                    : []
                            }
                            rejectedData={
                                rejectedApprovals
                                    ? rejectedApprovals.map(a => ({
                                        status: a.status ?? "No Status",
                                        approvedBy: typeof a.approvedBy === "string" ? a.approvedBy : "No Approval",
                                        requestedBy: a.requestedBy?.name ?? "Unknown",
                                        fileName: a.fileName ?? "",
                                        remarks: a.remarks
                                    }))
                                    : []
                            }
                        />
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}
