import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrackSwitcher } from "./TrackSwitcher";

describe("TrackSwitcher", () => {
  it("renders all five tracks", () => {
    render(<TrackSwitcher value="product" onChange={() => {}} />);
    ["产品", "运营", "算法", "市场", "前端"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("fires onChange when a track is clicked", () => {
    const onChange = vi.fn();
    render(<TrackSwitcher value="product" onChange={onChange} />);
    fireEvent.click(screen.getByText("算法"));
    expect(onChange).toHaveBeenCalledWith("algorithm");
  });
});
