import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Strike this plot off?",
  description: "This can't be undone from here.",
};

describe("ConfirmationDialog", () => {
  it("confirms straight away without an exact-match requirement", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmationDialog {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("keeps confirm disabled until the exact match is typed", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationDialog
        {...baseProps}
        onConfirm={onConfirm}
        requireExactMatch="PLOT-14"
        confirmText="Strike it off"
      />,
    );
    const confirm = screen.getByRole("button", { name: "Strike it off" });
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/to confirm/i), "PLOT-1");
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/to confirm/i), "4");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
