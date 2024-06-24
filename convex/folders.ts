import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { hasAccessToOrg } from "./files";

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
      orgId: args.orgId,
      parentId: args.parentId,
      files: [],
    });
  },
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

    const query = args.query;
    if (query) {
      folders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  },
});
