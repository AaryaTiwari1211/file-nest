"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import GenerateTable from "./generate-table"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { ColumnDef } from "@tanstack/react-table"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconArrowBackUp,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCross,
    IconGripVertical,
    IconLayoutColumns,
} from "@tabler/icons-react"
import { Id } from "../../../../convex/_generated/dataModel"
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { ApproveRequestModal } from "../modals/approved-modal"
import { RejectedModal } from "../modals/rejected-modal"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { revertApprovalOrRejection, getAllApprovals } from '../../../../convex/approvals';
import { Check, Cross, X } from "lucide-react"

export const approvalSchema = z.object({
    fileName: z.string(),
    approvedBy: z.string(),
    requestedBy: z.string(),
    status: z.string(),
    remarks: z.optional(z.string()),
})

export function DragHandle({ id }: { id: any }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

export function DraggableRow({ row }: { row: Row<z.infer<typeof approvalSchema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.fileName,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

type ApprovalRow = z.infer<typeof approvalSchema>

export function AllDataTable({
    allData: initialData,
    acceptedData,
    rejectedData,
    pendingData,
    setSelectedRow,
    setModalType,
}: {
    allData: z.infer<typeof approvalSchema>[],
    acceptedData: z.infer<typeof approvalSchema>[],
    rejectedData: z.infer<typeof approvalSchema>[],
    pendingData: z.infer<typeof approvalSchema>[],
    setSelectedRow: (row: ApprovalRow) => void,
    setModalType: (type: "approve" | "reject" | null) => void
}) {
    const [data, setData] = useState(() => initialData);
    const revertApprovalOrRejection = useMutation(api.approvals.revertApprovalOrRejection)
    const columns = useMemo<ColumnDef<ApprovalRow>[]>(() => [
        { accessorKey: "fileName", header: "File Name" },
        { accessorKey: "approvedBy", header: "Approved By" },
        { accessorKey: "requestedBy", header: "Requested By" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "remarks", header: "Remarks" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {
                            row.original.status === "pending" ? (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedRow(row.original);
                                            setModalType("approve");
                                        }}
                                        className="flex items-center"
                                    >
                                        <Check color="green" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedRow(row.original);
                                            setModalType("reject");
                                        }}
                                        className="flex items-center"
                                    >
                                        <X color="red" />
                                        Reject
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedRow(row.original);
                                        setModalType(null);
                                        toast.info("Reverted");
                                    }}
                                >
                                    <IconArrowBackUp />
                                    Revert {
                                        row.original.status === "accepted" ? "Approval" : "Rejection"
                                    }
                                </DropdownMenuItem>
                            )
                        }

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    ], [setSelectedRow, setModalType]);
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    )

    const dataIds = React.useMemo<string[]>(
        () => data?.map(({ fileName }) => fileName.toString()) || [],
        [data]
    )

    const allTable = useReactTable({
        data,
        columns: columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.fileName.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const pendingTable = useReactTable({
        data: pendingData,
        columns: columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.fileName.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const acceptedTable = useReactTable({
        data: acceptedData,
        columns: columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.fileName.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const rejectedTable = useReactTable({
        data: rejectedData,
        columns: columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.fileName.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id.toString())
                const newIndex = dataIds.indexOf(over.id.toString())
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    return (
        <Tabs
            defaultValue="outline"
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="accepted-approvals">
                        Accepted Approvals <Badge variant="secondary">3</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="rejected-approvals">
                        Rejected Approvals <Badge variant="secondary">2</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns />
                                <span className="hidden lg:inline">Customize Columns</span>
                                <span className="lg:hidden">Columns</span>
                                <IconChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() =>window.location.reload()}
                        >
                            Reload
                        </Button>
                        <DropdownMenuContent align="end" className="w-56">
                            {allTable
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <TabsContent
                value="approvals"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <GenerateTable
                    table={allTable}
                    closestCenter={closestCenter}
                    restrictToVerticalAxis={restrictToVerticalAxis}
                    handleDragEnd={handleDragEnd}
                    sensors={sensors}
                    sortableId={sortableId}
                    dataIds={dataIds}
                    verticalListSortingStrategy={verticalListSortingStrategy}
                    columns={columns}
                    flexRender={flexRender}
                />
            </TabsContent>
            <TabsContent
                value="pending-approvals"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <GenerateTable
                    table={pendingTable}
                    closestCenter={closestCenter}
                    restrictToVerticalAxis={restrictToVerticalAxis}
                    handleDragEnd={handleDragEnd}
                    sensors={sensors}
                    sortableId={sortableId}
                    dataIds={pendingData.map(({ fileName }) => fileName.toString())}
                    verticalListSortingStrategy={verticalListSortingStrategy}
                    columns={columns}
                    flexRender={flexRender}
                />
            </TabsContent>
            <TabsContent
                value="accepted-approvals"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <GenerateTable
                    table={acceptedTable}
                    closestCenter={closestCenter}
                    restrictToVerticalAxis={restrictToVerticalAxis}
                    handleDragEnd={handleDragEnd}
                    sensors={sensors}
                    sortableId={sortableId}
                    dataIds={acceptedData.map(({ fileName }) => fileName.toString())}
                    verticalListSortingStrategy={verticalListSortingStrategy}
                    columns={columns}
                    flexRender={flexRender}
                />
            </TabsContent>
            <TabsContent
                value="rejected-approvals"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <GenerateTable
                    table={rejectedTable}
                    closestCenter={closestCenter}
                    restrictToVerticalAxis={restrictToVerticalAxis}
                    handleDragEnd={handleDragEnd}
                    sensors={sensors}
                    sortableId={sortableId}
                    dataIds={rejectedData.map(({ fileName }) => fileName.toString())}
                    verticalListSortingStrategy={verticalListSortingStrategy}
                    columns={columns}
                    flexRender={flexRender}
                />
            </TabsContent>
            <TabsContent
                value="pending-approvals"
                className="flex flex-col px-4 lg:px-6"
            >
                
            </TabsContent>
        </Tabs>
    )
}

export default function ApprovalTable({ allData , acceptedData,rejectedData,pendingData, }: { allData: ApprovalRow[] , pendingData: ApprovalRow[]  , acceptedData: ApprovalRow[], rejectedData: ApprovalRow[] }) {
    const [selectedRow, setSelectedRow] = useState<ApprovalRow | null>(null);
    const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

    const file = useQuery(
        api.files.getFileByName,
        selectedRow?.fileName ? { name: selectedRow.fileName.trim() } : "skip"
    );

    const approval = useQuery(
        api.approvals.getApprovalByFileId,
        file?._id ? { fileId: file._id } : "skip"
    );

    const approveFile = useMutation(api.approvals.approveFile);
    const rejectFile = useMutation(api.approvals.rejectFile);

    const me = useQuery(api.users.getMe)

    console.log("Me: ", me)

    if (!me) {
        return;
    }


    const handleApprove = async ({ adminNote }: { adminNote: string }) => {
        if (!file || !approval) {
            toast.error("Something is missing");
            return;
        }
        try {
            await approveFile({
                fileId: file._id,
                adminId: me._id,
                remarks: adminNote,
                approvalId: approval._id,
            });
            toast.success("Approval successful");
            setModalType(null);
        } catch {
            toast.error("Approval failed");
        }
    };

    const handleReject = async ({ adminNote }: { adminNote: string }) => {
        if (!file || !approval) return;
        try {
            await rejectFile({
                fileId: file._id,
                adminId: me._id,
                remarks: adminNote,
                approvalId: approval._id,
            });
            toast.success("Rejection successful");
            setModalType(null);
        } catch {
            toast.error("Rejection failed");
        }
    };

    return (
        <>
            <AllDataTable
                allData={allData}
                acceptedData={acceptedData}
                rejectedData={rejectedData}
                pendingData={pendingData}
                setSelectedRow={setSelectedRow}
                setModalType={setModalType}
            />

            {modalType === "approve" && selectedRow && (
                <ApproveRequestModal
                    open={true}
                    onOpenChange={() => setModalType(null)}
                    onApprove={handleApprove}
                    fileName={selectedRow.fileName}
                    requester={selectedRow.requestedBy}
                />
            )}

            {modalType === "reject" && selectedRow && (
                <RejectedModal
                    open={true}
                    onOpenChange={() => setModalType(null)}
                    onReject={handleReject}
                    fileName={selectedRow.fileName}
                    requester={selectedRow.requestedBy}
                />
            )}
        </>
    );
}
