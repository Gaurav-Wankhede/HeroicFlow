"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { LinkedinIcon, GithubIcon, InstagramIcon, MailIcon } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    icon: LinkedinIcon,
    href: "https://www.linkedin.com/in/wankhede-gaurav/",
    label: "LinkedIn",
  },
  {
    icon: GithubIcon,
    href: "https://github.com/Gaurav-Wankhede",
    label: "GitHub",
  },
  {
    icon: InstagramIcon,
    href: "https://www.instagram.com/_gaurav_wankhede_/",
    label: "Instagram",
  },
  {
    icon: MailIcon,
    href: "mailto:gauravanilwankhede2002@gmail.com",
    label: "Email",
  },
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/Onboarding", label: "Dashboard" },
  { href: "/project/create", label: "Create Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} py-12`}>
      <motion.div
        className="container mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">About Me</h3>
            <p className="text-sm leading-relaxed opacity-80">
              HeroicFlow is an AI-powered project management platform designed to
              revolutionize team collaboration and workflow efficiency. Our
              innovative solution leverages cutting-edge AI technology to streamline
              project processes and deliver data-driven insights for optimal results.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Connect With Me</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${
                    theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  } transition-colors`}
                >
                  <social.icon className="w-6 h-6 md:w-8 md:h-8" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-700/50 text-center"
        >
          <p className="text-sm opacity-80">
          &copy; 2024 - {new Date().getFullYear()}{" "}
            <Link
              href="/"
              className={`${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              } transition-colors`}
            >
              Gaurav Wankhede
            </Link>
            . All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}