// pages/folders/[folderId].tsx
"use client";
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { FolderCard } from '../../_components/folder-card';
import { FileCard } from '../../_components/file-card';
import { useEffect } from 'react';
import { Doc } from '../../../../../convex/_generated/dataModel';
const FolderPage = ({params} : {params: {
  folderName: string
}}) => {
  const router = useRouter();
  const folder = useQuery(api.folders.getFolderByName, {
    folderName: params.folderName as string,
  });

  if (!folder) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{folder.name}</h1>
      <Button onClick={() => router.back()}>Go Back</Button>
      {/* Render folder contents here */}
      {
        folder.files.map((file1) => {
          const fileDoc = useQuery(api.files.getFileById, {
            fileId: file1,
          }) as Doc<"files"> & { isFavorited: boolean; url: string | null; };
          if (!fileDoc) {
            return null;
          }
          return <FileCard file={fileDoc} key={file1} />
      })
      }
    </div>
  );
};

export default FolderPage;
