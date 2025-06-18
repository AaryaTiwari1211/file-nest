"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { AdditionRequestModal } from "./modals/addition-request";
import { mapMimeTypeToType } from "@/app/utils/mapMIMEtype";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});

export function UploadButton() {
  const createApprovalRequest = useMutation(api.approvals.createApprovalRequest);
  const createFile = useMutation(api.files.createFile);
  const me = useQuery(api.users.getMe);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const postUrl = await generateUploadUrl();
    const fileType = values.file[0].type;
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": fileType },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    try {
      if (!me) {
        toast.error("You must be logged in to upload a file.");
        return;
      }

      const createdFileRecord = await createFile({
        name: values.title,
        fileId: storageId,
        type: mapMimeTypeToType(values.file[0].type),
        folderId: undefined,
        size: values.file[0].size,
        tenantId: me.tenantId,
      });

      if (!createdFileRecord) {
        toast.error("File not created.");
        return;
      }

      await createApprovalRequest({
        fileId: createdFileRecord._id,
        fileName:createdFileRecord.name,
        description: values.title,
        type: "addition",
        userId: me._id,
      });
      
      form.reset();
      setIsFileDialogOpen(false);

      toast.success("File Approval Request Created! Please wait while the admin approves your request");
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  // Adapter to match AdditionRequestModal's expected signature
  const onModalSubmit = async (data: { file: File | null; description: string }) => {
    if (!data.file) {
      toast.error("File is required.");
      return;
    }
    await handleFormSubmit({
      title: data.description,
      file: {
        0: data.file,
        length: 1,
        item: (index: number) => (index === 0 ? data.file : null),
        [Symbol.iterator]: function* () {
          yield data.file;
        }
      } as unknown as FileList,
    });
  };

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  return (
    <AdditionRequestModal
      open={isFileDialogOpen}
      onOpenChange={setIsFileDialogOpen}
      onSubmit={onModalSubmit}
      loading={form.formState.isSubmitting}
    />
  );
}
