'use client';

import 'swiper/css';
import 'swiper/css/a11y';

import type { JobListItem } from '@job-scraper/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { JobCard } from '@/components/jobs/job-card';

const SLIDE_GAP = 12;
const SM_BREAKPOINT = 640;
const LG_BREAKPOINT = 1024;

const BREAKPOINTS = {
  0: { slidesPerView: 1.1 },
  [SM_BREAKPOINT]: { slidesPerView: 2 },
  [LG_BREAKPOINT]: { slidesPerView: 3 },
};

const arrowButton =
  'flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink outline-none transition-colors hover:bg-bg focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-surface';

interface JobsSliderProps {
  jobs: JobListItem[];
}

export function JobsSlider({ jobs }: JobsSliderProps) {
  const slidesId = useId();
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function updateEdges(instance: SwiperInstance) {
    setEdges({ start: instance.isBeginning, end: instance.isEnd });
  }

  return (
    <div className="flex flex-col gap-4">
      <Swiper
        id={slidesId}
        modules={[A11y]}
        spaceBetween={SLIDE_GAP}
        breakpoints={BREAKPOINTS}
        a11y={{
          enabled: true,
          containerRoleDescriptionMessage: 'carousel',
          itemRoleDescriptionMessage: 'slide',
          slideLabelMessage: '{{index}} of {{slidesLength}}',
        }}
        onSwiper={(instance) => {
          setSwiper(instance);
          updateEdges(instance);
        }}
        onProgress={updateEdges}
        className="w-full motion-reduce:[&_.swiper-wrapper]:transition-none!"
      >
        {jobs.map((job) => (
          <SwiperSlide key={job.id} className="h-auto!">
            <JobCard job={job} headingLevel="h3" />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          aria-label="Previous jobs"
          aria-controls={slidesId}
          aria-disabled={edges.start}
          onClick={() => swiper?.slidePrev()}
          className={arrowButton}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Next jobs"
          aria-controls={slidesId}
          aria-disabled={edges.end}
          onClick={() => swiper?.slideNext()}
          className={arrowButton}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
