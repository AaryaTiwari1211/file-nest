import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf")
);

export const roles = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    fileId: v.id("_storage"),
    folderId: v.optional(v.id("folders")),
    userId: v.id("users"),
    shouldDelete: v.optional(v.boolean()),
  })
    .index("by_shouldDelete", ["shouldDelete"])
    .index("by_fileId", ["fileId"]),

  favorites: defineTable({
    fileId: v.id("files"),
    userId: v.id("users"),
  }).index("by_userId_fileId", ["userId", "fileId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(roles),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    files: v.array(v.id("_storage")),
    folders: v.array(v.id("folders")),
    shouldDelete: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_name", ["name"])
    .index("by_shouldDelete", ["shouldDelete"]),
});
