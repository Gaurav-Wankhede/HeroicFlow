"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { RocketIcon, BrainCircuitIcon, CodeIcon, UsersIcon } from "lucide-react";

const features = [
  {
    icon: RocketIcon,
    title: "AI-Powered Efficiency",
    description: "Our platform leverages cutting-edge AI to automate routine tasks and optimize project workflows.",
  },
  {
    icon: BrainCircuitIcon,
    title: "Intelligent Insights",
    description: "Get data-driven recommendations and predictive analytics to make informed decisions.",
  },
  {
    icon: CodeIcon,
    title: "Modern Technology Stack",
    description: "Built with the latest technologies to ensure scalability, security, and performance.",
  },
  {
    icon: UsersIcon,
    title: "Team Collaboration",
    description: "Enhanced team coordination with AI-assisted communication and task management.",
  },
];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-10">About HeroicFlow</h1>
          <p className="text-xl opacity-80 max-w-3xl mx-auto">
            HeroicFlow is revolutionizing project management with AI-powered
            solutions that enhance team productivity and project success rates.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`p-6 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <feature.icon className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="opacity-80">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            To empower teams with intelligent project management solutions that
            combine human creativity with artificial intelligence, making project
            success not just achievable, but inevitable.
          </p>
        </motion.div>
      </div>
    </div>
  );
}