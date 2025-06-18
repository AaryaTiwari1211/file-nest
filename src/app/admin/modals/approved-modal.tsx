"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

interface ApproveRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (data: { adminNote: string }) => void;
    loading?: boolean;
    fileName: string;
    requester: string;
}

type FormValues = {
    adminNote: string;
};

export function ApproveRequestModal({
    open,
    onOpenChange,
    onApprove,
    loading = false,
    fileName,
    requester,
}: ApproveRequestModalProps) {
    const form = useForm<FormValues>();

    const handleDialogChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.reset();
        }
    };

    const handleApprove = (data: FormValues) => {
        onApprove({ adminNote: data.adminNote });
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline">Review Request</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-6">Approve File Upload Request</DialogTitle>
                    <DialogDescription>
                        Review the request details and approve or reject.
                    </DialogDescription>
                </DialogHeader>
                <div className="mb-4">
                    <div>
                        <span className="font-medium">Requester:</span> {requester}
                    </div>
                    <div>
                        <span className="font-medium">File Name:</span> {fileName}
                    </div>
                </div>
                <form
                    onSubmit={form.handleSubmit(handleApprove)}
                    className="space-y-6"
                >
                    <div>
                        <label htmlFor="admin-note" className="block mb-1 font-medium">
                            Admin Note (optional)
                        </label>
                        <Textarea
                            id="admin-note"
                            placeholder="Add a note for the requester (optional)..."
                            {...form.register("adminNote")}
                        />
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={loading || form.formState.isSubmitting}
                        >
                            {loading ? "Processing..." : "Approve"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}