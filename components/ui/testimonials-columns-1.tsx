"use client";
import React from "react";
import { motion } from "motion/react";

export interface Testimonial {
  text: string;
  image?: string;
  name: string;
  role?: string;
  id?: string;
  rating?: number;
  date?: string;
  source?: string;
}

// Typing hook so `typeof testimonials` resolves accurately in strict TypeScript
declare const testimonials: Testimonial[];

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
  direction?: "up" | "down";
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map((t, i) => {
                const name = (t.name || "Google reviewer").trim() || "Google reviewer";
                const text = (t.text || "").trim();
                const initial = (name.replace(/[^a-zA-Z0-9]/g, "").charAt(0) || "G").toUpperCase();
                const rating = typeof t.rating === "number" ? t.rating : 5;
                const source = (t.source || "Google").trim();

                return (
                  <div
                    className="p-6 md:p-8 rounded-2xl border border-white/10 bg-[#141414] text-[#F5F2EA] shadow-lg max-w-sm w-full"
                    key={t.id ? `${t.id}-${index}-${i}` : `${index}-${i}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[#D6A84F] text-xs tracking-wider" aria-label={`${rating} stars`}>
                        ★★★★★
                      </span>
                      <span className="font-mono text-[9px] font-bold tracking-widest text-[#A5A096] uppercase">
                        {source} Review
                      </span>
                    </div>

                    {text ? (
                      <blockquote className="text-[13.5px] leading-relaxed text-[#DCD7CD] m-0">
                        “{text}”
                      </blockquote>
                    ) : (
                      <p className="text-[11px] font-mono tracking-wider uppercase text-[#D6A84F] m-0 flex items-center gap-2">
                        <span aria-hidden="true">★★★★★</span> 5-star rating on Google
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10">
                      {t.image ? (
                        <img
                          width={36}
                          height={36}
                          src={t.image}
                          alt={name}
                          className="h-9 w-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#202020] text-[#D6A84F] border border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {initial}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <cite className="not-italic font-bold text-[13px] text-[#F5F2EA] leading-tight truncate">
                          {name}
                        </cite>
                        {t.date ? (
                          <span className="text-[10px] font-mono uppercase text-[#8E887E] tracking-wider mt-0.5">
                            {t.date}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

export default TestimonialsColumn;
