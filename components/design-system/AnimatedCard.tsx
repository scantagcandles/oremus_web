import React from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  hover = true,
  onClick,
  animate = true,
}) => {
  const animation = animate
    ? {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
        },
      }
    : {};

  const hoverAnimation = hover
    ? {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <motion.div
      {...animation}
      {...hoverAnimation}
      className={className}
      onClick={onClick}
    >
      <GlassCard>{children}</GlassCard>
    </motion.div>
  );
};

export default AnimatedCard;
