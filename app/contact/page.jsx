"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPinIcon, PhoneIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';

const contactInfo = [
  {
    icon: MapPinIcon,
    title: "Location",
    details: "Boisar, Maharashtra, India",
  },
  {
    icon: PhoneIcon,
    title: "Phone",
    details: "+91 XXXX-XXXX-XX",
  },
  {
    icon: MailIcon,
    title: "Email",
    details: "gauravanilwankhede2002@gmail.com",
  },
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values) {
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description: "Email service is not properly configured.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name: values.name,
          from_email: values.email,
          message: values.message,
          to_name: "Gaurav",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        toast({
          title: "Message sent!",
          description: "Thank you for reaching out. I'll get back to you soon.",
          variant: "default",
        });
        form.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
          <h1 className={`text-4xl text-center md:text-5xl font-bold mb-6 mt-10 bg-clip-text text-transparent ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-teal-500'}`}>
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about HeroicFlow? We're here to help. Send us a message
            and we'll respond as soon as possible.
          </p>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={item}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field}
                          className="bg-background border-input focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field}
                          className="bg-background border-input focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your message" 
                          {...field}
                          className="bg-background border-input focus:border-primary min-h-[150px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full ${theme === 'dark' ? 'bg-primary-dark text-white' : 'bg-primary-light text-gray-800'} hover:opacity-90 transition-opacity duration-300`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Sending</span>
                      <span className="loading loading-dots loading-xs"></span>
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <info.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{info.title}</h3>
                    <p className="text-muted-foreground">{info.details}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}