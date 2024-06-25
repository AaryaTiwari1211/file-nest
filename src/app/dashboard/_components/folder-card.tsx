import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";

import { Doc } from "../../../../convex/_generated/dataModel";
import { Folder } from "lucide-react";
import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FolderActions } from "./folder-actions";

export const FolderCard = ({ folder }: { folder: Doc<"folders"> }) => {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: folder.userId,
  });

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">
            <Folder />
          </div>{" "}
          {folder.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FolderActions folderId={folder._id} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        <Folder className="w-20 h-20" />
      </CardContent>
      <CardFooter className="flex justify-between xl:flex-nowrap xl:gap-0 lg:flex-wrap sm:gap-3 sm:flex-wrap">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
      </CardFooter>
    </Card>
  );
};
