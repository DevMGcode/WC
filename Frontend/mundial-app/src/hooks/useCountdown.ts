'use client';
import { useState, useEffect } from 'react';
import { WORLD_CUP_START, MS } from '@/constants/tournament';

export interface CountdownTime { days: number; hours: number; minutes: number; seconds: number; }

export function useCountdown(): { countdown: CountdownTime; started: boolean } {
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const target = WORLD_CUP_START.getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setStarted(true); return; }
      setCountdown({
        days:    Math.floor(diff / MS.day),
        hours:   Math.floor((diff % MS.day)    / MS.hour),
        minutes: Math.floor((diff % MS.hour)   / MS.minute),
        seconds: Math.floor((diff % MS.minute) / MS.second),
      });
    };
    tick();
    const id = setInterval(tick, MS.second);
    return () => clearInterval(id);
  }, []);

  return { countdown, started };
}
