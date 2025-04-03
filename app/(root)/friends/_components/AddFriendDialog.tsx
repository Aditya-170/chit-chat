"use client"

import React from 'react'
import { z } from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutationState } from '@/hooks/useMutationState';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';


const addFriendFormSchema=z.object({
  email: z.string()
  .min(1,{message:"this is too small for email"})
  .email("Please enter a valid email address"),
});

const AddFriendDialog = () => { 
  const {mutate:createRequest, Pending: pending}=useMutationState(api.request.create);  

    const form =useForm<z.infer<typeof addFriendFormSchema>>({
        resolver:zodResolver(addFriendFormSchema),
        defaultValues:{
            email:"",
        },
    });
    const handleSubmit = async (values: z.infer<typeof addFriendFormSchema>) => {
      try {
        const response = await createRequest({ email: values.email });
    
        if (!response) {
          throw new Error("Unexpected empty response from server");
        }
    
        form.reset();
        toast.success("Friend request sent!");
      } catch (error) {
        console.error("Error while sending friend request:", error);
    
        if (error instanceof ConvexError) {
          toast.error(error.data);
        } else {
          toast.error( "Unexpected error occurred");
        }
      }
    };
    
    
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger>
          <Button size='icon' variant="outline">
            <DialogTrigger>
              <UserPlus/>
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Friend</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Add a friend by entering their email address below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
            <FormField control={form.control} name="email" render={({ field }) => 
             <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter email' {...field} />
              </FormControl>
              <FormMessage/>
             </FormItem>
            }/>
            <DialogFooter>
              <Button disabled={pending} type='submit'>Send</Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendDialog