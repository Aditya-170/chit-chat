"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import React from "react";
import DMConversationItem from "../_components/DMConversationItem";

type Props = React.PropsWithChildren<{}>;

const ConversationsLayout = ({ children }: Props) => {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title="conversations">
        {conversations ? (
          conversations.length === 0 ? (
            <p className="w-full h-full flex items-center justify-center">
              No conversation Yet
            </p>
          ) : (
            conversations.map((conversations) => {
              if (conversations) {
                return conversations.conversation.isGroup ? null : (
                  <DMConversationItem
                    key={conversations.conversation._id}
                    id={conversations.conversation._id}
                    username={conversations.otherMember?.username || ""}
                    imageUrl={conversations.otherMember?.imageUrl || ""}
                  />
                );
              }
            })
          )
        ) : (
          <Loader2 />
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ConversationsLayout;
