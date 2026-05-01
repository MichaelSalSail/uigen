import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeTool(
  toolName: string,
  args: Record<string, string>,
  state: "call" | "result" = "result"
): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName,
    args,
    state,
    result: state === "result" ? "ok" : undefined,
  } as ToolInvocation;
}

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(<ToolCallBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  render(<ToolCallBadge tool={makeTool("str_replace_editor", { command: "str_replace", path: "/src/Button.tsx" })} />);
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  render(<ToolCallBadge tool={makeTool("str_replace_editor", { command: "insert", path: "/src/Card.tsx" })} />);
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Viewing' label for str_replace_editor view command", () => {
  render(<ToolCallBadge tool={makeTool("str_replace_editor", { command: "view", path: "/App.jsx" })} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  render(<ToolCallBadge tool={makeTool("file_manager", { command: "delete", path: "/src/Old.tsx" })} />);
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

test("shows 'Renaming' label for file_manager rename command", () => {
  render(<ToolCallBadge tool={makeTool("file_manager", { command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" })} />);
  expect(screen.getByText("Renaming Old.tsx to New.tsx")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  render(<ToolCallBadge tool={makeTool("unknown_tool", { path: "/foo.tsx" })} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows green dot when tool call is complete", () => {
  const { container } = render(
    <ToolCallBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when tool call is in progress", () => {
  const { container } = render(
    <ToolCallBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
