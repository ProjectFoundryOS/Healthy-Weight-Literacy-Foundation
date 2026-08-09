"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote, Pause, Play } from "lucide-react"

const testimonials = [
  {
    quote:
      "The Family Fit Program transformed how our family thinks about health. My kids now ask for fruits and vegetables, and we've made exercise a fun family activity.",
    author: "Maria R.",
    role: "Parent, Family Fit Program",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face",
  },
  {
    quote:
      "I finally understand nutrition without feeling overwhelmed. The workshops gave me practical tools I use every day to make healthier choices.",
    author: "James T.",
    role: "Nutrition Basics Graduate",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    quote:
      "As a school nurse, partnering with HWLF has been incredible. They bring evidence-based programs that actually work for our diverse student body.",
    author: "Sarah K., RN",
    role: "School Partner",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=200&h=200&fit=crop&crop=face",
  },
]

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [isPaused, next])

  return (
    <div
      className="relative bg-surface rounded-2xl p-8 sm:p-12 shadow-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/10" aria-hidden="true" />

      <div className="relative min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`${current + 1} of ${testimonials.length}`}
          >
            <blockquote className="text-xl sm:text-2xl text-secondary font-medium leading-relaxed max-w-3xl mx-auto">
              &quot;{testimonials[current].quote}&quot;
            </blockquote>
            <div className="mt-8 flex flex-col items-center">
              <Image
                src={testimonials[current].image || "/placeholder.svg"}
                alt={testimonials[current].author}
                width={64}
                height={64}
                className="rounded-full"
              />
              <cite className="mt-4 not-italic">
                <span className="block font-semibold text-secondary">{testimonials[current].author}</span>
                <span className="text-muted-foreground">{testimonials[current].role}</span>
              </cite>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prev} aria-label="Previous testimonial">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Dots */}
        <div className="flex gap-2" role="tablist">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${index === current ? "w-6 bg-primary" : "w-2 bg-muted"}`}
              role="tab"
              aria-selected={index === current}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button variant="outline" size="icon" onClick={next} aria-label="Next testimonial">
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Play carousel" : "Pause carousel"}
        >
          {isPaused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  )
}
