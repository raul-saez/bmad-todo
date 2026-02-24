import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export const TodoSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
      <Skeleton
        variant="circular"
        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
      />
      <Skeleton variant="text" className="flex-1 h-4 sm:h-5" />
      <Skeleton
        variant="rectangular"
        className="w-14 sm:w-16 h-6 sm:h-7 flex-shrink-0"
      />
    </div>
  )
}
