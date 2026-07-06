import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>提交</Button>);
    expect(screen.getByText("提交")).toBeInTheDocument();
  });
  it("is disabled when loading", () => {
    render(<Button loading>保存</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
