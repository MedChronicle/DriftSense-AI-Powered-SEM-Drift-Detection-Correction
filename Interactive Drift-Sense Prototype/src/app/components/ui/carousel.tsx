"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type AutoplayOptions = {
  /** Delay between slides in ms (default 4000) */
  interval?: number;
  /** Pause while hovered or focused (default true) */
  pauseOnInteraction?: boolean;
};

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  /** Pass true for defaults, or an options object */
  autoplay?: boolean | AutoplayOptions;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
  scrollProgress: number; // 0..1
} & Omit<CarouselProps, "autoplay">;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  autoplay = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onInit = React.useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
    },
    [onSelect],
  );

  const onScroll = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setScrollProgress(Math.max(0, Math.min(1, api.scrollProgress())));
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);
  const scrollTo = React.useCallback((i: number) => api?.scrollTo(i), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      if (event.key === prevKey) {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === nextKey) {
        event.preventDefault();
        scrollNext();
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        scrollTo(scrollSnaps.length - 1);
      }
    },
    [orientation, scrollPrev, scrollNext, scrollTo, scrollSnaps.length],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onInit(api);
    onScroll(api);
    api.on("reInit", onInit).on("reInit", onScroll);
    api.on("select", onSelect);
    api.on("scroll", onScroll);

    return () => {
      api.off("reInit", onInit);
      api.off("reInit", onScroll);
      api.off("select", onSelect);
      api.off("scroll", onScroll);
    };
  }, [api, onInit, onSelect, onScroll]);

  // Autoplay
  const autoplayEnabled = !!autoplay;
  const interval =
    typeof autoplay === "object" ? (autoplay.interval ?? 4000) : 4000;
  const pauseOnInteraction =
    typeof autoplay === "object" ? (autoplay.pauseOnInteraction ?? true) : true;

  React.useEffect(() => {
    if (!api || !autoplayEnabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = rootRef.current;
    let paused = false;

    const tick = () => {
      if (paused || document.hidden) return;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    };

    const timer = window.setInterval(tick, interval);
    const pause = () => (paused = true);
    const resume = () => (paused = false);

    if (pauseOnInteraction && root) {
      root.addEventListener("mouseenter", pause);
      root.addEventListener("mouseleave", resume);
      root.addEventListener("focusin", pause);
      root.addEventListener("focusout", resume);
    }
    // Pause while the user is dragging
    api.on("pointerDown", pause);
    api.on("pointerUp", resume);

    return () => {
      window.clearInterval(timer);
      if (root) {
        root.removeEventListener("mouseenter", pause);
        root.removeEventListener("mouseleave", resume);
        root.removeEventListener("focusin", pause);
        root.removeEventListener("focusout", resume);
      }
      api.off("pointerDown", pause);
      api.off("pointerUp", resume);
    };
  }, [api, autoplayEnabled, interval, pauseOnInteraction]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        scrollProgress,
      }}
    >
      <div
        ref={rootRef}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, selectedIndex, scrollSnaps } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      data-total={scrollSnaps.length || undefined}
      data-selected={selectedIndex}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

/** Clickable pagination dots */
function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

  return (
    <div
      role="tablist"
      aria-label="Choose slide"
      data-slot="carousel-dots"
      className={cn("mt-4 flex justify-center gap-2", className)}
      {...props}
    >
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => scrollTo(i)}
          className={cn(
            "h-2 rounded-full transition-all",
            i === selectedIndex
              ? "w-6 bg-primary"
              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
          )}
        />
      ))}
    </div>
  );
}

/** "2 / 5" style counter */
function CarouselCounter({ className, ...props }: React.ComponentProps<"div">) {
  const { selectedIndex, scrollSnaps } = useCarousel();

  return (
    <div
      aria-live="polite"
      data-slot="carousel-counter"
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
      {...props}
    >
      {scrollSnaps.length ? selectedIndex + 1 : 0} / {scrollSnaps.length}
    </div>
  );
}

/** Thin progress bar that follows scroll position */
function CarouselProgress({ className, ...props }: React.ComponentProps<"div">) {
  const { scrollProgress } = useCarousel();

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scrollProgress * 100)}
      data-slot="carousel-progress"
      className={cn("bg-muted mt-4 h-1 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        className="bg-primary h-full transition-[width] duration-150"
        style={{ width: `${scrollProgress * 100}%` }}
      />
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
  CarouselProgress,
  useCarousel,
};
