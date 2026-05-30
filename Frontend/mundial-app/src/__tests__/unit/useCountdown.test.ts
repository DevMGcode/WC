/**
 * Tests para useCountdown — verifica que el countdown calcula
 * correctamente días/horas/minutos/segundos y detecta que el
 * torneo ya empezó.
 */

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/es'),
}));

import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';
import { WORLD_CUP_START } from '@/constants/tournament';

const WORLD_CUP_MS = WORLD_CUP_START.getTime();

describe('useCountdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('retorna started=true si ya pasó la fecha del torneo', () => {
    // Simular que ya pasó 1 día después del inicio
    jest.setSystemTime(WORLD_CUP_MS + 24 * 60 * 60 * 1000);
    const { result } = renderHook(() => useCountdown());
    expect(result.current.started).toBe(true);
  });

  it('retorna started=false si el torneo es en el futuro', () => {
    jest.setSystemTime(WORLD_CUP_MS - 10 * 24 * 60 * 60 * 1000); // 10 días antes
    const { result } = renderHook(() => useCountdown());
    expect(result.current.started).toBe(false);
  });

  it('calcula días correctamente con 10 días restantes', () => {
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    jest.setSystemTime(WORLD_CUP_MS - tenDaysMs);
    const { result } = renderHook(() => useCountdown());
    expect(result.current.countdown.days).toBe(10);
  });

  it('el contador avanza 1 segundo con setInterval', () => {
    // 1 hora y 30 segundos antes del inicio
    const startMs = WORLD_CUP_MS - (3600 * 1000 + 30 * 1000);
    jest.setSystemTime(startMs);
    const { result } = renderHook(() => useCountdown());

    const secondsBefore = result.current.countdown.seconds;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const secondsAfter = result.current.countdown.seconds;
    // El contador decreció 1 segundo (o reinició a 59 si era 0)
    const decreased = secondsAfter === secondsBefore - 1 || (secondsBefore === 0 && secondsAfter === 59);
    expect(decreased).toBe(true);
  });

  it('estructura del countdown tiene las 4 propiedades', () => {
    jest.setSystemTime(WORLD_CUP_MS - 5000);
    const { result } = renderHook(() => useCountdown());
    const { countdown } = result.current;
    expect(typeof countdown.days).toBe('number');
    expect(typeof countdown.hours).toBe('number');
    expect(typeof countdown.minutes).toBe('number');
    expect(typeof countdown.seconds).toBe('number');
  });
});
