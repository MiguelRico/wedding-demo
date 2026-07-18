import { Search } from "lucide-react";

import { adminContent } from "../../../constants/adminContent";
import { AdminFiltersPanel } from "../common";
import {
  inputClassName,
  Label,
  selectClassName,
} from "../../rsvp/FormPrimitives";

export default function TableFilters({
  availableGroups = [],
  availableSeatCounts = [],
  filters,
  onFilterChange,
}) {
  const content = adminContent.tables.filters;
  const selectedOccupancy = content.occupancyOptions.find(
    (option) => option.value === filters.occupancy,
  );
  const activeFilters = [
    filters.query.trim()
      ? {
          key: "query",
          label: filters.query.trim(),
          onRemove: () => onFilterChange("query", ""),
        }
      : null,
    filters.group
      ? {
          key: "group",
          label: filters.group,
          onRemove: () => onFilterChange("group", ""),
        }
      : null,
    filters.occupancy && selectedOccupancy
      ? {
          key: "occupancy",
          label: selectedOccupancy.label,
          onRemove: () => onFilterChange("occupancy", ""),
        }
      : null,
    filters.seatCount
      ? {
          key: "seatCount",
          label: content.seatCountOption(filters.seatCount),
          onRemove: () => onFilterChange("seatCount", ""),
        }
      : null,
  ].filter(Boolean);

  return (
    <AdminFiltersPanel activeFilters={activeFilters} title={content.eyebrow}>
        <div>
          <Label>{content.searchLabel}</Label>
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]"
              size={18}
              strokeWidth={1.8}
            />
            <input
              className={`${inputClassName} pl-12`}
              onChange={(event) => onFilterChange("query", event.target.value)}
              placeholder={content.searchPlaceholder}
              type="search"
              value={filters.query}
            />
          </label>
        </div>

        <div>
          <Label>{content.groupLabel}</Label>
          <select
            className={selectClassName}
            onChange={(event) => onFilterChange("group", event.target.value)}
            value={filters.group}
          >
            <option value="">{content.allGroups}</option>
            {availableGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>{content.occupancyLabel}</Label>
          <select
            className={selectClassName}
            onChange={(event) =>
              onFilterChange("occupancy", event.target.value)
            }
            value={filters.occupancy}
          >
            {content.occupancyOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>{content.seatCountLabel}</Label>
          <select
            className={selectClassName}
            onChange={(event) => onFilterChange("seatCount", event.target.value)}
            value={filters.seatCount}
          >
            <option value="">{content.allSeatCounts}</option>
            {availableSeatCounts.map((seatCount) => (
              <option key={seatCount} value={seatCount}>
                {content.seatCountOption(seatCount)}
              </option>
            ))}
          </select>
        </div>
    </AdminFiltersPanel>
  );
}
