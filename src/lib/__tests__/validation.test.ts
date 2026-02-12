import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validatePasswordMatch,
  validateNoteTitle,
} from '../validation';

describe('validateName', () => {
  it('accepts valid names', () => {
    expect(validateName('Jo').valid).toBe(true);
    expect(validateName('John Doe').valid).toBe(true);
    expect(validateName('A'.repeat(100)).valid).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    const result = validateName('J');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('at least 2');
  });

  it('rejects names longer than 100 characters', () => {
    const result = validateName('A'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.message).toContain('100');
  });

  it('trims whitespace before validation', () => {
    expect(validateName('  Jo  ').valid).toBe(true);
    expect(validateName('  J  ').valid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('name@domain.org').valid).toBe(true);
  });

  it('rejects empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('required');
  });

  it('rejects email without @', () => {
    expect(validateEmail('userexample.com').valid).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(validateEmail('user@').valid).toBe(false);
  });

  it('rejects email without TLD', () => {
    expect(validateEmail('user@domain').valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts valid password', () => {
    expect(validatePassword('Passw0rd').valid).toBe(true);
    expect(validatePassword('StrongP4ss').valid).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validatePassword('Pas1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8 characters');
  });

  it('rejects password without uppercase', () => {
    const result = validatePassword('password1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('uppercase');
  });

  it('rejects password without lowercase', () => {
    const result = validatePassword('PASSWORD1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('lowercase');
  });

  it('rejects password without number', () => {
    const result = validatePassword('Password');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('number');
  });
});

describe('getPasswordStrength', () => {
  it('returns all flags for strong password', () => {
    const strength = getPasswordStrength('Passw0rd');
    expect(strength.hasMinLength).toBe(true);
    expect(strength.hasUppercase).toBe(true);
    expect(strength.hasLowercase).toBe(true);
    expect(strength.hasNumber).toBe(true);
  });

  it('returns false for missing criteria', () => {
    const strength = getPasswordStrength('short');
    expect(strength.hasMinLength).toBe(false);
    expect(strength.hasUppercase).toBe(false);
    expect(strength.hasNumber).toBe(false);
    expect(strength.hasLowercase).toBe(true);
  });

  it('detects each criterion independently', () => {
    expect(getPasswordStrength('ABCDEFGH').hasUppercase).toBe(true);
    expect(getPasswordStrength('ABCDEFGH').hasLowercase).toBe(false);
    expect(getPasswordStrength('12345678').hasNumber).toBe(true);
    expect(getPasswordStrength('12345678').hasUppercase).toBe(false);
  });
});

describe('validatePasswordMatch', () => {
  it('returns valid when passwords match', () => {
    expect(validatePasswordMatch('password', 'password').valid).toBe(true);
  });

  it('returns invalid when passwords do not match', () => {
    const result = validatePasswordMatch('password', 'different');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('do not match');
  });
});

describe('validateNoteTitle', () => {
  it('accepts valid titles', () => {
    expect(validateNoteTitle('My Note').valid).toBe(true);
    expect(validateNoteTitle('A'.repeat(200)).valid).toBe(true);
  });

  it('rejects empty title', () => {
    const result = validateNoteTitle('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('required');
  });

  it('rejects whitespace-only title', () => {
    expect(validateNoteTitle('   ').valid).toBe(false);
  });

  it('rejects title longer than 200 characters', () => {
    const result = validateNoteTitle('A'.repeat(201));
    expect(result.valid).toBe(false);
    expect(result.message).toContain('200');
  });
});
