import { useMutation } from 'convex/react';
import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  mutation,
  query,
} from "./_generated/server";
import { hasAccessToOrg } from "./files";
import { Id } from "./_generated/dataModel";
import exp from "constants";
import { Doc } from './_generated/dataModel';

export const createFolder = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
    parentId: v.optional(v.id("folders")),
    
  },
  async handler(ctx, args) {
    const user = await hasAccessToOrg(ctx, args.orgId);
    if (!user) {
      throw new ConvexError("You do not have access to this organization");
    }
    await ctx.db.insert("folders", {
      name: args.name,
      userId: user.user._id,
      orgId: args.orgId,
      parentId: args.parentId,
      files: [],
    })
  }
});

export const getFolders = query({
  args: {
    query: v.optional(v.string()),
    orgId: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  async handler(ctx, args) {
    const user = await hasAccessToOrg(ctx, args.orgId);
    if (!user) {
      throw new ConvexError("You do not have access to this organization");
    }

    let folders = await ctx.db
      .query("folders")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (args.query) {
      const queryLower = args.query.toLowerCase();
      folders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(queryLower)
      );
    }

    if (args.parentId) {
      folders = folders.filter((folder) => folder.parentId === args.parentId);
    }

    return folders;
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId)
    if (!folder) {
      throw new ConvexError("Folder not found");
    }
    return await ctx.db.delete(folder._id);
  },
});

export const uploadFileInFolder = mutation({
  args: {
    folderId: v.id('folders'),
    fileId: v.id('_storage'),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError('Folder not found');
    }

    await ctx.db.patch(args.folderId, {
      files: [...folder.files, args.fileId],
    });
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
  }
})

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
  }
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
    fileIds: v.array(v.id('_storage')),
  },
  async handler(ctx, args) {
    const files = [];
    for (const fileId of args.fileIds) {
      const file = await ctx.db.query("files")
      .withIndex("by_fileId" ,(q) => q.eq("fileId", fileId))
      .first()
      if (file) {
        files.push(file);
      }
    }
    return files;
  },
});



// export const uploadFileInFolder = mutation({
//   args: {
//     folderId: v.id("folders"),
//     fileId: v.id("_storage"),
//   },
//   async handler(ctx, args) {
//     const folder = await ctx.db.
//     query("folders")
//     .withIndex("by_id", (q) =>
//     if (!folder) {
//       throw new ConvexError("Folder not found");
//     }
//     folder.files.push(args.fileId);
//     await ctx.db.update("folders", args.folderId, folder);
//   },
// });
