import { ENV_MODE } from '../constants/mode';
import { LocalApiProperty } from './local-api-property.decorator';

describe('ENV_MODE', () => {
  it('should have LOCAL value', () => {
    expect(ENV_MODE.LOCAL).toBe('LOCAL');
  });

  it('should have INTEGRATED value', () => {
    expect(ENV_MODE.INTEGRATED).toBe('INTEGRATED');
  });

  it('should be readonly (as const)', () => {
    const mode: { readonly LOCAL: 'LOCAL'; readonly INTEGRATED: 'INTEGRATED' } =
      ENV_MODE;
    expect(mode).toBeDefined();
  });
});

describe('LocalApiProperty', () => {
  it('should be a function', () => {
    expect(typeof LocalApiProperty).toBe('function');
  });

  it('should return a decorator function', () => {
    const decorator = LocalApiProperty({ type: String, example: 'test' });
    expect(typeof decorator).toBe('function');
  });

  it('should accept ApiProperty options parameter', () => {
    expect(() =>
      LocalApiProperty({
        type: String,
        example: '6a1d94ca-9575-4c30-ad29-f38b7f62a89a',
      }),
    ).not.toThrow();
  });
});
