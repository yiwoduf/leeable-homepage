export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark mode background base */}
      <div className="absolute inset-0 bg-[#0a0a14] hidden dark:block" />
      {/* Light mode background base */}
      <div className="absolute inset-0 bg-[#fdf6f9] block dark:hidden" />

      {/* Dark mode orbs — muted spring colors */}
      <div className="hidden dark:block">
        {/* Orb 1: pink-400 — top left */}
        <div
          className="animate-float-slow absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, #f472b6 0%, #f472b6 30%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Orb 2: emerald-400 — bottom right */}
        <div
          className="animate-float-slower absolute -bottom-40 -right-40 h-[580px] w-[580px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, #34d399 0%, #34d399 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-6s",
          }}
        />
        {/* Orb 3: blue-400 — center right */}
        <div
          className="animate-float-slow absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, #60a5fa 0%, #60a5fa 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-10s",
          }}
        />
        {/* Orb 4: amber-400 — bottom left, smaller */}
        <div
          className="animate-float-slower absolute bottom-20 -left-20 h-[380px] w-[380px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, #fbbf24 0%, #fbbf24 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-14s",
          }}
        />
      </div>

      {/* Light mode orbs — soft pastel spring */}
      <div className="block dark:hidden">
        {/* Orb 1: pink-200 — top left */}
        <div
          className="animate-float-slow absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, #fbcfe8 0%, #fbcfe8 30%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Orb 2: emerald-200 — bottom right */}
        <div
          className="animate-float-slower absolute -bottom-40 -right-40 h-[580px] w-[580px] rounded-full opacity-55"
          style={{
            background:
              "radial-gradient(circle, #a7f3d0 0%, #a7f3d0 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-6s",
          }}
        />
        {/* Orb 3: blue-200 — center right */}
        <div
          className="animate-float-slow absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full opacity-55"
          style={{
            background:
              "radial-gradient(circle, #bfdbfe 0%, #bfdbfe 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-10s",
          }}
        />
        {/* Orb 4: amber-200 — bottom left, smaller */}
        <div
          className="animate-float-slower absolute bottom-20 -left-20 h-[380px] w-[380px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, #fde68a 0%, #fde68a 30%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-14s",
          }}
        />
      </div>
    </div>
  );
};
