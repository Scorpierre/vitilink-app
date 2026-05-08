import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { toast } from './toast';

describe('toast store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Drain any existing toasts
    const existing = get(toast);
    existing.forEach((t) => toast.remove(t.id));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start empty', () => {
    expect(get(toast)).toHaveLength(0);
  });

  it('should add a success toast', () => {
    toast.success('Opération réussie');
    const toasts = get(toast);
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Opération réussie');
    expect(toasts[0].type).toBe('success');
  });

  it('should add an error toast', () => {
    toast.error('Une erreur est survenue');
    const toasts = get(toast);
    expect(toasts[0].type).toBe('error');
  });

  it('should add an info toast', () => {
    toast.info('Information');
    const toasts = get(toast);
    expect(toasts[0].type).toBe('info');
  });

  it('should remove toast manually with remove()', () => {
    toast.success('Test');
    const id = get(toast)[0].id;
    toast.remove(id);
    expect(get(toast)).toHaveLength(0);
  });

  it('should auto-remove toast after default duration (3500ms)', () => {
    toast.success('Auto-remove');
    expect(get(toast)).toHaveLength(1);

    vi.advanceTimersByTime(3500);
    expect(get(toast)).toHaveLength(0);
  });

  it('should auto-remove toast after custom duration', () => {
    toast.success('Quick', 1000);
    expect(get(toast)).toHaveLength(1);

    vi.advanceTimersByTime(999);
    expect(get(toast)).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(get(toast)).toHaveLength(0);
  });

  it('should assign unique ids to multiple toasts', () => {
    toast.success('A');
    toast.error('B');
    const toasts = get(toast);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });
});
