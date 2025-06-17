import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { approvalRequestTypes } from "./schema";
export const getPendingApprovals = query({
    args: { adminId: v.id("users") },
    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Only admins can view pending approvals.");
        }

        return await ctx.db.query("approvals").withIndex("by_status", (q) =>
            q.eq("status", "pending")).collect();
    },
});

export const approveFile = mutation({
    args: { fileId: v.id("files"), adminId: v.id("users"), remarks: v.optional(v.string()) , type: approvalRequestTypes, description: v.optional(v.string())},
    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Only admins can approve files.");
        }

        const file = await ctx.db.get(args.fileId);
        if (!file || file.status !== "pending") {
            throw new ConvexError("Invalid file for approval.");
        }

        await ctx.db.patch(file._id, { status: "approved" });

        await ctx.db.insert("approvals", {
            fileId: args.fileId,
            approvedBy: args.adminId,
            approvedAt: Date.now(),
            status: "approved",
            remarks: args.remarks ?? "",
            adminSignature: `SIG-${Date.now()}`,
            type: args.type,
            description: args.description ?? "",
        });
    },
});

export const rejectFile = mutation({
    args: { fileId: v.id("files"), adminId: v.id("users"), remarks: v.optional(v.string()) , type: approvalRequestTypes, description: v.optional(v.string())},

    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Only admins can reject files.");
        }

        const file = await ctx.db.get(args.fileId);
        if (!file || file.status !== "pending") {
            throw new ConvexError("Invalid file for rejection.");
        }

        await ctx.db.patch(file._id, { status: "rejected" });

        await ctx.db.insert("approvals", {
            fileId: args.fileId,
            approvedBy: args.adminId,
            approvedAt: Date.now(),
            status: "rejected",
            remarks: args.remarks ?? "",
            adminSignature: `SIG-${Date.now()}`,
            type: args.type,
            description: args.description ?? "",
        });
    },
});

export const getApprovalHistory = query({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        return await ctx.db.query("approvals").withIndex("by_fileId", (q) =>
            q.eq("fileId", args.fileId)).collect();
    },
});

export const deleteApprovalRecords = internalMutation({
    args: { fileId: v.id("files"), adminId: v.id("users") },
    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Only admins can delete approval records.");
        }

        const approvals = await ctx.db.query("approvals").withIndex("by_fileId", (q) =>
            q.eq("fileId", args.fileId)).collect();

        await Promise.all(approvals.map(async (approval) => await ctx.db.delete(approval._id)));
    },
});