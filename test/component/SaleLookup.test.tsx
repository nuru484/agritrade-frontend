import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaleLookup } from "@/components/pay/sale-lookup";
import type { ISale } from "@/types/sale.types";

// Mock the data layer so the flow is tested in isolation — no store/network.
const { lookupTrigger, payTrigger } = vi.hoisted(() => ({
  lookupTrigger: vi.fn(),
  payTrigger: vi.fn(),
}));

vi.mock("@/redux/sales/sales-api", () => ({
  useLazyGetSaleQuery: () => [lookupTrigger, { isFetching: false }],
  usePaySaleMutation: () => [payTrigger, { isLoading: false }],
}));

const outstandingSale: ISale = {
  reference: "NA-1042",
  seller: "Nasara Agro Trading Ltd",
  status: "OUTSTANDING",
  amountOutstanding: 1_250_000,
  currency: "GHS",
};

const find = async (ref: string) => {
  await userEvent.type(screen.getByLabelText("Sale reference"), ref);
  await userEvent.click(screen.getByRole("button", { name: "Find" }));
};

beforeEach(() => {
  lookupTrigger.mockReset();
  payTrigger.mockReset();
});

describe("SaleLookup", () => {
  it("shows the outstanding balance and pays it", async () => {
    lookupTrigger.mockReturnValue({
      unwrap: () => Promise.resolve({ message: "ok", data: outstandingSale }),
    });
    payTrigger.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          message: "Payment received",
          data: { reference: "NA-1042", amountPaid: 1_250_000, currency: "GHS" },
        }),
    });

    render(<SaleLookup />);
    await find("na-1042");
    expect(lookupTrigger).toHaveBeenCalledWith("NA-1042");
    expect(await screen.findByText("Amount outstanding")).toBeInTheDocument();
    expect(screen.getByText("GH₵ 12,500.00")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Pay with Hubtel" }),
    );
    expect(await screen.findByText("Payment received.")).toBeInTheDocument();
    expect(screen.getByText(/paid on sale NA-1042/)).toBeInTheDocument();
  });

  it("shows the settled notice for a fully paid sale", async () => {
    lookupTrigger.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          message: "ok",
          data: { ...outstandingSale, reference: "NA-1017", status: "SETTLED", amountOutstanding: 0 },
        }),
    });
    render(<SaleLookup />);
    await find("NA-1017");
    expect(
      await screen.findByText("Nothing outstanding on NA-1017."),
    ).toBeInTheDocument();
  });

  it("treats any lookup failure as reference-not-found", async () => {
    lookupTrigger.mockReturnValue({
      unwrap: () => Promise.reject({ status: 404, data: { message: "no" } }),
    });
    render(<SaleLookup />);
    await find("NA-9999");
    expect(await screen.findByText("Reference not found.")).toBeInTheDocument();
  });

  it("offers a retry when the payment fails, returning to the balance", async () => {
    lookupTrigger.mockReturnValue({
      unwrap: () => Promise.resolve({ message: "ok", data: outstandingSale }),
    });
    payTrigger.mockReturnValue({
      unwrap: () => Promise.reject({ status: 502, data: {} }),
    });
    render(<SaleLookup />);
    await find("NA-1042");
    await userEvent.click(
      await screen.findByRole("button", { name: "Pay with Hubtel" }),
    );
    expect(
      await screen.findByText(/Payment didn.t go through/),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Amount outstanding")).toBeInTheDocument();
  });
});
