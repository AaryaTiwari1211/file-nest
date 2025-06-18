import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { FileIcon, TrashIcon, UndoIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger , DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { DeletionRequestModal } from "@/app/dashboard/_components/modals/deletion-request"; // Update the import path

export function FileCardActions({
  file,
}: {
  file: Doc<"files"> & { url: string | null };
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const createApprovalRequest = useMutation(api.approvals.createApprovalRequest);

  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);

  return (
    <>
      {/* DeletionRequestModal */}
      <DeletionRequestModal
        open={isDeletionModalOpen}
        onOpenChange={setIsDeletionModalOpen}
        onSubmit={async (reason: string) => {
          await createApprovalRequest({
            fileId: file._id,
            fileName: file.name,
            description: reason,
            type: "deletion",
            userId: file.userId,
          })
          toast("Your file will be deleted soon");
          setIsDeletionModalOpen(false);
        }}
        file={file}
      />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              if (!file.url) return;
              window.open(file.url, "_blank");
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.shouldDelete) {
                  restoreFile({
                    fileId: file._id,
                  });
                } else {
                  setIsDeletionModalOpen(true); // Open the DeletionRequestModal
                }
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              {file.shouldDelete ? (
                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                  <TrashIcon className="w-4 h-4" /> Delete
                </div>
              )}
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
