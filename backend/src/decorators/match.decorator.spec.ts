import { MatchConstraint } from './match.decorator';

describe('MatchConstraint', () => {
  let constraint: MatchConstraint;

  beforeEach(() => {
    constraint = new MatchConstraint();
  });

  it('should return true when values match', () => {
    const args = {
      constraints: ['password'],
      object: { password: 'secret123' },
      property: 'passwordConfirm',
    } as any;

    expect(constraint.validate('secret123', args)).toBe(true);
  });

  it('should return false when values do not match', () => {
    const args = {
      constraints: ['password'],
      object: { password: 'secret123' },
      property: 'passwordConfirm',
    } as any;

    expect(constraint.validate('different', args)).toBe(false);
  });

  it('should return a default message with property names', () => {
    const args = {
      constraints: ['password'],
      property: 'passwordConfirm',
    } as any;

    const msg = constraint.defaultMessage(args);
    expect(msg).toContain('passwordConfirm');
    expect(msg).toContain('password');
  });

  it('should return fallback message when validationArguments is undefined', () => {
    expect(constraint.defaultMessage(undefined)).toBe('Invalid validation arguments');
  });
});
