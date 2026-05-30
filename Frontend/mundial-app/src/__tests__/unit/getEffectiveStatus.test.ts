import { getEffectiveStatus } from '@/app/[locale]/fixtures/_components/MatchCard';

const NOW = new Date('2026-06-15T12:00:00Z').getTime();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getEffectiveStatus', () => {
  it('returns LIVE when backend status is LIVE', () => {
    expect(getEffectiveStatus({ status: 'LIVE', kickoffAt: '2026-06-15T10:00:00Z' })).toBe('LIVE');
  });

  it('returns FINISHED when backend status is FINISHED', () => {
    expect(getEffectiveStatus({ status: 'FINISHED', kickoffAt: '2026-06-15T10:00:00Z' })).toBe('FINISHED');
  });

  it('returns LIVE when kickoff just started (overrides SCHEDULED)', () => {
    // kickoff 30 min ago → within 120min window
    const kickoffAt = new Date(NOW - 30 * 60 * 1000).toISOString();
    expect(getEffectiveStatus({ status: 'SCHEDULED', kickoffAt })).toBe('LIVE');
  });

  it('returns FINISHED when kickoff was > 120 min ago (overrides SCHEDULED)', () => {
    // kickoff 130 min ago → past 120min window
    const kickoffAt = new Date(NOW - 130 * 60 * 1000).toISOString();
    expect(getEffectiveStatus({ status: 'SCHEDULED', kickoffAt })).toBe('FINISHED');
  });

  it('returns SCHEDULED for future kickoff', () => {
    const kickoffAt = new Date(NOW + 60 * 60 * 1000).toISOString();
    expect(getEffectiveStatus({ status: 'SCHEDULED', kickoffAt })).toBe('SCHEDULED');
  });

  it('accepts Date objects for kickoffAt', () => {
    const kickoffAt = new Date(NOW - 30 * 60 * 1000);
    expect(getEffectiveStatus({ status: 'SCHEDULED', kickoffAt })).toBe('LIVE');
  });

  it('returns POSTPONED as-is', () => {
    expect(getEffectiveStatus({ status: 'POSTPONED', kickoffAt: '2026-06-15T10:00:00Z' })).toBe('POSTPONED');
  });
});
