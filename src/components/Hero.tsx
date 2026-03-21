import { motion } from "framer-motion";
import { siteData } from "../config/siteData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const Hero = () => {
  return (
    <motion.div
      className="flex flex-col items-center text-center gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-1">
        <span
          className="inline-block text-xs font-medium tracking-widest uppercase
            dark:text-violet-400/70 text-violet-600/70"
        >
          Portfolio
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="font-display text-[2rem] font-bold sm:text-6xl md:text-7xl leading-[1.08] tracking-tight whitespace-nowrap"
      >
        <span
          style={{
            backgroundImage: "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {siteData.name}
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="font-body text-lg sm:text-xl font-medium tracking-wide
          dark:text-white/50 text-neutral-500"
      >
        {siteData.title}
      </motion.p>

      {siteData.tagline && (
        <motion.p
          variants={itemVariants}
          className="font-body mt-1 max-w-sm text-base sm:text-lg
            dark:text-white/35 text-neutral-400"
        >
          {siteData.tagline}
        </motion.p>
      )}

      {/* Decorative line */}
      <motion.div
        variants={itemVariants}
        className="mt-2 h-px w-16 rounded-full
          dark:bg-white/15 bg-neutral-300"
      />
    </motion.div>
  );
};
