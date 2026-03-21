import { useTheme } from "./hooks/useTheme";
import { Background } from "./components/Background";
import { ThemeToggle } from "./components/ThemeToggle";
import { Hero } from "./components/Hero";
import { SocialLinks } from "./components/SocialLinks";
import { ExperienceSection } from "./components/ExperienceSection";
import { StatusBadge } from "./components/StatusBadge";
import { Footer } from "./components/Footer";

const App = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-20 flex flex-col items-center gap-16">
        <Hero />
        <SocialLinks />
        <StatusBadge />
        <ExperienceSection />
        <Footer />
      </main>
    </div>
  );
};

export default App;
