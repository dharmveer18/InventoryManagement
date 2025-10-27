import { describe, it, expect } from 'vitest';
import { nk, intOrUndef } from './csv';

describe('csv utils', () => {
  it('nk trims and normalizes', () => {
    expect(nk('  hello  ')).toBe('hello');
    expect(nk(null)).toBe('');
    expect(nk(undefined)).toBe('');
    expect(nk(123)).toBe('123');
  });

  it('intOrUndef parses signed integers and separators', () => {
    expect(intOrUndef('10')).toBe(10);
    expect(intOrUndef('+10')).toBe(10);
    expect(intOrUndef('-5')).toBe(-5);
    expect(intOrUndef(' 1,000 ')).toBe(1000);
    expect(intOrUndef('2,345,678')).toBe(2345678);
  });

  it('intOrUndef rejects decimals and invalid', () => {
    expect(intOrUndef('10.5')).toBeUndefined();
    expect(intOrUndef('abc')).toBeUndefined();
    expect(intOrUndef('1 2')).toBeUndefined();
    expect(intOrUndef('')).toBeUndefined();
    expect(intOrUndef('.')).toBeUndefined();
  });
});
