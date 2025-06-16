"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from '../_components/upload-button';
import Image from "next/image";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import { SearchBar } from "../_components/search-bar";
import { useEffect, useState } from "react";
import { DataTable } from "../_components/file-table"; // Adjusted for folders
import { columns } from "../_components/columns"; // Adjusted for folders
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AddFolderButton } from "../_components/add-folder";
import { FolderCard } from "../_components/folder-card";
import { ConvexError } from "convex/values";
import { folderColumns } from "../_components/folder-columns";

export function Placeholder() {
    return (
        <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Image
                alt="an image of a picture and directory icon"
                width="300"
                height="300"
                src="/empty.svg"
            />
            <div className="text-2xl">You have no folders, create one now</div>
            <AddFolderButton />
        </div>
    );
}

export function FolderBrowser({
    title,
}: {
    title: string;
    favoritesOnly?: boolean;
    deletedOnly?: boolean;
}) {
    const user = useUser();
    useEffect(() => {
        console.log("User:", user);
    }, []);
    const [query, setQuery] = useState("");

    if (!user) {
        throw new ConvexError("User not found");
    }

    const userId = user.user?.id;

    const folders = useQuery(
        api.folders.getFolders,
        userId ? { query, parentId: undefined } : "skip"
    );

    const isLoading = folders === undefined;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{title}</h1>

                <SearchBar query={query} setQuery={setQuery} />
                <div className="flex gap-3">
                    <AddFolderButton />
                </div>
            </div>

            <Tabs defaultValue="grid">
                <div className="flex justify-between items-center">
                    <TabsList className="mb-2">
                        <TabsTrigger value="grid" className="flex gap-2 items-center">
                            <GridIcon />
                            Grid
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex gap-2 items-center">
                            <RowsIcon /> Table
                        </TabsTrigger>
                    </TabsList>
                </div>

                {isLoading && (
                    <div className="flex flex-col gap-8 w-full items-center mt-24">
                        <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
                        <div className="text-2xl">Loading your folders...</div>
                    </div>
                )}

                <TabsContent value="grid">
                    <div className="grid grid-cols-4 gap-1">
                        {folders?.map((folder) => {
                            return <FolderCard key={folder._id} folder={folder} />;
                        })}
                    </div>
                </TabsContent>
                <TabsContent value="table">
                    <DataTable columns={folderColumns} data={folders ?? []} />
                </TabsContent>
            </Tabs>

            {folders?.length === 0 && <Placeholder />}
        </div>
    );
}

export default function DashboardFoldersPage() {
    const user = useUser();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <main className="h-screen">
            <div className="flex gap-8 h-screen ">
                <div className="w-full m-6">
                    <FolderBrowser title="Your Folders" />
                </div>
            </div>
        </main>
    );
}
