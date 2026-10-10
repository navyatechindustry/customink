import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Sun, Moon, Star } from 'lucide-react';

// --- Types ---
export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
  rating?: number;
}

// --- Data (Real Custom Ink Reviews, Aresa removed as requested) ---
export const testimonials: Testimonial[] = [
  {
    text: "Got my full back piece done at Custom Ink in Remerschen—a black and white dragon with colorful backgrounds and details—and honestly, I couldn't be happier with how it turned out.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Yvelta",
    role: "Google Review · a year ago",
    rating: 5,
  },
  {
    text: "I just love this place!! Very nice owners and amazing tattoos! So many good tattooers!!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Maria Casquinho",
    role: "Google Review · 4 months ago",
    rating: 5,
  },
  {
    text: "Very good service! Loved loved the end product and the artist was awesome too. Highly recommend!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Joel Oseiga",
    role: "Local Guide · 7 months ago",
    rating: 5,
  },
  {
    text: "Highly professional and friendly staff that uses empathy, art and much understanding to make sure you have your perfect tattoo. The studio is clean, comfortable.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Pascale Barthel",
    role: "Local Guide · a year ago",
    rating: 5,
  },
  {
    text: "Very professional and clean place! The place is super nicely decorated. The manager is very lovely and takes their time for their clients. The tattoo artists are super nice and work very precisely.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Tawxic Nea",
    role: "Local Guide · 2 years ago",
    rating: 5,
  },
  {
    text: "First time at this shop for me. All I can say is that they are really friendly and helpful. For myself it's one of the best tattoos I've ever got. She did an amazing job and I will definitely be back!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Schwartz Bob",
    role: "Google Review · 4 years ago",
    rating: 5,
  },
  {
    text: "TOP! I have been there twice for a piercing and felt very good. Made an appointment for a tattoo and it was great. Super nice team, very friendly and warm welcome.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Lisa Kler",
    role: "Google Review · 4 years ago",
    rating: 5,
  },
  {
    text: "I drove 2 hours to get my work done here and without a doubt superb experience! Couldn't ask for a more professional and clean experience.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Amber Cortez",
    role: "Google Review · 7 years ago",
    rating: 5,
  },
  {
    text: "Awesome tattoo studio with an interesting concept giving us the opportunity to meet foreign artists thanks to their permanent guest rotation. Friendly and caring staff, coffee and food served at will.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    name: "Vincent Bizeul",
    role: "Local Guide · 3 years ago",
    rating: 5,
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role, rating = 5 }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.08)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.08)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-black/5 max-w-xs w-full bg-white dark:bg-neutral-900 transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-amber-500/40" 
                >
                  <blockquote className="m-0 p-0">
                    <div className="flex items-center gap-1 mb-3 text-amber-500" aria-label={`${rating} stars`}>
                      {[...Array(rating)].map((_, s) => (
                        <Star key={s} size={14} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal text-sm m-0 transition-colors duration-300">
                      “{text}”
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400/40 dark:ring-amber-400/30 group-hover:ring-amber-500 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-neutral-900 dark:text-white transition-colors duration-300 text-sm">
                          {name}
                        </cite>
                        <span className="text-xs leading-4 tracking-tight text-neutral-500 dark:text-neutral-400 mt-0.5 transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section 
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-24 relative overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[580px] mx-auto mb-16 text-center">
          <div className="flex justify-center">
            <div className="border border-neutral-300 dark:border-neutral-700 py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-800/70 transition-colors">
              Feedback Wall
            </div>
          </div>

          <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-neutral-900 dark:text-white transition-colors">
            What our clients say
          </h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed max-w-md transition-colors">
            Real experiences from people wearing Custom Ink tattoos & piercings in Luxembourg — unedited and verified.
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={16} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={21} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={18} />
        </div>
      </motion.div>
    </section>
  );
};

// --- Main App / Export Component ---
export default function TestimonialComponent() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300 flex flex-col justify-center relative selection:bg-amber-500 selection:text-white">
      {/* Dark Mode Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-xl hover:scale-110 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        aria-label="Toggle Dark Mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <TestimonialsSection />
    </div>
  );
}
