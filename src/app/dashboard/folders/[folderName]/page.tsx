"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FileCard } from "../../_components/file-card";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { Placeholder } from "../../_components/file-browser";
import { UploadButton } from "../../_components/upload-button";
import { AddFolderButton } from "../../_components/add-folder";
import { use } from "react";
import React from "react";

const FolderPage = ({ params }: {
  params: Promise<{ folderName: string }>;
}) => {
  const { folderName } = use(params);
  const router = useRouter();
  const folder = useQuery(api.folders.getFolderByName, {
    folderName: folderName as string,
  });

  const filesQuery = useQuery(api.folders.getFilesInFolder, {
    folderId: folder?._id as Id<"folders">,
  });

  if (!folder || !filesQuery) {
    return <div>Loading...</div>;
  }

  const files = filesQuery as Doc<"files">[];

  return (
    <div className="flex flex-col gap-24">
      <div className="flex gap-5">
        <Button className="w-24" onClick={() => router.back()}>
          Go Back
        </Button>
        <UploadButton />
        <AddFolderButton />
      </div>
      <div className="flex gap-5">
        {files.map((file) => (
          <FileCard file={file} key={file._id} />
        ))}
        {files.length === 0 && <Placeholder />}
      </div>
    </div>
  );
};

export default FolderPage;
