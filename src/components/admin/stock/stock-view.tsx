"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminCard, AdminField, adminInputClass } from "@/components/admin/ui";
import {
  ConsoleFilterBar,
  ConsoleLabeledSelect,
} from "@/components/admin/filter-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/input";
import { useGetCommoditiesQuery } from "@/redux/commodities/commodities-api";
import { useGetWarehousesQuery } from "@/redux/warehouses/warehouses-api";
import {
  useGetStockBalancesQuery,
  useRequestStockAdjustmentMutation,
} from "@/redux/stock/stock-api";
import { extractApiError } from "@/lib/extract-api-error";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { IStockBalance } from "@/types/stock.types";
import {
  adjustmentFormSchema,
  type AdjustmentFormValues,
} from "@/validations/stock-schema";
import { formatKg } from "./stock-bits";
import { StockMovements } from "./stock-movements";

type Section = "balances" | "movements";

/**
 * /admin/stock - the derived stock position. Balances are grouped by
 * warehouse with a per-commodity totals strip on top; the movements ledger
 * lives behind a section toggle. Corrections are REQUESTS: the adjustment
 * dialog files an approval and nothing moves until it is decided.
 */
export function StockView() {
  const [section, setSection] = useState<Section>("balances");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("all");
  const [commodityId, setCommodityId] = useState("all");
  const [includeZero, setIncludeZero] = useState(false);

  const { data: warehousesData } = useGetWarehousesQuery({
    isActive: true,
    limit: 100,
  });
  const { data: commoditiesData } = useGetCommoditiesQuery({
    isActive: true,
    limit: 100,
  });
  const warehouses = warehousesData?.data ?? [];
  const commodities = commoditiesData?.data ?? [];

  const balancesArgs = useMemo(
    () => ({
      ...(warehouseId !== "all" ? { warehouseId } : {}),
      ...(commodityId !== "all" ? { commodityId } : {}),
      ...(includeZero ? { includeZero: true } : {}),
    }),
    [warehouseId, commodityId, includeZero],
  );
  const { data, isLoading, isError, error, refetch } =
    useGetStockBalancesQuery(balancesArgs);

  const balances = data?.data ?? [];
  const totals = data?.summary.totals ?? [];

  /** Balances grouped per warehouse, in the order the API returned them. */
  const byWarehouse = useMemo(() => {
    const groups = new Map<string, { name: string; rows: IStockBalance[] }>();
    for (const row of balances) {
      const group = groups.get(row.warehouseId) ?? {
        name: row.warehouseName,
        rows: [],
      };
      group.rows.push(row);
      groups.set(row.warehouseId, group);
    }
    return [...groups.entries()];
  }, [balances]);

  const warehouseOptions = [
    { value: "all", label: "All warehouses" },
    ...warehouses.map((w) => ({ value: w.id, label: w.name })),
  ];
  const commodityOptions = [
    { value: "all", label: "All commodities" },
    ...commodities.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">
            Stock
          </h1>
          <p className="mt-0.5 text-[13px] text-soil">
            On hand by warehouse - always the sum of the ledger, never a
            stored number
          </p>
        </div>
        <Button
          variant="harvest"
          className="h-8 px-3.5 text-[13px]"
          onClick={() => setAdjustOpen(true)}
        >
          + Request adjustment
        </Button>
      </div>

      {/* Section toggle - balances / movements. */}
      <div className="mb-4 flex gap-1.5">
        {(
          [
            ["balances", "Balances"],
            ["movements", "Movements"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            aria-pressed={section === key}
            className={cn(
              "cursor-pointer rounded-[2px] border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              section === key
                ? "border-console bg-console text-white"
                : "border-soil/30 bg-paper text-soil hover:border-console/60",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "movements" ? (
        <StockMovements
          warehouseOptions={warehouseOptions}
          commodityOptions={commodityOptions}
        />
      ) : (
        <>
          {/* Per-commodity grand totals. */}
          {totals.length > 0 ? (
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {totals.map((t) => (
                <AdminCard key={t.commodityId} className="px-3.5 py-3">
                  <div className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-soil">
                    {t.commodityName}
                  </div>
                  <div
                    className="font-adminmono mt-1 text-[19px] font-bold text-ink"
                    title={`${t.totalKg.toLocaleString("en-GH")} kg`}
                  >
                    {formatKg(t.totalKg)}
                  </div>
                </AdminCard>
              ))}
            </div>
          ) : null}

          <ConsoleFilterBar
            search=""
            onSearch={() => undefined}
            hideSearch
            activeCount={
              (warehouseId !== "all" ? 1 : 0) +
              (commodityId !== "all" ? 1 : 0) +
              (includeZero ? 1 : 0)
            }
            onClear={() => {
              setWarehouseId("all");
              setCommodityId("all");
              setIncludeZero(false);
            }}
          >
            <ConsoleLabeledSelect
              label="Warehouse"
              value={warehouseId}
              onChange={setWarehouseId}
              options={warehouseOptions}
              active={warehouseId !== "all"}
              className="lg:w-[190px]"
            />
            <ConsoleLabeledSelect
              label="Commodity"
              value={commodityId}
              onChange={setCommodityId}
              options={commodityOptions}
              active={commodityId !== "all"}
              className="lg:w-[190px]"
            />
            <label className="flex h-8 cursor-pointer select-none items-center gap-2 px-1 text-[13px] text-soil">
              <input
                type="checkbox"
                checked={includeZero}
                onChange={(e) => setIncludeZero(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--color-forest)]"
              />
              Include empty
            </label>
          </ConsoleFilterBar>

          {isLoading ? (
            <DataTableSkeleton />
          ) : isError ? (
            <ErrorMessage
              description={extractApiError(error).message}
              onRetry={() => void refetch()}
            />
          ) : byWarehouse.length === 0 ? (
            <AdminCard className="overflow-hidden">
              <EmptyState
                title="Nothing on hand"
                description="Stock appears here the moment a purchase is received into a warehouse."
              />
            </AdminCard>
          ) : (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {byWarehouse.map(([id, group]) => (
                <AdminCard key={id} className="overflow-hidden">
                  <div className="border-b-[1.5px] border-soil/25 bg-surface-alt/60 px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-soil">
                    {group.name}
                  </div>
                  <ul>
                    {group.rows.map((row) => (
                      <li
                        key={row.commodityId}
                        className="flex items-center justify-between gap-3 border-b border-soil/15 px-4 py-2.5 last:border-b-0"
                      >
                        <span className="min-w-0 truncate text-[13.5px] font-medium text-ink">
                          {row.commodityName}
                        </span>
                        <span
                          className="font-adminmono flex-none text-[13.5px] font-semibold text-ink"
                          title={`${row.balanceKg.toLocaleString("en-GH")} kg`}
                        >
                          {formatKg(row.balanceKg)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AdminCard>
              ))}
            </div>
          )}
        </>
      )}

      <AdjustmentDialog
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        commodities={commodities.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

/**
 * Files a stock-adjustment approval. A +/- direction toggle plus a positive
 * quantity beats typing minus signs on a phone; the submit signs the delta.
 */
function AdjustmentDialog({
  open,
  onClose,
  warehouses,
  commodities,
}: {
  open: boolean;
  onClose: () => void;
  warehouses: { id: string; name: string }[];
  commodities: { id: string; name: string }[];
}) {
  const [requestAdjustment, { isLoading }] =
    useRequestStockAdjustmentMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      warehouseId: "",
      commodityId: "",
      direction: "ADD",
      quantityKg: "",
      reason: "",
    },
  });
  const direction = watch("direction");

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    const quantity = Number(values.quantityKg);
    try {
      await requestAdjustment({
        warehouseId: values.warehouseId,
        commodityId: values.commodityId,
        deltaKg: values.direction === "REMOVE" ? -quantity : quantity,
        reason: values.reason,
      }).unwrap();
      notify.success("Adjustment requested - waiting for approval");
      close();
    } catch (err) {
      notify.error(extractApiError(err).message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Request a stock adjustment</DialogTitle>
          <DialogDescription>
            Nothing moves yet - the adjustment applies only once it is
            approved from the approvals inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void onSubmit(e)} className="grid gap-3.5">
          <AdminField label="Warehouse" error={errors.warehouseId?.message}>
            <select
              className={cn(adminInputClass, "cursor-pointer")}
              {...register("warehouseId")}
            >
              <option value="">Choose a warehouse…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Commodity" error={errors.commodityId?.message}>
            <select
              className={cn(adminInputClass, "cursor-pointer")}
              {...register("commodityId")}
            >
              <option value="">Choose a commodity…</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </AdminField>

          <div className="grid grid-cols-[auto_1fr] items-end gap-2.5">
            <div>
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-soil">
                Direction
              </span>
              <div className="flex gap-1">
                {(
                  [
                    ["ADD", "+ Add"],
                    ["REMOVE", "- Remove"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={direction === value}
                    onClick={() =>
                      setValue("direction", value, { shouldValidate: true })
                    }
                    className={cn(
                      "cursor-pointer rounded-[2px] border-[1.5px] px-3 py-[7px] text-[13px] font-semibold transition-colors",
                      direction === value
                        ? value === "REMOVE"
                          ? "border-console-red bg-console-red text-white"
                          : "border-console bg-console text-white"
                        : "border-soil/30 bg-paper text-soil",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <AdminField label="Weight (kg)" error={errors.quantityKg?.message}>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                className={adminInputClass}
                {...register("quantityKg")}
              />
            </AdminField>
          </div>

          <AdminField label="Reason" error={errors.reason?.message}>
            <textarea
              rows={3}
              placeholder="Why is this stock moving? e.g. moisture loss after re-drying"
              className={cn(adminInputClass, "h-auto py-2 leading-[1.5]")}
              {...register("reason")}
            />
          </AdminField>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="harvest"
              className="h-9"
              disabled={isLoading}
            >
              {isLoading ? "Filing…" : "File for approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
