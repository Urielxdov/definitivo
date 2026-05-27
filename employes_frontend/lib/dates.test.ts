import { toRFC3339, toInputDate } from './dates';

describe('toRFC3339', () => {
  it('appends T00:00:00Z to a date string', () => {
    expect(toRFC3339('2024-01-15')).toBe('2024-01-15T00:00:00Z');
  });

  it('returns empty string for empty input', () => {
    expect(toRFC3339('')).toBe('');
  });
});

describe('toInputDate', () => {
  it('extracts YYYY-MM-DD from an RFC3339 string', () => {
    expect(toInputDate('2024-01-15T00:00:00Z')).toBe('2024-01-15');
  });

  it('returns empty string for empty input', () => {
    expect(toInputDate('')).toBe('');
  });
});
