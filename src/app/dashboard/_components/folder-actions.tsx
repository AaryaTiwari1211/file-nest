import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { set } from "date-fns";

export function FolderActions({ folderId }: { folderId: Id<"folders"> }) {
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const uploadFile = useMutation(api.folders.uploadFileinFolder);
  const addFolder = useMutation(api.folders.addFolderinFolder);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const folder = useQuery(api.folders.getFolder, {
    folderId: folderId,
  });
  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [folderStore, setFolderStore] = useState<Doc<"folders"> | null>(null);

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the folder for our deletion process. Folders
              are deleted periodically
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFolder({ folderId: folderId });
                toast({
                  variant: "default",
                  title: "Folder marked for deletion",
                  description: "Your folder will be deleted soon",
                });
                setIsConfirmOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload a File in this folder</AlertDialogTitle>
            <AlertDialogDescription>
              Upload File in folder
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFolder({ folderId: folderId });
                toast({
                  variant: "default",
                  title: "Folder marked for deletion",
                  description: "Your folder will be deleted soon",
                });
                setIsConfirmOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={async () => {
              setIsConfirmOpen(true);
              await addFolder({
                folderId: folderId,
                parentId: folderId,
              });
              toast({
                variant: "default",
                title: "Folder added",
                description: "Your folder has been added",
              });
              setIsConfirmOpen(false);
            }}
          >
            Add Folder
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {

              toast({
                variant: "default",
                title: "File uploaded",
                description: "Your file has been uploaded",
              });
            }}
          >
            Upload File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
