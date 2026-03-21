import { motion } from "framer-motion";
import { siteData } from "../config/siteData";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="w-full text-center pb-4"
    >
      <p
        className="font-body text-xs dark:text-white/25 text-neutral-400"
      >
        &copy; {year} {siteData.name}
      </p>
    </motion.footer>
  );
};
