"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

interface AdditionRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { file: File | null; description: string }) => void;
    loading?: boolean;
}

type FormValues = {
    file: FileList;
    description: string;
};

export function AdditionRequestModal({
    open,
    onOpenChange,
    onSubmit,
    loading = false,
}: AdditionRequestModalProps) {
    const form = useForm<FormValues>();
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleDialogChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.reset();
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            file: data.file?.[0] ?? null,
            description: data.description,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button>Upload File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-8">File Upload Request</DialogTitle>
                    <DialogDescription>
                        This file will be accessible by anyone in your organization once approved
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                    <div>
                        <label htmlFor="file-upload" className="block mb-1 font-medium">
                            File
                        </label>
                        <Input
                            id="file-upload"
                            type="file"
                            {...form.register("file", { required: true })}
                            ref={e => {
                                form.register("file").ref(e);
                                fileInputRef.current = e;
                            }}
                        />
                        {form.formState.errors.file && (
                            <span className="text-sm text-red-500">File is required</span>
                        )}
                    </div>
                    <div>
                        <label htmlFor="description" className="block mb-1 font-medium">
                            Title
                        </label>
                        <Input
                            id="description"
                            placeholder="Title of the file...."
                            {...form.register("description", { required: true })}
                        />
                        {form.formState.errors.description && (
                            <span className="text-sm text-red-500">Description is required</span>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                            {loading || form.formState.isSubmitting ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}