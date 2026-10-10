import React, { useMemo } from "react";
import { reviews as allReviews } from "../../data/custom-ink-reviews";
import { TestimonialsColumn } from "../ui/testimonials-columns-1";

export interface FeedbackWallProps {
  className?: string;
}

export const FeedbackWall: React.FC<FeedbackWallProps> = ({ className = "" }) => {
  // Deterministic 3-way distribution for desktop (all 377 reviews preserved)
  const col1_3 = useMemo(() => allReviews.filter((_, i) => i % 3 === 0), []);
  const col2_3 = useMemo(() => allReviews.filter((_, i) => i % 3 === 1), []);
  const col3_3 = useMemo(() => allReviews.filter((_, i) => i % 3 === 2), []);

  // Deterministic 2-way distribution for tablet (all 377 reviews preserved)
  const col1_2 = useMemo(() => allReviews.filter((_, i) => i % 2 === 0), []);
  const col2_2 = useMemo(() => allReviews.filter((_, i) => i % 2 === 1), []);

  return (
    <section
      id="feedback-wall"
      aria-label="Feedback wall — continuous client reviews"
      className={`relative w-full py-20 bg-[#0E0E0E] text-[#F5F2EA] border-t border-white/[0.08] ${className}`}
    >
      <div className="max-w-[1340px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-[#121212] bg-[#D6A84F] px-3 py-1 mb-5">
              FEEDBACK WALL
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-[#F5F2EA] leading-[1.05] m-0">
              THE WALL NEVER STOPS.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[#BFB9AD] max-w-xl">
              Real experiences from the people who have sat in the chair, trusted the artists,
              and walked out with something they wanted to keep. Every single review received,
              moving continuously upward — unedited.
            </p>
          </div>

          {/* Refined Trust Badge */}
          <div className="flex items-center gap-4 border border-white/[0.12] bg-[#161616] px-5 py-3.5 rounded-lg shadow-lg self-start lg:self-auto">
            <span className="font-mono text-2xl font-bold text-[#F5F2EA] leading-none">
              4.9
            </span>
            <div className="flex flex-col">
              <span className="text-[#D6A84F] text-xs tracking-wider" aria-label="5 stars">
                ★★★★★
              </span>
              <span className="font-mono text-[11px] font-semibold tracking-wider text-[#A5A096] uppercase mt-0.5">
                377 Google Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Layer 1 — Fixed Review Viewport (overflow: hidden, no manual scroll, no scrollbars) */}
        <div
          className="review-wall-viewport relative w-full overflow-hidden pointer-events-none select-none"
          style={{
            height: "min(760px, 70vh)",
            overflow: "hidden",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          {/* Desktop Layout: 3 Columns — ALL THREE MOVE UPWARD (52s, 61s, 57s) */}
          <div className="hidden lg:grid grid-cols-3 gap-6 h-full">
            <TestimonialsColumn
              testimonials={col1_3}
              duration={52}
              direction="up"
              className="h-full"
            />
            <TestimonialsColumn
              testimonials={col2_3}
              duration={61}
              direction="up"
              className="h-full"
            />
            <TestimonialsColumn
              testimonials={col3_3}
              duration={57}
              direction="up"
              className="h-full"
            />
          </div>

          {/* Tablet Layout: 2 Columns — BOTH MOVE UPWARD (54s, 62s) */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 h-full">
            <TestimonialsColumn
              testimonials={col1_2}
              duration={54}
              direction="up"
              className="h-full"
            />
            <TestimonialsColumn
              testimonials={col2_2}
              duration={62}
              direction="up"
              className="h-full"
            />
          </div>

          {/* Mobile Layout: 1 Column — MOVES UPWARD (72s) */}
          <div className="grid md:hidden grid-cols-1 gap-6 h-full">
            <TestimonialsColumn
              testimonials={allReviews}
              duration={72}
              direction="up"
              className="h-full"
            />
          </div>
        </div>

        {/* Bottom Note */}
        <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-[#8E887E]">
          <span className="inline-block w-8 h-[2px] bg-[#D6A84F] align-middle mr-3"></span>
          ⭐ 4.9 / 5 — all 377 verified Google reviews
          <span className="inline-block w-8 h-[2px] bg-[#D6A84F] align-middle ml-3"></span>
        </p>
      </div>
    </section>
  );
};

export default FeedbackWall;
