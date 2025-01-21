"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Layout,
  Calendar,
  BarChart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CompanyCarousel from "@/components/company-carousel";
import Image from "next/image";
import { useTheme } from "next-themes";

const faqs = [
  {
    question: "What is AI-Flow?",
    answer:
      "AI-Flow is an advanced AI-driven project management tool designed to empower teams with intelligent insights and automation. It combines cutting-edge AI technology with a user-friendly interface to transform your workflow and significantly boost team productivity.",
  },
  {
    question: "How does AI-Flow differ from traditional project management tools?",
    answer:
      "AI-Flow stands out by leveraging artificial intelligence to provide predictive analytics, automated task allocation, and intelligent decision support. Our AI algorithms learn from your team's patterns to offer personalized suggestions and optimize workflows in ways that traditional tools simply can't match.",
  },
  {
    question: "Is AI-Flow suitable for small teams?",
    answer:
      "Absolutely! AI-Flow is designed to scale its AI capabilities to teams of all sizes. Whether you're a startup or a large enterprise, our AI adapts to your team's unique needs, helping you harness the full potential of AI in project management regardless of your team size.",
  },
  {
    question: "What key AI features does AI-Flow offer?",
    answer:
      "AI-Flow offers a range of AI-powered features including predictive project timelines, intelligent resource allocation, automated risk assessment, AI-driven insights for decision-making, and smart collaboration tools that use natural language processing. These AI features work seamlessly to enhance every aspect of your project management.",
  },
  {
    question: "Can AI-Flow handle multiple projects with its AI capabilities?",
    answer:
      "Yes, AI-Flow's artificial intelligence is specifically designed to manage and optimize multiple projects concurrently. Our AI provides a holistic view of all your projects, intelligently prioritizing tasks and resources across them to ensure optimal efficiency and performance.",
  },
  {
    question: "Is there a learning curve for new users with the AI features?",
    answer:
      "While AI-Flow is packed with advanced AI features, we've designed it with user-friendliness in mind. The AI assists in the onboarding process, providing personalized guidance and gradually introducing advanced features as users become more comfortable with the system.",
  },
];

const features = [
  {
    title: "AI-Powered Kanban Boards",
    description:
      "Visualize your workflow with AI-optimized Kanban boards that automatically adjust based on your team's performance and project needs.",
    icon: Layout,
  },
  {
    title: "Intelligent Sprint Planning",
    description:
      "Let our AI analyze past sprints and team capacity to suggest optimal sprint plans and task allocations.",
    icon: Calendar,
  },
  {
    title: "Predictive Analytics",
    description:
      "Leverage AI-driven insights and forecasts to make data-informed decisions and anticipate project outcomes.",
    icon: BarChart,
  },
];

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-extrabold ${theme === 'dark' ? 'gradient-title-dark' : 'gradient-title-light'} pb-6 flex flex-col`}>
          Revolutionize Your Workflow <br />
          <span className="flex mx-auto gap-3 sm:gap-4 items-center">
            with
            <span className="flex items-center">
              <Image
                src="/logo3.png"
                alt="HeroicFlow Logo"
                width={400}
                height={80}
                className="h-14 sm:h-24 w-auto object-contain"
              />
              eroicFlow
            </span>
          </span>
        </h1>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-10 max-w-3xl mx-auto`}>
          Empower your team with our AI-driven project management solution.
        </p>
        <p className={`text-xl mb-12 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}></p>
        <Link href="/onboarding">
          <Button size="lg" className={`mr-4 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
            Experience AI-Flow <ChevronRight size={18} className="ml-1" />
          </Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="outline" className={`border-gray-600 text-gray-600 hover:bg-gray-100 ${theme === 'dark' ? 'border-gray-300 text-gray-300 hover:bg-gray-800' : 'border-gray-600 text-gray-600 hover:bg-gray-100'}`}>
            Discover AI Features
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} py-20 px-5`}>
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">AI-Powered Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={theme === 'dark' ? 'bg-gray-700' : 'bg-white'}>
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mb-4 text-blue-500" />
                  <h4 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Carousel */}
      <section className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Trusted by AI-Forward Companies
          </h3>
          <CompanyCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} py-20 px-5`}>
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions About AI-Flow
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Embrace AI-Powered Project Management?
          </h3>
          <p className={`text-xl mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Join innovative teams already using AI-Flow to revolutionize their
            projects and skyrocket productivity with AI.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="animate-bounce">
              Start Your AI Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
