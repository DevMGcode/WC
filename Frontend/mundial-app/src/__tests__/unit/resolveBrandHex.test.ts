import { resolveBrandHex, type BrandColor } from '@/lib/design/tokens';

const ALL_COLORS: BrandColor[] = [
  'green', 'gold', 'danger', 'warning', 'success', 'info', 'neutral',
  'pink', 'teal', 'orange', 'emerald', 'red',
];

describe('resolveBrandHex', () => {
  it('retorna un string hex válido para cada BrandColor', () => {
    ALL_COLORS.forEach(color => {
      const result = resolveBrandHex(color);
      expect(typeof result).toBe('string');
      // Formato #RRGGBB o #RGB
      expect(result).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
    });
  });

  it('cubre los 12 colores del tipo BrandColor', () => {
    expect(ALL_COLORS).toHaveLength(12);
    ALL_COLORS.forEach(color => {
      expect(() => resolveBrandHex(color)).not.toThrow();
    });
  });

  it('green y gold retornan valores distintos', () => {
    expect(resolveBrandHex('green')).not.toBe(resolveBrandHex('gold'));
  });

  it('danger y success retornan valores distintos', () => {
    expect(resolveBrandHex('danger')).not.toBe(resolveBrandHex('success'));
  });
});
