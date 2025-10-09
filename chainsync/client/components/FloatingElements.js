import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Diamond, Zap, Heart, Globe } from 'lucide-react';

export default function FloatingElements() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const elements = [
    { icon: Sparkles, color: 'text-yellow-400', delay: 0 },
    { icon: Star, color: 'text-purple-400', delay: 1 },
    { icon: Diamond, color: 'text-blue-400', delay: 2 },
    { icon: Zap, color: 'text-green-400', delay: 3 },
    { icon: Heart, color: 'text-pink-400', delay: 4 },
    { icon: Globe, color: 'text-cyan-400', delay: 5 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.color} opacity-20`}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            scale: 0,
            rotate: 0
          }}
          animate={{
            y: [null, -100, null],
            x: [null, Math.random() * 100 - 50, null],
            scale: [0, 1, 0],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
          style={{
            left: `${10 + (index * 15) % 80}%`,
            top: `${10 + (index * 20) % 70}%`,
          }}
        >
          <element.icon className="w-6 h-6" />
        </motion.div>
      ))}
      
      {/* Additional floating particles */}
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -200, null],
            x: [null, Math.random() * 200 - 100, null],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}