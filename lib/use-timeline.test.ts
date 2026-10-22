import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stepAt, useTimeline } from "./use-timeline";

const STEPS = [{ at: 0 }, { at: 500 }];

describe("stepAt", () => {
  it("returns the last step whose time has elapsed", () => {
    expect(stepAt(0, STEPS)).toBe(0);
    expect(stepAt(499, STEPS)).toBe(0);
    expect(stepAt(500, STEPS)).toBe(1);
    expect(stepAt(99999, STEPS)).toBe(1);
  });
});

function mockMatchMedia(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

/** An IntersectionObserver whose callback the test drives with a visible ratio. */
class FakeObserver {
  static last: FakeObserver | null = null;
  constructor(private readonly cb: IntersectionObserverCallback) {
    FakeObserver.last = this;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  show(ratio: number) {
    const entry = { isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry;
    this.cb([entry], this as unknown as IntersectionObserver);
  }
  /** Several queued entries in one callback, oldest first. */
  showAll(ratios: number[]) {
    const entries = ratios.map(
      (ratio) => ({ isIntersecting: ratio > 0, intersectionRatio: ratio }) as IntersectionObserverEntry,
    );
    this.cb(entries, this as unknown as IntersectionObserver);
  }
}

function renderTimeline(steps = STEPS, opts?: { loop?: boolean; loopPause?: number }) {
  return renderHook(() => {
    const t = useTimeline(steps, opts);
    // Attach the ref to a real element, as a component would.
    if (!t.ref.current) t.ref.current = document.createElement("div");
    return t;
  });
}

describe("useTimeline", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance", "Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    FakeObserver.last = null;
  });

  it("shows the final step and schedules nothing under reduced motion", () => {
    mockMatchMedia(true);
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { result } = renderTimeline();
    expect(result.current.step).toBe(STEPS.length - 1);
    expect(vi.getTimerCount()).toBe(0);
    expect(FakeObserver.last).toBeNull();
  });

  it("waits off-screen at step 0, plays when visible, pauses when hidden and loops", () => {
    mockMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { result } = renderTimeline(STEPS, { loopPause: 1000 });
    const io = FakeObserver.last!;

    act(() => io.show(0));
    expect(result.current.step).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    act(() => io.show(0.5));
    act(() => vi.advanceTimersByTime(499));
    expect(result.current.step).toBe(0);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.step).toBe(1);

    // Off-screen: frozen, no timers.
    act(() => io.show(0));
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.step).toBe(1);

    // Back on screen: the final step holds for loopPause, then it starts over.
    act(() => io.show(0.5));
    act(() => vi.advanceTimersByTime(999));
    expect(result.current.step).toBe(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.step).toBe(0);
  });

  it("stops on the final step when loop is false", () => {
    mockMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { result } = renderTimeline(STEPS, { loop: false });
    act(() => FakeObserver.last!.show(1));
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.step).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("acts on the newest entry when the observer queues several", () => {
    mockMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { result } = renderTimeline(STEPS, { loopPause: 1000 });
    const io = FakeObserver.last!;
    act(() => io.show(0));
    // Scrolled past quickly: visible, then gone, delivered together.
    act(() => io.showAll([0.5, 0]));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.step).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("jumps to restart.at on each new key and plays on from there once visible", () => {
    mockMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const steps = [{ at: 0 }, { at: 1000 }, { at: 2000 }];
    type Props = { restart?: { key: number; at: number } };
    const { result, rerender } = renderHook(
      ({ restart }: Props) => {
        const t = useTimeline(steps, { loopPause: 1000, restart });
        if (!t.ref.current) t.ref.current = document.createElement("div");
        return t;
      },
      { initialProps: {} as Props },
    );
    const io = FakeObserver.last!;
    act(() => io.show(0));

    // Off-screen: it jumps, then waits.
    rerender({ restart: { key: 1, at: 1000 } });
    expect(result.current.step).toBe(1);
    expect(vi.getTimerCount()).toBe(0);

    act(() => io.show(0.5));
    act(() => vi.advanceTimersByTime(999));
    expect(result.current.step).toBe(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.step).toBe(2);

    // The same key again changes nothing; a new key jumps again.
    rerender({ restart: { key: 1, at: 1000 } });
    expect(result.current.step).toBe(2);
    rerender({ restart: { key: 2, at: 0 } });
    expect(result.current.step).toBe(0);
  });
});
