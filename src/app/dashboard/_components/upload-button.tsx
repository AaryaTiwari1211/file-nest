"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { usePathname } from "next/navigation";
import { AdditionRequestModal } from "./modals/addition-request";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});

export function UploadButton() {
  const path = usePathname();
  const folderName = path.replace("/dashboard/folders/", "");
  const uploadFileInFolder = useMutation(api.folders.uploadFileInFolder);
  const folder = useQuery(api.folders.getFolderByName, {
    folderName: folderName as string,
  });
  const [folderData, setFolderData] = useState<Doc<"folders"> | null>(null);

  useEffect(() => {
    if (folder !== undefined) {
      setFolderData(folder);
      console.log("Folder data:", folder);
    }
  }, [folder]);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {

    const postUrl = await generateUploadUrl();

    const fileType = values.file[0].type;

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": fileType },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    const types = {
      "image/png": "image",
      "application/pdf": "pdf",
      "text/csv": "csv",
    } as Record<string, Doc<"files">["type"]>;

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        type: types[fileType],
        folderId: folderData?._id,
      });

      if (folderData) {
        await uploadFileInFolder({
          fileId: storageId,
          folderId: folderData._id,
        });
        console.log("File uploaded in folder");
      }
      form.reset();

      setIsFileDialogOpen(false);

      toast.success("File Uploaded");
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const createFile = useMutation(api.files.createFile);

  return (
    <AdditionRequestModal
      open={isFileDialogOpen}
      onOpenChange={setIsFileDialogOpen}
      onSubmit={async (data) => {
        await onSubmit({
          title: data.description,
          file: data.file instanceof FileList
            ? data.file
            : data.file instanceof File
            ? (() => {
                const dt = new DataTransfer();
                dt.items.add(data.file);
                return dt.files;
              })()
            : new FileList(),
        });
      }}
      loading={form.formState.isSubmitting}
    />
  );
}
