import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors } from '../../utils/designSystem';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  aspectRatio?: number;
  enableBlur?: boolean;
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  placeholder,
  fallback = '/images/placeholder-climb.jpg',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  aspectRatio,
  enableBlur = true,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Create optimized image URL
  const createOptimizedUrl = useCallback((originalUrl: string) => {
    // In a real app, this would create optimized URLs with different sizes
    // For now, we'll just return the original URL
    return originalUrl;
  }, []);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setHasError(true);
    setImageUrl(fallback);
    onError?.();
  }, [fallback, onError]);

  // Intersection Observer setup
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, priority]);

  // Set image URL when intersecting
  useEffect(() => {
    if (isIntersecting && !imageUrl && !hasError) {
      setImageUrl(createOptimizedUrl(src));
    }
  }, [isIntersecting, imageUrl, hasError, src, createOptimizedUrl]);

  // Generate placeholder styles
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[200],
    background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
    minHeight: '120px',
    ...style,
  };

  // Generate image styles
  const imageStyle: React.CSSProperties = {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isLoaded ? 1 : 0,
    filter: enableBlur && !isLoaded ? 'blur(8px)' : 'none',
    transform: isLoaded ? 'scale(1)' : 'scale(1.05)',
    ...style,
  };

  // Loading skeleton
  const renderPlaceholder = () => (
    <div 
      className={`lazy-image-placeholder ${className}`}
      style={placeholderStyle}
      role="img"
      aria-label={`Loading ${alt}`}
    >
      {placeholder ? (
        <img 
          src={placeholder} 
          alt="" 
          className="w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          {/* Climbing-themed loading animation */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full animate-pulse">
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[300]} 0%, ${colors.secondary[300]} 100%)`,
                }}
              />
            </div>
            <div 
              className="absolute inset-0 flex items-center justify-center text-xl animate-bounce"
              style={{ animationDelay: '0.2s' }}
            >
              🧗‍♀️
            </div>
          </div>
          <div 
            className="text-sm font-medium"
            style={{ color: colors.neutral[500] }}
          >
            加载图片中...
          </div>
        </div>
      )}
    </div>
  );

  // Error state
  const renderError = () => (
    <div 
      className={`lazy-image-error ${className}`}
      style={{
        ...placeholderStyle,
        background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
        border: `2px dashed ${colors.neutral[300]}`,
      }}
      role="img"
      aria-label={`Failed to load ${alt}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.error.soft} 0%, ${colors.error.subtle} 100%)`,
          }}
        >
          📷
        </div>
        <div 
          className="text-sm font-medium text-center"
          style={{ color: colors.neutral[600] }}
        >
          图片加载失败
        </div>
      </div>
    </div>
  );

  // Show placeholder until intersecting
  if (!isIntersecting) {
    return renderPlaceholder();
  }

  // Show error state
  if (hasError && !imageUrl) {
    return renderError();
  }

  return (
    <div className={`lazy-image-container ${className}`} style={{ position: 'relative' }}>
      {/* Placeholder shown while image loads */}
      {!isLoaded && renderPlaceholder()}
      
      {/* Actual image */}
      {imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          style={{
            ...imageStyle,
            position: !isLoaded ? 'absolute' : 'static',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'inherit',
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

// Higher-order component for batch lazy loading
interface LazyImageBatchProps {
  images: Array<{
    src: string;
    alt: string;
    aspectRatio?: number;
  }>;
  className?: string;
  onBatchComplete?: () => void;
  maxConcurrent?: number;
}

export const LazyImageBatch: React.FC<LazyImageBatchProps> = ({
  images,
  className = '',
  onBatchComplete,
  maxConcurrent = 3,
}) => {
  const [currentBatch, setCurrentBatch] = useState(0);

  const handleImageLoad = useCallback(() => {
    // Track completion for batch management
    // Could be enhanced to track individual image loading
  }, []);

  // Load images in batches for better performance
  const visibleImages = images.slice(0, (currentBatch + 1) * maxConcurrent);

  useEffect(() => {
    if (onBatchComplete && visibleImages.length === images.length) {
      onBatchComplete();
    }
  }, [visibleImages.length, images.length, onBatchComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visibleImages.length < images.length) {
        setCurrentBatch(prev => prev + 1);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentBatch, images.length, visibleImages.length]);

  return (
    <div className={`lazy-image-batch ${className}`}>
      {visibleImages.map((image, index) => (
        <LazyImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          aspectRatio={image.aspectRatio}
          onLoad={handleImageLoad}
          className="lazy-batch-item"
        />
      ))}
    </div>
  );
};

export default LazyImage; 