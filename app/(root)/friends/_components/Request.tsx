import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { ConvexError } from "convex/values";
import { Check, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {
  id: Id<"requests">;
  imageUrl: string;
  username: string;
  email: string;
};

const Request = ({ id, imageUrl, username, email }: Props) => {
  const { mutate: denyRequest, Pending: denyPending } = useMutationState(
    api.request.deny
  );
  const { mutate: acceptRequest, Pending: acceptPending } = useMutationState(
    api.request.accept
  );
  return (
    <Card className="flex items-center justify-between gap-2 p-4 w-full">
      <div className="flex items-center gap-4 w-full overflow-hidden">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>{" "}
          {/* ✅ Fixed */}
        </Avatar>
        <div className="flex flex-col w-full overflow-hidden">
          <h4 className="truncate text-lg font-medium">{username}</h4>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" disabled={denyPending || acceptPending} onClick={() => {
          acceptRequest({id})
          .then(()=>{
            toast.success("Friend Request accept")
          })
          .catch((error)=>{
            toast.error(
              error instanceof ConvexError
                ? error.data
                : "Unexpected error occur"
            );
          })
        }}>
          <Check />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          disabled={denyPending || acceptPending}
          onClick={() => {
            denyRequest({ id })
              .then(() => {
                toast.success("Friend Request denied");
              })
              .catch((error) => {
                toast.error(
                  error instanceof ConvexError
                    ? error.data
                    : "Unexpected error occur"
                );
              });
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
