import { motion } from "framer-motion";
import { siteData } from "../config/siteData";

export const StatusBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative inline-flex items-center"
    >
      {/* Ambient glow layer behind the badge */}
      <div className="absolute inset-0 rounded-full bg-sky-400/15 dark:bg-sky-400/20 blur-xl" />

      {/* Badge pill */}
      <div
        className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full
          bg-white/90 dark:bg-neutral-950/80
          border border-sky-300/70 dark:border-sky-400/50
          shadow-md shadow-sky-500/15 dark:shadow-sky-500/25
          backdrop-blur-xl"
      >
        {/* Pulsing status dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
        </span>

        {/* Solid text — high contrast in both modes */}
        <span className="text-sm font-medium tracking-wide text-neutral-800 dark:text-white">
          {siteData.statusMessage}
        </span>
      </div>
    </motion.div>
  );
};
