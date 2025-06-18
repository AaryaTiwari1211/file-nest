"use client";
import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Doc } from "../../../../../convex/_generated/dataModel";

interface DeletionRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => void;
    loading?: boolean;
    file: Doc<"files">
}

export function DeletionRequestModal({
    open,
    onOpenChange,
    onSubmit,
    loading = false,
    file
}: DeletionRequestModalProps) {
    const [reason, setReason] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(reason);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) setReason("");
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-8">Request File Deletion</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for deleting this file. This request will be reviewed by your organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="deletion-reason">Reason for Deletion</Label>
                        <Textarea
                            id="deletion-reason"
                            placeholder="Describe why you want to delete this file..."
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="flex gap-1">
                            {loading && (
                                // Replace with your loader icon if needed
                                <span className="h-4 w-4 animate-spin mr-1">⏳</span>
                            )}
                            {loading ? "Submitting..." : "Request Deletion"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}