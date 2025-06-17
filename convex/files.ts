import { ConvexError, v } from "convex/values";
import {
  mutation,
  query,
} from "./_generated/server";
import { fileTypes } from "./schema";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("You must be logged in to upload a file.");
  }

  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
    folderId: v.optional(v.id("folders")),
    size: v.optional(v.number()),
    tenantId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("You must be logged in.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) throw new ConvexError("User not found.");

    await ctx.db.insert("files", {
      name: args.name,
      nameLower: args.name.toLowerCase(),
      url: await ctx.storage.getUrl(args.fileId) || "",
      isFavorited: false,
      fileId: args.fileId,
      type: args.type,
      folderId: args.folderId,
      userId: user._id,
      tenantId: args.tenantId ?? "default",
      size: args.size ?? 0,
      createdAt: Date.now(),
      shouldDelete: false,
      status: "pending",
    });
  },
});

export const deleteAllFiles = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Login required.");

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();
  if (!user) throw new ConvexError("User not found.");

  const files = await ctx.db
    .query("files")
    .withIndex("by_userId_folderId", (q) => q.eq("userId", user._id))
    .collect();

  await Promise.all(
    files.map((file) => ctx.db.patch(file._id, { shouldDelete: true }))
  );
});

export const getFiles = query({
  args: {
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
    type: v.optional(fileTypes),
    tenantId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) return [];

    let files = await ctx.db
      .query("files")
      .withIndex("by_userId_folderId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.query) {
      const q = args.query.toLowerCase();
      files = files.filter((file) => file.nameLower.includes(q));
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_fileId", (q) =>
          q.eq("userId", user._id)
        )
        .collect();
      const favoriteIds = new Set(favorites.map((f) => f.fileId));
      files = files.filter((file) => favoriteIds.has(file._id));
    }

    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete);
    } else {
      files = files.filter((file) => !file.shouldDelete);
    }

    if (args.type) {
      files = files.filter((file) => file.type === args.type);
    }

    if (args.tenantId) {
      files = files.filter((file) => file.tenantId === args.tenantId);
    }

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Login required.");

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)).first();
    if (!user) throw new ConvexError("User not found.");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("File not found.");

    if (file.userId !== user._id) {
      throw new ConvexError("You have no access to delete this file.");
    }

    await ctx.db.patch(file._id, { shouldDelete: true });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Login required.");

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)).first();
    if (!user) throw new ConvexError("User not found.");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("File not found.");

    if (file.userId !== user._id) {
      throw new ConvexError("You have no access to restore this file.");
    }

    await ctx.db.patch(file._id, { shouldDelete: false });
  },
});

export const approveFile = mutation({
  args: { fileId: v.id("files"), approvedBy: v.id("users") },
  async handler(ctx, args) {
    const admin = await ctx.db.get(args.approvedBy);
    if (!admin || admin.role !== "admin") {
      throw new ConvexError("Only admins can approve files.");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("File not found.");

    await ctx.db.patch(file._id, { status: "approved" });
  },
});

export const getFileById = query({
  args: { fileId: v.id("_storage") },
  async handler(ctx, args) {
    return await ctx.db.query("files").withIndex("by_fileId", (q) =>
      q.eq("fileId", args.fileId)).first();
  },
});
