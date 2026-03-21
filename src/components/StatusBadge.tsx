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
      <div className="absolute inset-0 rounded-full bg-violet-400/15 dark:bg-violet-400/20 blur-xl" />

      {/* Spinning border wrapper — p-[1.5px] is the border thickness */}
      <div className="relative inline-flex rounded-full p-[1.5px] overflow-hidden
        shadow-md shadow-violet-500/15 dark:shadow-violet-500/25">

        {/* Spinning conic-gradient — comet sweeps around the pill */}
        <div
          className="absolute animate-spin-border aspect-square w-[200%]"
          style={{
            top: "50%",
            left: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0%, #f0abfc 20%, #c084fc 40%, #818cf8 55%, transparent 75%)",
          }}
        />

        {/* Badge pill — background covers the gradient center, leaving just the border edge */}
        <div
          className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full
            bg-white/90 dark:bg-neutral-950/80
            backdrop-blur-xl"
        >
          {/* Pulsing status dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
          </span>

          {/* Solid text — high contrast in both modes */}
          <span className="text-sm font-medium tracking-wide text-neutral-800 dark:text-white">
            {siteData.statusMessage}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
