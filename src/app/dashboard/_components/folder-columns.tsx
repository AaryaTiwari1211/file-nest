import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "../../../../convex/_generated/dataModel";

export const folderColumns: ColumnDef<Doc<"folders">>[] = [
    {
        accessorKey: "name",
        header: "Folder Name",
    },
    {
        header: "Parent Folder",
        cell: ({ row }) => {
            return row.original.parentId ? row.original.parentId : "—";
        },
    },
    {
        header: "Delete Flag",
        cell: ({ row }) => {
            return row.original.shouldDelete ? "Pending" : "—";
        },
    },
];
