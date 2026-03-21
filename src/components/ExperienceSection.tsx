import { motion } from "framer-motion";
import { siteData } from "../config/siteData";
import type { ExperienceItem } from "../config/siteData";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

interface ExperienceCardProps {
  item: ExperienceItem;
}

const ExperienceCard = ({ item }: ExperienceCardProps) => {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-6 w-80 shrink-0
        dark:bg-white/[0.06] dark:backdrop-blur-xl dark:border dark:border-white/[0.1]
        bg-white/60 backdrop-blur-xl border border-white/80
        shadow-lg dark:shadow-black/20 shadow-black/[0.06]
        border-l-4 border-l-sky-400/50 dark:border-l-sky-400/50"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-base font-semibold dark:text-white/90 text-neutral-800">
            {item.company}
          </h3>
          <p className="font-body text-sm font-medium bg-gradient-to-r from-sky-400 to-cyan-400 dark:from-sky-400 dark:to-cyan-400 bg-clip-text text-transparent">
            {item.role}
          </p>
        </div>
        <span
          className="font-body shrink-0 text-xs font-medium rounded-full px-3 py-1
            dark:bg-white/[0.07] dark:text-white/40 dark:border dark:border-white/[0.08]
            bg-neutral-100/80 text-neutral-400 border border-neutral-200/60"
        >
          {item.period}
        </span>
      </div>

      <p className="font-body text-sm leading-relaxed dark:text-white/55 text-neutral-500">
        {item.description}
      </p>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="font-body text-xs font-medium rounded-full px-2.5 py-0.5
                dark:bg-white/[0.07] dark:text-white/70 dark:border dark:border-white/[0.1]
                bg-black/[0.05] text-black/60 border border-black/[0.08]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const ExperienceSection = () => {
  const { experience } = siteData;

  if (experience.length === 0) return null;

  // Duplicate 4x so the loop is always seamless regardless of how few items there are
  const items = [
    ...experience,
    ...experience,
    ...experience,
    ...experience,
  ];

  return (
    <motion.section
      className="w-full flex flex-col gap-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {/* Section header */}
      <motion.div variants={headerVariants} className="flex items-center gap-4">
        <h2 className="font-body text-xs font-semibold uppercase tracking-widest dark:text-white/40 text-neutral-400">
          Experience
        </h2>
        <div className="flex-1 h-px dark:bg-white/[0.07] bg-neutral-200/80" />
      </motion.div>

      {/* Carousel — pure CSS marquee, no Framer Motion animation */}
      <motion.div
        variants={headerVariants}
        className="overflow-hidden w-full"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="flex gap-6 animate-marquee"
          style={{ width: "max-content" }}
        >
          {items.map((item, i) => (
            <ExperienceCard key={`${item.company}-${i}`} item={item} />
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};
