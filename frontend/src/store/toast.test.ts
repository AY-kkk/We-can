import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast, useToastStore } from "./toast";

describe("toast store", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useRealTimers();
  });

  it("pushes toasts of each kind", () => {
    act(() => {
      toast.success("ok");
      toast.error("bad");
      toast.info("fyi");
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(3);
    expect(toasts.map((t) => t.kind)).toEqual(["success", "error", "info"]);
  });

  it("dismisses a toast by id", () => {
    act(() => toast.success("hello"));
    const id = useToastStore.getState().toasts[0].id;
    act(() => useToastStore.getState().dismiss(id));
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("auto-dismisses after the timeout", () => {
    vi.useFakeTimers();
    act(() => toast.info("temp"));
    expect(useToastStore.getState().toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(3300));
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
