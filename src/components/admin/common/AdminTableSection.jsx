import PaginatedContent from "../../ui/PaginatedContent";
import Pagination from "../../ui/Pagination";
import TableSectionSkeleton from "../../ui/TableSectionSkeleton";
import { getPaginationState } from "../../../utils/paginationState";

function AdminTableSectionHeader({
  actions,
  actionsFullWidth,
  count,
  eyebrow,
  headerActions,
  loading,
  title,
}) {
  const hasHeaderContent = Boolean(eyebrow || title || count || actions);

  if (!hasHeaderContent) return null;

  return (
    <div className="mb-4">
      {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
      {(title || headerActions) && (
        <div className="flex items-center justify-between gap-3 md:min-h-10">
          {title && (
            <h2 className="min-w-0 font-serif text-3xl leading-none text-[var(--color-accent-dark)]">
              {title}
            </h2>
          )}
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>
      )}
      {!loading && (count || actions) && actions && !headerActions && (
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          <div
            className={`rounded-[1.5rem] border border-[var(--color-border)] bg-white/35 p-4 ${
              actionsFullWidth ? "w-full" : ""
            }`}
          >
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTableSection({
  actions,
  actionsFullWidth = false,
  children,
  className = "",
  contentRef,
  count,
  eyebrow,
  filters,
  getKey,
  headerActions,
  loading = false,
  lockPageHeight = false,
  mobilePageLabel,
  onNextPage,
  onPrevPage,
  page,
  pageDirection = 1,
  paginationInlineWithTitle = false,
  paginationLabel,
  pageLabel,
  pageSize,
  renderMeasurePage,
  renderPage,
  sectionRef,
  skeletonConfig = {},
  summary,
  title,
  totalPages,
  items = [],
}) {
  const hasFilterSlot = Boolean(filters);
  const pagination = getPaginationState({
    items,
    page,
    pageSize,
    totalPages,
  });
  const hasPagination =
    !loading &&
    page &&
    pageSize &&
    pagination.totalPages;
  const hasPaginationSlot =
    skeletonConfig.pagination ??
    Boolean(
      pageLabel || paginationLabel || mobilePageLabel || page || totalPages,
    );
  const contentSkeletonConfig = skeletonConfig.content || {};
  void paginationInlineWithTitle;

  return (
    <section
      className={`premium-card admin-table-section pt-4 ${className}`}
      ref={sectionRef}
    >
      <AdminTableSectionHeader
        actions={actions}
        actionsFullWidth={actionsFullWidth}
        count={count}
        eyebrow={eyebrow}
        headerActions={headerActions}
        loading={loading}
        title={title}
      />

      {loading ? (
        <TableSectionSkeleton
          actionCount={skeletonConfig.actionCount}
          actions={skeletonConfig.actions ?? Boolean(actions)}
          cardCount={contentSkeletonConfig.count ?? skeletonConfig.cardCount}
          columnsClassName={contentSkeletonConfig.columnsClassName}
          count={skeletonConfig.count ?? Boolean(count)}
          filters={skeletonConfig.filters ?? Boolean(filters && hasFilterSlot)}
          itemClassName={contentSkeletonConfig.itemClassName}
          lines={contentSkeletonConfig.lines}
          pagination={hasPaginationSlot}
        />
      ) : (
        <>
          {summary && <div className="mb-4">{summary}</div>}

          {filters && hasFilterSlot && <div className="mb-4">{filters}</div>}

          {hasPagination && (
            <Pagination
              className="mb-4"
              currentLabel={pageLabel}
              label={paginationLabel}
              mobileLabel={mobilePageLabel}
              onNext={onNextPage}
              onPrev={onPrevPage}
              page={pagination.page}
              totalPages={pagination.totalPages}
            />
          )}

          <div ref={contentRef}>
            {renderPage ? (
              <PaginatedContent
                allItems={items}
                direction={pageDirection}
                getKey={getKey}
                lockHeight={lockPageHeight}
                page={pagination.page}
                pageSize={pagination.pageSize}
                renderMeasurePage={renderMeasurePage}
                renderPage={renderPage}
                totalPages={pagination.totalPages}
              />
            ) : (
              children
            )}
          </div>

        </>
      )}
    </section>
  );
}
