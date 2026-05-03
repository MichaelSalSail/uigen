import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

afterEach(() => {
  cleanup();
});

test("shows Preview tab as active by default", () => {
  render(<MainContent />);
  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  expect(previewTrigger).toHaveAttribute("data-state", "active");
  expect(codeTrigger).toHaveAttribute("data-state", "inactive");
});

test("PreviewFrame is always mounted (never unmounts on tab switch)", () => {
  render(<MainContent />);
  // Present on initial render
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
});

test("clicking Code tab shows code editor", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("data-state", "active");
  expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("data-state", "inactive");
  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  expect(screen.getByTestId("file-tree")).toBeInTheDocument();
  // PreviewFrame stays mounted but hidden
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
});

test("clicking Preview tab after Code hides code editor", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));
  await user.click(screen.getByRole("tab", { name: "Preview" }));

  expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("data-state", "active");
  expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("data-state", "inactive");
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
  expect(screen.queryByTestId("file-tree")).not.toBeInTheDocument();
  // PreviewFrame is still in the DOM (never unmounted)
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
});

test("toggling multiple times works correctly", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Start on preview - PreviewFrame mounted
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();

  // Switch to code - code editor mounts, PreviewFrame still mounted
  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();

  // Switch back to preview - code editor unmounts, PreviewFrame still mounted
  await user.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();

  // Switch to code again
  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
});
