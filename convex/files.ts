import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

// Generate signed upload URL
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

// Create file metadata
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
    folderId: v.optional(v.id("folders")),
    size: v.optional(v.number()), // New: optional file size
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("you must be logged in");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new ConvexError("user not found");

    await ctx.db.insert("files", {
      name: args.name,
      nameLower: args.name.toLowerCase(), // New: normalize name
      fileId: args.fileId,
      type: args.type,
      folderId: args.folderId,
      userId: user._id,
      size: args.size,
      createdAt: Date.now(), // New: timestamp
      shouldDelete: false,
    });
  },
});

// Fetch files with filters
export const getFiles = query({
  args: {
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
    type: v.optional(fileTypes),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
        .withIndex("by_userId_fileId", (q) => q.eq("userId", user._id))
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

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
  },
});

export const deleteAllFiles = internalMutation({
  async handler(ctx) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});

function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
  if (file.userId !== user._id) {
    throw new ConvexError("you have no access to delete this file");
  }
}

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("login required");

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)).first();
    if (!user) throw new ConvexError("user not found");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("file not found");

    assertCanDeleteFile(user, file);
    await ctx.db.patch(file._id, { shouldDelete: true });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("login required");

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)).first();
    if (!user) throw new ConvexError("user not found");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("file not found");

    assertCanDeleteFile(user, file);
    await ctx.db.patch(file._id, { shouldDelete: false });
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("login required");

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)).first();
    if (!user) throw new ConvexError("user not found");

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_fileId", (q) =>
        q.eq("userId", user._id).eq("fileId", args.fileId))
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: args.fileId,
        userId: user._id,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const getAllFavorites = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("favorites")
      .withIndex("by_userId_fileId", (q) =>
        q.eq("userId", user._id))
      .collect();
  },
});

export const getFileById = query({
  args: { fileId: v.id("_storage") },
  async handler(ctx, args) {
    return await ctx.db.query("files").withIndex("by_fileId", (q) =>
      q.eq("fileId", args.fileId)).first();
  },
});
