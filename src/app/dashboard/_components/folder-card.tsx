import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Folder } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { FolderCardActions } from "./folder-actions";

export const FolderCard = ({ folder }: { folder: Doc<"folders"> }) => {
  const router = useRouter();

  const handleFolderClick = (folderName: string) => {
    router.push(`/dashboard/folders/${folderName}`);
  };

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: folder.userId,
  });

  return (
    <Card className="max-w-[400px]" onClick={() => handleFolderClick(folder.name)}>
      <CardHeader className="relative">
        <CardTitle className="font-normal">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Folder />
              {" "}
              {folder.name}
            </div>
            <div>
              <FolderCardActions folder={folder} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        <Folder className="w-20 h-20" />
      </CardContent>
      <CardFooter className="flex justify-between xl:flex-nowrap xl:gap-0 lg:flex-wrap sm:gap-3 sm:flex-wrap">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image || ""} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
      </CardFooter>
    </Card>
  );
};
