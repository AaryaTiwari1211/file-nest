export function mapMimeTypeToType(mimeType: string):
    "image" | "csv" | "pdf" | "video" | "text" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "zip" | "rar" | "audio" | "json" | "xml" | "html" | "md" | "other" {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "text/csv") return "csv";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("text/")) return "text";
    if (mimeType === "application/msword") return "doc";
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
    if (mimeType === "application/vnd.ms-excel") return "xls";
    if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "xlsx";
    if (mimeType === "application/vnd.ms-powerpoint") return "ppt";
    if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
    if (mimeType === "application/zip") return "zip";
    if (mimeType === "application/x-rar-compressed") return "rar";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/json") return "json";
    if (mimeType === "application/xml" || mimeType === "text/xml") return "xml";
    if (mimeType === "text/html") return "html";
    if (mimeType === "text/markdown") return "md";
    return "other";
}