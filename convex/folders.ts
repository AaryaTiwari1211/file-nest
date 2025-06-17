import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    tenantId: v.optional(v.string()), // Multi-tenancy support
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a folder.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("User not found.");
    }

    const folder = await ctx.db.insert("folders", {
      name: args.name,
      nameLower: args.name.toLowerCase(),
      parentId: args.parentId,
      userId: user._id,
      tenantId: args.tenantId ?? "default",
      createdAt: Date.now(),
      lastModifiedAt: Date.now(),
      shouldDelete: false,
      accessControl: "private",
      tags: [],
    });

    return folder;
  },
});

// Upload a file to a folder
export const uploadFileInFolder = mutation({
  args: {
    folderId: v.id("folders"),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new ConvexError("Folder not found.");

    await ctx.db.patch(args.folderId, { lastModifiedAt: Date.now() });

    const file = await ctx.db
      .query("files")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .first();

    if (file) {
      await ctx.db.patch(file._id, { folderId: args.folderId });
    }
  },
});

// Fetch folders with search and filtering options
export const getFolders = query({
  args: {
    query: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
    tenantId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to fetch folders.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("User not found.");
    }

    let baseQuery = ctx.db.query("folders").withIndex("by_userId_parentId", (q) =>
      q.eq("userId", user._id).eq("parentId", args.parentId ?? undefined)
    );

    if (args.tenantId) {
      baseQuery = ctx.db.query("folders").withIndex("by_tenantId", (q) =>
        q.eq("tenantId", args.tenantId)
      );
    }

    let folders = await baseQuery.collect();

    if (args.query) {
      const lowered = args.query.toLowerCase();
      folders = folders.filter((folder) => folder.nameLower.includes(lowered));
    }

    return folders;
  },
});

export const getFilesInFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found.");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();

    return files;
  },
});

export const getFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found.");
    }
    return folder;
  },
});

// Fetch a folder by name (case-insensitive)
export const getFolderByName = query({
  args: {
    folderName: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("folders")
      .withIndex("by_nameLower", (q) =>
        q.eq("nameLower", args.folderName.toLowerCase())
      )
      .first();
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found.");
    }

    await ctx.db.patch(args.folderId, {
      shouldDelete: true,
      lastModifiedAt: Date.now(),
    });
  },
});

// Restore a deleted folder
export const restoreFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found.");
    }

    await ctx.db.patch(args.folderId, {
      shouldDelete: false,
      lastModifiedAt: Date.now(),
    });
  },
});

// Nest a folder inside another folder
export const addFolderInFolder = mutation({
  args: {
    folderId: v.id("folders"),
    parentId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found.");
    }

    await ctx.db.patch(args.folderId, {
      parentId: args.parentId,
      lastModifiedAt: Date.now(),
    });
  },
});
