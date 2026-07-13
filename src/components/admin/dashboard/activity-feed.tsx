import { AdminCard, TONES } from "@/components/admin/ui";
import { RECENT_ACTIVITY } from "@/static-data/admin/dashboard";

/** Recent activity — a dot-and-line timeline; the last row drops its line. */
export function ActivityFeed() {
  return (
    <AdminCard className="px-[18px] py-3.5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
        Recent activity
      </div>
      <div className="flex flex-col">
        {RECENT_ACTIVITY.map((item, i) => (
          <div key={item.what} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className="mt-[5px] h-2 w-2 flex-none rounded-full"
                style={{ background: TONES[item.tone].dot }}
              />
              <span
                aria-hidden="true"
                className="min-h-3 w-[1.5px] flex-1"
                style={{
                  background: i === RECENT_ACTIVITY.length - 1 ? "transparent" : "#E2E5EA",
                }}
              />
            </div>
            <div className="min-w-0 pb-3">
              <div className="text-[12.5px] text-ink">{item.what}</div>
              <div className="mt-px text-[11px] text-soil">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
