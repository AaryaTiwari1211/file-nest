import { useMutation } from "convex/react";
import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import exp from "constants";
import { Doc } from "./_generated/dataModel";

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a folder");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.insert("folders", {
      name: args.name,
      parentId: args.parentId,
      files: [],
      folders: [],
      userId: user._id,
    });
  },
});

export const getFolders = query({
  args: {
    query: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
  },
  async handler(ctx, args) {
    let folders = await ctx.db.query("folders").collect();

    if (args.query) {
      const queryLower = args.query.toLowerCase();
      folders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(queryLower)
      );
    }

    if (args.parentId) {
      folders = folders.filter((folder) => folder.parentId === args.parentId);
    }

    if (folders && folders.length === 0) {
      return [];
    }

    return folders;
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found");
    }
    return await ctx.db.delete(folder._id);
  },
});

export const deleteAllFolders = mutation({
  async handler(ctx) {
    const folders = await ctx.db.query("folders").collect();
    for (const folder of folders) {
      await Promise.all(
        folder.files.map(async (file) => {
          const file1 = await ctx.db
            .query("files")
            .withIndex("by_fileId", (q) => q.eq("fileId", file))
            .first();
          if (file1) {
            await ctx.storage.delete(file);
            await ctx.db.delete(file1._id);
          }
        })
      );
      await ctx.db.delete(folder._id);
    }
  },
});

export const restoreFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found");
    }
    folder.shouldDelete = false;
    await ctx.db.patch(args.folderId, folder);
  },
});

export const uploadFileInFolder = mutation({
  args: {
    folderId: v.id("folders"),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found");
    }

    const file = await ctx.db
      .query("files")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .first();

    await ctx.db.patch(args.folderId, {
      files: [...folder.files, args.fileId],
    });

    if (file) {
      await ctx.db.patch(file._id, {
        folderId: args.folderId,
      });
    }
  },
});

export const addFolderinFolder = mutation({
  args: {
    folderId: v.id("folders"),
    parentId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found");
    }
    folder.parentId = args.parentId;
    await ctx.db.patch(args.folderId, folder);
  },
});

export const getFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError("Folder not found");
    }
    return folder;
  },
});

export const getFolderByName = query({
  args: {
    folderName: v.string(),
  },
  async handler(ctx, args) {
    const folder = await ctx.db
      .query("folders")
      .withIndex("by_name", (q) => q.eq("name", args.folderName))
      .first();
    if (!folder) {
      return undefined;
    }
    return folder;
  },
});

export const getFilesByIds = query({
  args: {
    fileIds: v.array(v.id("_storage")),
  },
  async handler(ctx, args) {
    const files = [];
    for (const fileId of args.fileIds) {
      const file = await ctx.db
        .query("files")
        .withIndex("by_fileId", (q) => q.eq("fileId", fileId))
        .first();
      if (file) {
        files.push(file);
      }
    }
    return files;
  },
});
