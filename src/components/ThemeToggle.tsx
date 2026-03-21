import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <div className="fixed top-5 right-5 z-50">
      <motion.button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors
          dark:bg-white/[0.08] dark:backdrop-blur-xl dark:border dark:border-white/[0.12] dark:text-white/80 dark:hover:bg-white/[0.14] dark:hover:text-white
          bg-white/60 backdrop-blur-xl border border-white/80 text-neutral-700 hover:bg-white/80 hover:text-neutral-900
          shadow-lg dark:shadow-black/20 shadow-black/[0.06]"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={15} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -30, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={15} />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{theme === "dark" ? "Dark" : "Light"}</span>
      </motion.button>
    </div>
  );
};
