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

interface RejectedModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: (data: { adminNote: string }) => void;
    loading?: boolean;
    fileName: string;
    requester: string;
}

type FormValues = {
    adminNote: string;
};

export function RejectedModal({
    open,
    onOpenChange,
    onReject,
    loading = false,
    fileName,
    requester,
}: RejectedModalProps) {
    const form = useForm<FormValues>();

    const handleDialogChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.reset();
        }
    };

    const handleReject = (data: FormValues) => {
        onReject({ adminNote: data.adminNote });
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="destructive">Reject Request</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-6">Reject File Upload Request</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this request.
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
                    onSubmit={form.handleSubmit(handleReject)}
                    className="space-y-6"
                >
                    <div>
                        <label htmlFor="admin-note" className="block mb-1 font-medium">
                            Rejection Reason (optional)
                        </label>
                        <Textarea
                            id="admin-note"
                            placeholder="Add a note for the requester (optional)..."
                            {...form.register("adminNote")}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading || form.formState.isSubmitting}
                        >
                            {loading ? "Processing..." : "Reject"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}