import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { approvalRequestTypes } from "./schema";

export const createApprovalRequest = mutation({
    args: {
        fileId: v.id("files"),
        fileName: v.string(),
        userId: v.id("users"),
        type: approvalRequestTypes,
        description: v.optional(v.string()),
    },
    async handler(ctx, args) {
        const file = await ctx.db.get(args.fileId);
        if (!file || file.status !== "pending") {
            throw new ConvexError("Invalid file for approval request.");
        }
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new ConvexError("User not found.");
        }
        await ctx.db.insert("approvals", {
            fileId: args.fileId,
            fileName: args.fileName,
            requestedBy: { name: user.name, id: args.userId },
            requestedAt: Date.now().toString(),
            status: "pending",
            type: args.type,
            description: args.description ?? "",
            approvedAt: ""
        });
    },
});

export const getAllApprovals = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query("approvals").collect();
    }
})

export const getAcceptedApprovals = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query("approvals").withIndex("by_status", (q) =>
            q.eq("status", "accepted")).collect();
    }
})

export const getRejectedApprovals = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query("approvals").withIndex("by_status", (q) =>
            q.eq("status", "rejected")).collect();
    }
})

export const getApprovalByFileId = query({
    args: {
        fileId: v.id("files")
    },
    async handler (ctx , args) {
        const approval = await ctx.db.query("approvals")
            .withIndex("by_fileId", q => q.eq("fileId", args.fileId))
            .first();
        return approval;
    }
})

export const getPendingApprovals = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query("approvals").withIndex("by_status", (q) =>
            q.eq("status", "pending")).collect();
    },
});

export const approveFile = mutation({
    args: { fileId: v.id("files"), adminId: v.id("users"), remarks: v.optional(v.string()),approvalId: v.id("approvals")},
    async handler(ctx, args) {
        console.log("Admin ID is: ", args.adminId)
        const admin = await ctx.db.get(args.adminId);

        if (!admin || admin.role === "member") {
            throw new ConvexError("Only admins can approve files.");
        }

        const file = await ctx.db.get(args.fileId);
        if (!file || file.status !== "pending") {
            throw new ConvexError("Invalid file for approval.");
        }

        await ctx.db.patch(file._id, { status: "approved" , isApproved: true });
        await ctx.db.patch(args.approvalId, {
            status: "accepted",
            approvedBy: args.adminId,
            approvedAt: Date.now().toString(),
            remarks: args.remarks ?? "",
            adminSignature: `SIG-${Date.now()}`
        });
    },
});

export const revertApprovalOrRejection = mutation({
    args: { approvalId: v.id("approvals"), adminId: v.id("users") },
    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role === "member") {
            throw new ConvexError("Only admins can revert approvals or rejections.");
        }

        const approval = await ctx.db.get(args.approvalId);
        if (!approval) {
            throw new ConvexError("Approval record not found.");
        }

        if (approval.status !== "accepted" && approval.status !== "rejected") {
            throw new ConvexError("Only accepted or rejected approvals can be reverted.");
        }

        // Revert approval record
        await ctx.db.patch(args.approvalId, {
            status: "pending",
            approvedBy: undefined,
            approvedAt: "",
            remarks: "",
            adminSignature: ""
        });

        // Also revert file status if needed
        if (approval.fileId) {
            const file = await ctx.db.get(approval.fileId);
            if (file && (file.status === "approved" || file.status === "rejected")) {
                await ctx.db.patch(file._id, { status: "pending", isApproved: false });
            }
        }
    },
});

export const rejectFile = mutation({
    args: { fileId: v.id("files"), adminId: v.id("users"), remarks: v.optional(v.string()), approvalId: v.id("approvals")},

    async handler(ctx, args) {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || admin.role === "member") {
            throw new ConvexError("Only admins can reject files.");
        }

        const file = await ctx.db.get(args.fileId);
        if (!file || file.status !== "pending") {
            throw new ConvexError("Invalid file for rejection.");
        }

        await ctx.db.patch(file._id, { status: "rejected" });

        await ctx.db.patch(args.approvalId, {
            status: "rejected",
            approvedBy: args.adminId,
            approvedAt: Date.now().toString(),
            remarks: args.remarks ?? "",
            adminSignature: `SIG-${Date.now()}`
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