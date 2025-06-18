import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf"),
  v.literal("video"),
  v.literal("text"),
  v.literal("doc"),
  v.literal("docx"),
  v.literal("xls"),
  v.literal("xlsx"),
  v.literal("ppt"),
  v.literal("pptx"),
  v.literal("zip"),
  v.literal("rar"),
  v.literal("audio"),
  v.literal("json"),
  v.literal("xml"),
  v.literal("html"),
  v.literal("md"),
  v.literal("other")
);
export const roles = v.union(v.literal("admin"), v.literal("member"), v.literal("super-admin"));
export const approvalRequestTypes = v.union(v.literal("addition"), v.literal("deletion"));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(roles),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    status: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    tenantId: v.optional(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]).index("by_email", ["email"]).index("by_status", ["status"]),

  folders: defineTable({
    userId: v.id("users"), 
    tenantId: v.optional(v.string()),
    name: v.string(),
    nameLower: v.string(),
    parentId: v.optional(v.id("folders")),
    isRoot: v.optional(v.boolean()),
    shouldDelete: v.optional(v.boolean()),
    accessControl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    lastModifiedAt: v.optional(v.number()),
  })
    .index("by_userId_parentId", ["userId", "parentId"])
    .index("by_nameLower", ["nameLower"])
    .index("by_shouldDelete", ["shouldDelete"])
    .index("by_tenantId", ["tenantId"]),

  files: defineTable({
    name: v.string(),
    nameLower: v.string(),
    type: fileTypes,
    isApproved: v.optional(v.boolean()),
    url: v.string(),
    isFavorited: v.boolean(),
    fileId: v.id("_storage"),
    folderId: v.optional(v.id("folders")),
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    size: v.optional(v.number()),
    shouldDelete: v.optional(v.boolean()),
    createdAt: v.number(),
    lastModifiedAt: v.optional(v.number()),
    status: v.optional(v.string()),
    accessLogs: v.optional(v.array(v.object({ userId: v.id("users"), accessedAt: v.number() }))),
    encryptionKey: v.optional(v.string()),
    checksum: v.optional(v.string()),
    versionHistory: v.optional(v.array(v.object({ version: v.number(), modifiedAt: v.number() }))),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_fileId", ["fileId"])
    .index("by_userId_folderId", ["userId", "folderId"])
    .index("by_shouldDelete", ["shouldDelete"])
    .index("by_tenantId", ["tenantId"])
    .index("by_folderId", ["folderId"])
    .index("by_nameLower", ["nameLower"]),

  approvals: defineTable({
    fileId: v.id("files"),
    fileName: v.string(),
    approvedBy: v.optional(v.id("users")),
    requestedBy: v.object({
      id: v.id("users"),
      name: v.string(),
    }),
    requestedAt: v.string(),
    approvedAt: v.optional(v.string()),
    status: v.string(),
    remarks: v.optional(v.string()),
    adminSignature: v.optional(v.string()),
    type: approvalRequestTypes,
    description: v.optional(v.string()),
  }).index("by_approvedBy", ["approvedBy"])
    .index("by_status", ["status"])
    .index("by_fileId", ["fileId"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    action: v.string(),
    targetId: v.optional(v.id("files")),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    deviceMetadata: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_tenantId", ["tenantId"]),

  favorites: defineTable({
    fileId: v.id("files"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_userId_fileId", ["userId", "fileId"]),

  searchIndex: defineTable({
    entityId: v.id("files"),
    entityType: v.string(),
    tenantId: v.optional(v.string()),
    keywords: v.array(v.string()),
    metadata: v.optional(v.object({ key: v.string(), value: v.string() })), 
  }).index("by_entityType", ["entityType"]).index("by_tenantId", ["tenantId"]),
});
