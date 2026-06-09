'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }

type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT'

const movingMap: Record<Direction, string> = {
  TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  BOTTOM:
    'radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  RIGHT:
    'radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
}

const highlight =
  'radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)'

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Element = 'button',
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType
    containerClassName?: string
    className?: string
    duration?: number
    clockwise?: boolean
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [direction, setDirection] = useState<Direction>('BOTTOM')

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT']
    const currentIndex = directions.indexOf(currentDirection)
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length
    return directions[nextIndex]
  }

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState))
      }, duration * 1000)
      return () => clearInterval(interval)
    }
  }, [hovered, duration, clockwise])

  return (
    <Element
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex h-min w-fit flex-col flex-nowrap content-center items-center justify-center gap-10 overflow-visible rounded-full border bg-black/40 box-decoration-clone p-px backdrop-blur-sm transition duration-500 hover:bg-black/60 dark:bg-white/20',
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          'z-10 w-auto rounded-[inherit] px-4 py-2 text-white',
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          'absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]'
        )}
        style={{
          filter: 'blur(2px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: 'linear', duration: duration ?? 1 }}
      />
      {/* 
        Instead of a solid bg-black that ruins the Shifty Liquid Glass effect,
        we use the same liquid glass surface tokens here.
      */}
      <div 
        className='absolute inset-0.5 z-1 flex-none rounded-[inherit]' 
        style={{
          background: "rgba(11, 11, 18, 0.96)",
          backdropFilter: "url(#shift-liquid-warp) blur(24px) saturate(160%)",
          WebkitBackdropFilter: "url(#shift-liquid-warp) blur(24px) saturate(160%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 24px 60px -22px rgba(0,0,0,0.75), 0 4px 14px -6px rgba(0,0,0,0.5)"
        }}
      />
    </Element>
  )
}
