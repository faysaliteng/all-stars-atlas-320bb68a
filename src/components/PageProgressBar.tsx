import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

const PageProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const springProgress = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(p);
      springProgress.set(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [springProgress]);

  if (progress < 1) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px]"
      style={{
        scaleX: springProgress.get() / 100,
        transformOrigin: "left",
        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)))",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
};

export default PageProgressBar;
