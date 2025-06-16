"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useEffect, useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { AddFolderButton } from "./add-folder";
import { FolderCard } from "./folder-card";
import { ConvexError } from "convex/values";

export function Placeholder() {
  return (
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <Image
        alt="an image of a picture and directory icon"
        width="300"
        height="300"
        src="/empty.svg"
      />
      <div className="text-2xl">You have no files, upload one now</div>
      <UploadButton />
    </div>
  );
}

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
  foldersOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
  foldersOnly?: boolean;
}) {
  const user = useUser();
  useEffect(() => {
    console.log("User:", user);
  },[])
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  if (!user) {
    throw new ConvexError("User not found");
  }

  const userId = user.user?.id;

  const favorites = useQuery(
    api.files.getAllFavorites,
  );

  const files = useQuery(
    api.files.getFiles,
    userId
      ? {
          type: type === "all" ? undefined : type,
          query,
          favorites: favoritesOnly,
          deletedOnly,
        }
      : "skip"
  );
  const folders = useQuery(
    api.folders.getFolders,
    userId ? { query, parentId: undefined } : "skip"
  );

  const isLoading = files === undefined;

  const modifiedFiles =
    files
      ?.filter((file) => file.folderId === undefined && file.userId !== "skip")
      .map((file) => ({
        ...file,
        isFavorited: (favorites ?? []).some(
          (favorite) => favorite.fileId === file._id
        ),
      })) ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>

        <SearchBar query={query} setQuery={setQuery} />
        <div className="flex gap-3">
          <UploadButton />
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

          <div className="flex gap-2 items-center">
            <Label htmlFor="type-select">Type Filter</Label>
            <Select
              value={type}
              onValueChange={(newType) => {
                setType(newType as any);
              }}
            >
              <SelectTrigger id="type-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your files...</div>
          </div>
        )}

        <TabsContent value="grid">
          <div className="grid grid-cols-4 gap-1">
            {foldersOnly ? (
              folders?.map((folder) => {
                return <FolderCard key={folder._id} folder={folder} />;
              })
            ) : (
              <>
                {folders?.map((folder) => {
                  return <FolderCard key={folder._id} folder={folder} />;
                })}

                {modifiedFiles?.map((file) => {
                  return <FileCard key={file._id} file={file} />;
                })}
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>

      {files?.length === 0 && folders?.length === 0 && <Placeholder />}
    </div>
  );
}