"use client";

import LoadingLogo from "@/components/shared/LoadingLogo";
import { ClerkProvider, SignInButton, useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

type Props = {
  children: React.ReactNode;
};
const convex_url = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convex_url);

const ConvexClientProvider = ({ children }: Props) => {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Unauthenticated>
        <SignInButton />
        </Unauthenticated>
        <Authenticated>
        {children}
        </Authenticated>
        <AuthLoading>
          <LoadingLogo/>
        </AuthLoading>
        
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

export default ConvexClientProvider;
