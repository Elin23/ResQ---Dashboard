import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';

import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import {
  Button,
  Checkbox,
  DebouncedSearchInput,
  EmptyState,
  ErrorState,
  Pagination,
  Skeleton,
} from './index';

import {
  cn,
} from '@/lib/cn';

export interface DataTableQueryState {
  pageIndex: number;
  pageSize: number;
  search: string;
  sorting: SortingState;
}

export interface DataTableProps<TData> {
  data: TData[];

  columns: Array<
    ColumnDef<TData, unknown>
  >;

  getRowId?: (
    row: TData,
    index: number,
  ) => string;

  loading?: boolean;

  error?: string | null;

  onRetry?: () => void;

  searchPlaceholder?: string;

  searchDebounceMs?: number;

  enableSearch?: boolean;

  enableRowSelection?: boolean;

  rowActions?: (
    row: TData,
  ) => ReactNode;

  onRowClick?: (
    row: TData,
  ) => void;

  rowAriaLabel?: (
    row: TData,
  ) => string;

  onSelectionChange?: (
    rows: TData[],
  ) => void;

  selectionActions?: (
    rows: TData[],
  ) => ReactNode;

  emptyState?: ReactNode;

  pageCount?: number;

  totalCount?: number;

  manualPagination?: boolean;

  manualFiltering?: boolean;

  manualSorting?: boolean;

  state?: Partial<DataTableQueryState>;

  onStateChange?: (
    state: DataTableQueryState,
  ) => void;

  pageSizeOptions?: number[];
}

function isInteractiveTarget(
  target: EventTarget | null,
): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        `
          button,
          a,
          input,
          select,
          textarea,
          [role="menuitem"],
          [role="checkbox"]
        `,
      ),
    )
  );
}

function sameSorting(
  left: SortingState,
  right: SortingState,
): boolean {
  return (
    left.length ===
      right.length &&
    left.every(
      (item, index) =>
        item.id ===
          right[index]?.id &&
        item.desc ===
          right[index]?.desc,
    )
  );
}

function formatArabicCount(
  count: number,
): string {
  return count.toLocaleString(
    'ar-SA-u-nu-latn',
  );
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,

  loading = false,

  error,
  onRetry,

  searchPlaceholder =
    'البحث في الجدول…',

  searchDebounceMs = 250,

  enableSearch = true,

  enableRowSelection = false,

  rowActions,

  onRowClick,

  rowAriaLabel,

  onSelectionChange,

  selectionActions,

  emptyState,

  pageCount,

  totalCount,

  manualPagination = false,

  manualFiltering = false,

  manualSorting = false,

  state,

  onStateChange,

  pageSizeOptions = [
    10,
    20,
    50,
  ],
}: DataTableProps<TData>) {
  const safeData =
    Array.isArray(data)
      ? data
      : [];

  const safePageSizeOptions =
    pageSizeOptions.filter(
      (size) =>
        Number.isFinite(size) &&
        size > 0,
    );

  const defaultPageSize =
    safePageSizeOptions[0] ??
    10;

  const [
    localSearch,
    setLocalSearch,
  ] = useState(
    state?.search ?? '',
  );

  const [
    localSorting,
    setLocalSorting,
  ] =
    useState<SortingState>(
      state?.sorting ?? [],
    );

  const [
    localPagination,
    setLocalPagination,
  ] =
    useState<PaginationState>({
      pageIndex:
        state?.pageIndex ?? 0,

      pageSize:
        state?.pageSize &&
        state.pageSize > 0
          ? state.pageSize
          : defaultPageSize,
    });

  const [
    rowSelection,
    setRowSelection,
  ] =
    useState<RowSelectionState>(
      {},
    );

  const rowActionsRef =
    useRef(rowActions);

  const getRowIdRef =
    useRef(getRowId);

  rowActionsRef.current =
    rowActions;

  getRowIdRef.current =
    getRowId;

  const stableGetRowId =
    useCallback(
      (
        row: TData,
        index: number,
      ) =>
        getRowIdRef.current?.(
          row,
          index,
        ) ?? String(index),
      [],
    );

  /*
   * الحقول التي يرسلها الأب
   * تعتبر controlled بشكل كامل.
   */
  const search =
    state?.search ??
    localSearch;

  const sorting =
    state?.sorting ??
    localSorting;

  const pagination =
    useMemo<PaginationState>(
      () => ({
        pageIndex:
          state?.pageIndex ??
          localPagination.pageIndex,

        pageSize:
          state?.pageSize &&
          state.pageSize > 0
            ? state.pageSize
            : localPagination.pageSize,
      }),
      [
        localPagination.pageIndex,
        localPagination.pageSize,
        state?.pageIndex,
        state?.pageSize,
      ],
    );

  const emitState =
    useCallback(
      (
        next: DataTableQueryState,
      ) => {
        onStateChange?.(next);
      },
      [onStateChange],
    );

  const changeSearch =
    useCallback(
      (
        nextSearch: string,
      ) => {
        if (
          nextSearch ===
            search &&
          pagination.pageIndex ===
            0
        ) {
          return;
        }

        if (
          state?.search ===
          undefined
        ) {
          setLocalSearch(
            nextSearch,
          );
        }

        if (
          state?.pageIndex ===
          undefined
        ) {
          setLocalPagination(
            (current) =>
              current.pageIndex ===
              0
                ? current
                : {
                    ...current,
                    pageIndex: 0,
                  },
          );
        }

        emitState({
          search: nextSearch,
          sorting,
          pageIndex: 0,
          pageSize:
            pagination.pageSize,
        });
      },
      [
        emitState,
        pagination.pageIndex,
        pagination.pageSize,
        search,
        sorting,
        state?.pageIndex,
        state?.search,
      ],
    );

  const changeSorting =
    useCallback(
      (
        updater:
          | SortingState
          | ((
              current: SortingState,
            ) => SortingState),
      ) => {
        const nextSorting =
          typeof updater ===
          'function'
            ? updater(sorting)
            : updater;

        if (
          sameSorting(
            nextSorting,
            sorting,
          ) &&
          pagination.pageIndex ===
            0
        ) {
          return;
        }

        if (
          state?.sorting ===
          undefined
        ) {
          setLocalSorting(
            nextSorting,
          );
        }

        if (
          state?.pageIndex ===
          undefined
        ) {
          setLocalPagination(
            (current) =>
              current.pageIndex ===
              0
                ? current
                : {
                    ...current,
                    pageIndex: 0,
                  },
          );
        }

        emitState({
          search,
          sorting:
            nextSorting,
          pageIndex: 0,
          pageSize:
            pagination.pageSize,
        });
      },
      [
        emitState,
        pagination.pageIndex,
        pagination.pageSize,
        search,
        sorting,
        state?.pageIndex,
        state?.sorting,
      ],
    );

  const changePagination =
    useCallback(
      (
        updater:
          | PaginationState
          | ((
              current: PaginationState,
            ) => PaginationState),
      ) => {
        const nextPagination =
          typeof updater ===
          'function'
            ? updater(
                pagination,
              )
            : updater;

        if (
          nextPagination.pageIndex ===
            pagination.pageIndex &&
          nextPagination.pageSize ===
            pagination.pageSize
        ) {
          return;
        }

        if (
          state?.pageIndex ===
            undefined ||
          state?.pageSize ===
            undefined
        ) {
          setLocalPagination(
            (current) => ({
              pageIndex:
                state?.pageIndex ===
                undefined
                  ? nextPagination.pageIndex
                  : current.pageIndex,

              pageSize:
                state?.pageSize ===
                undefined
                  ? nextPagination.pageSize
                  : current.pageSize,
            }),
          );
        }

        emitState({
          search,
          sorting,

          pageIndex:
            nextPagination.pageIndex,

          pageSize:
            nextPagination.pageSize,
        });
      },
      [
        emitState,
        pagination,
        search,
        sorting,
        state?.pageIndex,
        state?.pageSize,
      ],
    );

  const enhancedColumns =
    useMemo<
      Array<
        ColumnDef<
          TData,
          unknown
        >
      >
    >(() => {
      const result: Array<
        ColumnDef<
          TData,
          unknown
        >
      > = [];

      if (
        enableRowSelection
      ) {
        result.push({
          id: 'selection',

          enableSorting:
            false,

          header: ({
            table,
          }) => (
            <Checkbox
              ariaLabel="تحديد كل الصفوف الظاهرة"
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(
                value,
              ) =>
                table.toggleAllPageRowsSelected(
                  value === true,
                )
              }
            />
          ),

          cell: ({
            row,
          }) => (
            <Checkbox
              ariaLabel="تحديد الصف"
              checked={row.getIsSelected()}
              onCheckedChange={(
                value,
              ) =>
                row.toggleSelected(
                  value === true,
                )
              }
            />
          ),
        });
      }

      result.push(
        ...columns,
      );

      if (rowActions) {
        result.push({
          id: 'actions',

          enableSorting:
            false,

          header:
            'الإجراءات',

          cell: ({
            row,
          }) => (
            <div
              className="
                flex
                justify-start
              "
            >
              {rowActionsRef.current?.(
                row.original,
              )}
            </div>
          ),
        });
      }

      return result;
    }, [
      columns,
      enableRowSelection,
      Boolean(
        rowActions,
      ),
    ]);

  const table =
    useReactTable({
      data: safeData,

      columns:
        enhancedColumns,

      getCoreRowModel:
        getCoreRowModel(),

      getFilteredRowModel:
        manualFiltering
          ? undefined
          : getFilteredRowModel(),

      getSortedRowModel:
        manualSorting
          ? undefined
          : getSortedRowModel(),

      getPaginationRowModel:
        manualPagination
          ? undefined
          : getPaginationRowModel(),

      getRowId:
        stableGetRowId,

      manualPagination,
      manualFiltering,
      manualSorting,

      pageCount:
        manualPagination
          ? pageCount
          : undefined,

      state: {
        globalFilter:
          search,

        sorting,

        pagination,

        rowSelection,
      },

      onGlobalFilterChange: (
        updater,
      ) =>
        changeSearch(
          String(
            typeof updater ===
              'function'
              ? updater(
                  search,
                )
              : updater,
          ),
        ),

      onSortingChange:
        changeSorting,

      onPaginationChange:
        changePagination,

      onRowSelectionChange:
        setRowSelection,
    });

  const selectedRows =
    useMemo(() => {
      const selectedIds =
        new Set(
          Object.entries(
            rowSelection,
          )
            .filter(
              ([
                ,
                selected,
              ]) => selected,
            )
            .map(
              ([rowId]) =>
                rowId,
            ),
        );

      if (
        selectedIds.size ===
        0
      ) {
        return [];
      }

      return safeData.filter(
        (row, index) =>
          selectedIds.has(
            stableGetRowId(
              row,
              index,
            ),
          ),
      );
    }, [
      safeData,
      rowSelection,
      stableGetRowId,
    ]);

  /*
   * عند استخدام pagination
   * من السيرفر نتخلص من
   * التحديد القديم عند الانتقال
   * بين الصفحات.
   */
  useEffect(() => {
    if (
      !manualPagination &&
      !manualFiltering
    ) {
      return;
    }

    const visibleIds =
      new Set(
        safeData.map(
          (row, index) =>
            stableGetRowId(
              row,
              index,
            ),
        ),
      );

    setRowSelection(
      (current) => {
        let changed =
          false;

        const next: RowSelectionState =
          {};

        for (const [
          id,
          selected,
        ] of Object.entries(
          current,
        )) {
          if (
            selected &&
            visibleIds.has(
              id,
            )
          ) {
            next[id] =
              true;
          } else if (
            selected
          ) {
            changed =
              true;
          }
        }

        return changed
          ? next
          : current;
      },
    );
  }, [
    safeData,
    manualFiltering,
    manualPagination,
    stableGetRowId,
  ]);

  const lastSelectionSignature =
    useRef<
      string | null
    >(null);

  useEffect(() => {
    if (
      !onSelectionChange
    ) {
      return;
    }

    const signature =
      Object.entries(
        rowSelection,
      )
        .filter(
          ([
            ,
            selected,
          ]) => selected,
        )
        .map(
          ([rowId]) =>
            rowId,
        )
        .sort()
        .join('|');

    if (
      signature ===
      lastSelectionSignature.current
    ) {
      return;
    }

    lastSelectionSignature.current =
      signature;

    onSelectionChange(
      selectedRows,
    );
  }, [
    onSelectionChange,
    rowSelection,
    selectedRows,
  ]);

  if (error) {
    return (
      <ErrorState
        description={error}
        onRetry={onRetry}
      />
    );
  }

  const visibleRows =
    table
      .getRowModel()
      .rows;

  const externalPageCount =
    Number.isFinite(
      pageCount,
    )
      ? Math.max(
          Math.trunc(
            pageCount ?? 1,
          ),
          1,
        )
      : 1;

  const resolvedPageCount =
    manualPagination
      ? externalPageCount
      : Math.max(
          table.getPageCount(),
          1,
        );

  const activateRow = (
    row: TData,

    event:
      | MouseEvent<HTMLTableRowElement>
      | KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (
      !onRowClick ||
      isInteractiveTarget(
        event.target,
      )
    ) {
      return;
    }

    if (
      'key' in event &&
      event.key !==
        'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    if ('key' in event) {
      event.preventDefault();
    }

    onRowClick(row);
  };

  const countLabel =
    selectedRows.length > 0
      ? `تم تحديد ${formatArabicCount(
          selectedRows.length,
        )} ${
          selectedRows.length ===
          1
            ? 'عنصر'
            : 'عناصر'
        }`
      : totalCount !==
          undefined
        ? `إجمالي العناصر: ${formatArabicCount(
            totalCount,
          )}`
        : null;

  return (
    <div
      dir="rtl"
      className="
        space-y-3
        text-start
      "
    >
      {(enableSearch ||
        countLabel) && (
        <div
          className="
            flex
            min-h-9
            flex-col
            gap-2.5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {enableSearch ? (
            <DebouncedSearchInput
              value={search}
              onValueChange={
                changeSearch
              }
              debounceMs={
                searchDebounceMs
              }
              placeholder={
                searchPlaceholder
              }
              className="
                w-full
                sm:max-w-sm
              "
            />
          ) : (
            <div />
          )}

          {countLabel && (
            <div
              className="
                shrink-0
                text-[12px]
                font-normal
                text-muted-foreground
              "
            >
              {countLabel}
            </div>
          )}
        </div>
      )}

      {selectedRows.length >
        0 &&
        selectionActions && (
          <div
            className="
              flex
              flex-col
              gap-2.5
              rounded-xl
              border
              border-primary/10
              bg-primary/[0.035]
              px-3
              py-2.5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <span
              className="
                text-[12px]
                font-medium
                text-foreground
              "
            >
              تم تحديد{' '}
              {formatArabicCount(
                selectedRows.length,
              )}{' '}
              من عناصر الصفحة
              الحالية
            </span>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              {selectionActions(
                selectedRows,
              )}
            </div>
          </div>
        )}

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-border/45
          bg-white
          shadow-none
        "
      >
        <div
          className="
            resq-scroll-region
            overflow-x-auto
          "
        >
          <table
            dir="rtl"
            className="
              w-full
              min-w-[38rem]
              border-separate
              border-spacing-0
              text-start
              text-[13px]
              sm:min-w-[44rem]
            "
          >
            <thead
              className="
                sticky
                top-0
                z-10
                bg-muted/35
                text-muted-foreground
              "
            >
              {table
                .getHeaderGroups()
                .map(
                  (
                    headerGroup,
                  ) => (
                    <tr
                      key={
                        headerGroup.id
                      }
                    >
                      {headerGroup.headers.map(
                        (
                          header,
                        ) => (
                          <th
                            key={
                              header.id
                            }
                            scope="col"
                            className={cn(
                              'whitespace-nowrap border-b border-border/45 px-3.5 py-2.5 text-start text-[12px] font-medium',
                              header.column.id === 'actions' && 'w-[76px]',
                              header.column.id === 'selection' && 'w-[48px]',
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : header.column.getCanSort()
                                ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="
                                        -mx-2
                                        h-8
                                        gap-1.5
                                        rounded-lg
                                        px-2
                                        text-[12px]
                                        font-medium
                                        text-muted-foreground
                                        hover:bg-primary/[0.04]
                                        hover:text-foreground
                                      "
                                      onClick={
                                        header.column.getToggleSortingHandler()
                                      }
                                    >
                                      {flexRender(
                                        header
                                          .column
                                          .columnDef
                                          .header,

                                        header.getContext(),
                                      )}

                                      {header.column.getIsSorted() ===
                                      'asc' ? (
                                        <ArrowUp
                                          className="size-3.5"
                                          strokeWidth={
                                            1.7
                                          }
                                        />
                                      ) : header.column.getIsSorted() ===
                                        'desc' ? (
                                        <ArrowDown
                                          className="size-3.5"
                                          strokeWidth={
                                            1.7
                                          }
                                        />
                                      ) : (
                                        <ChevronsUpDown
                                          className="
                                            size-3.5
                                            opacity-45
                                          "
                                          strokeWidth={
                                            1.7
                                          }
                                        />
                                      )}
                                    </Button>
                                  )
                                : flexRender(
                                    header
                                      .column
                                      .columnDef
                                      .header,

                                    header.getContext(),
                                  )}
                          </th>
                        ),
                      )}
                    </tr>
                  ),
                )}
            </thead>

            <tbody>
              {loading
                ? Array.from(
                    {
                      length: 5,
                    },
                    (
                      _,
                      rowIndex,
                    ) => (
                      <tr
                        key={`skeleton-${rowIndex}`}
                      >
                        {enhancedColumns.map(
                          (
                            column,
                            cellIndex,
                          ) => (
                            <td
                              key={`skeleton-${String(
                                column.id ??
                                  cellIndex,
                              )}-${rowIndex}`}
                              className="
                                border-b
                                border-border/35
                                px-3.5
                                py-3
                              "
                            >
                              <Skeleton
                                className="
                                  h-4
                                  w-4/5
                                "
                              />
                            </td>
                          ),
                        )}
                      </tr>
                    ),
                  )
                : visibleRows.map(
                    (row) => (
                      <tr
                        key={
                          row.id
                        }
                        tabIndex={
                          onRowClick
                            ? 0
                            : undefined
                        }
                        aria-label={rowAriaLabel?.(
                          row.original,
                        )}
                        onClick={(
                          event,
                        ) =>
                          activateRow(
                            row.original,
                            event,
                          )
                        }
                        onKeyDown={(
                          event,
                        ) =>
                          activateRow(
                            row.original,
                            event,
                          )
                        }
                        className={cn(
                          `
                            group
                            transition-colors
                            duration-150
                            hover:bg-primary/[0.025]
                          `,

                          onRowClick &&
                            `
                              cursor-pointer
                              focus-visible:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-inset
                              focus-visible:ring-primary/20
                            `,

                          row.getIsSelected() &&
                            `
                              bg-primary/[0.045]
                              hover:bg-primary/[0.06]
                            `,
                        )}
                      >
                        {row
                          .getVisibleCells()
                          .map(
                            (
                              cell,
                            ) => (
                              <td
                                key={
                                  cell.id
                                }
                                className={cn(
                                  'border-b border-border/35 px-3.5 py-3 align-middle text-start group-last:border-b-0',
                                  cell.column.id === 'actions' && 'w-[76px]',
                                  cell.column.id === 'selection' && 'w-[48px]',
                                )}
                              >
                                {flexRender(
                                  cell
                                    .column
                                    .columnDef
                                    .cell,

                                  cell.getContext(),
                                )}
                              </td>
                            ),
                          )}
                      </tr>
                    ),
                  )}
            </tbody>
          </table>
        </div>

        {!loading &&
          visibleRows.length ===
            0 && (
            <div
              className="
                p-6
                sm:p-8
              "
            >
              {emptyState ?? (
                <EmptyState />
              )}
            </div>
          )}
      </div>

      <div
        className="
          flex
          flex-col
          gap-3
          px-0.5
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <label
          className="
            flex
            items-center
            gap-2
            text-[12px]
            font-normal
            text-muted-foreground
          "
        >
          <span>
            عدد الصفوف
          </span>

          <select
            dir="rtl"
            className="
              h-9
              min-w-[70px]
              rounded-xl
              border
              border-border/50
              bg-white
              px-2.5
              text-[12px]
              font-medium
              text-foreground
              shadow-none
              outline-none
              transition-colors
              hover:border-primary/20
              hover:bg-primary/[0.02]
              focus-visible:ring-2
              focus-visible:ring-primary/20
            "
            value={
              pagination.pageSize
            }
            onChange={(
              event,
            ) =>
              changePagination({
                pageIndex: 0,

                pageSize:
                  Number(
                    event.target
                      .value,
                  ),
              })
            }
          >
            {safePageSizeOptions.map(
              (size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size.toLocaleString(
                    'ar-SA-u-nu-latn',
                  )}
                </option>
              ),
            )}
          </select>
        </label>

        <div
          dir="rtl"
          className="
            flex
            items-center
          "
        >
          <Pagination
            page={
              pagination.pageIndex +
              1
            }
            pageCount={
              resolvedPageCount
            }
            onPageChange={(
              page,
            ) =>
              changePagination(
                (
                  current,
                ) => ({
                  ...current,

                  pageIndex:
                    page -
                    1,
                }),
              )
            }
          />
        </div>
      </div>
    </div>
  );
}