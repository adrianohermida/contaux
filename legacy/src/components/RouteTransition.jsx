import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useResponsiveLayout } from './mobile/useResponsiveLayout';

export default function RouteTransition({ children }) {
  const location = useLocation();
  const { isMobile } = useResponsiveLayout();

  // Mobile-only slide animation; tablet/desktop skip animations
  const slideVariants = useMemo(() => ({
    initial: {
      opacity: isMobile ? 0 : 1,
      x: isMobile ? 100 : 0
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: isMobile ? {
        duration: 0.3,
        ease: 'easeInOut'
      } : {
        duration: 0
      }
    },
    exit: {
      opacity: isMobile ? 0 : 1,
      x: isMobile ? -100 : 0,
      transition: isMobile ? {
        duration: 0.2,
        ease: 'easeInOut'
      } : {
        duration: 0
      }
    }
  }), [isMobile]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="main"
        aria-label="Conteúdo principal da página"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}