import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, Instagram, Check } from "lucide-react";
import type { ReactNode } from "react";
import { siteData } from "../config/siteData";

interface SocialItem {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const sharedButtonClass =
  "group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
  "dark:bg-white/[0.07] dark:backdrop-blur-xl dark:border dark:border-white/[0.1] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.13] dark:hover:border-white/[0.2] " +
  "bg-white/55 backdrop-blur-xl border border-white/75 text-neutral-600 hover:text-neutral-900 hover:bg-white/80 hover:border-white " +
  "shadow-md dark:shadow-black/20 shadow-black/[0.05] " +
  "dark:hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:shadow-[0_4px_20px_rgba(56,189,248,0.15)]";

const copiedButtonClass =
  "group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
  "dark:bg-emerald-500/20 dark:backdrop-blur-xl dark:border dark:border-emerald-400/40 dark:text-emerald-400 " +
  "bg-emerald-50/80 backdrop-blur-xl border border-emerald-300/60 text-emerald-600 " +
  "shadow-md shadow-emerald-500/10";

export const SocialLinks = () => {
  const { socials } = siteData;
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!socials.email) return;
    navigator.clipboard.writeText(socials.email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const regularSocials: SocialItem[] = [
    {
      key: "github",
      href: socials.github,
      icon: <Github size={18} />,
      label: "GitHub",
    },
    {
      key: "linkedin",
      href: socials.linkedin,
      icon: <Linkedin size={18} />,
      label: "LinkedIn",
    },
    {
      key: "instagram",
      href: socials.instagram,
      icon: <Instagram size={18} />,
      label: "Instagram",
    },
  ].filter((s) => s.href !== "");

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {regularSocials.map((social) => (
        <motion.a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          variants={itemVariants}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={sharedButtonClass}
        >
          <span className="transition-colors duration-200">{social.icon}</span>
          <span>{social.label}</span>
        </motion.a>
      ))}

      {socials.email && (
        <motion.button
          variants={itemVariants}
          whileHover={!emailCopied ? { scale: 1.1, y: -2 } : undefined}
          whileTap={{ scale: 0.95 }}
          onClick={handleEmailClick}
          aria-label="Copy email address"
          className={emailCopied ? copiedButtonClass : sharedButtonClass}
        >
          <AnimatePresence mode="wait" initial={false}>
            {emailCopied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Check size={18} />
                <span>Copied!</span>
              </motion.span>
            ) : (
              <motion.span
                key="mail"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Mail size={18} />
                <span>Email</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </motion.div>
  );
};
