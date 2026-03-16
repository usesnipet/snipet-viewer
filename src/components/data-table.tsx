import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Show error state (single row with message) */
  error?: boolean;
  /** Message shown when error is true (default: "Failed to load.") */
  errorMessage?: string;
  /** Message shown when data is empty and not error (default: "No data.") */
  emptyMessage?: string;
  /** Column id for the actions column (used for right-aligning header and cells) */
  actionsColumnId?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  error = false,
  errorMessage = "Failed to load.",
  emptyMessage = "No data.",
  actionsColumnId = "actions",
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => getRowId(row as T),
    getCoreRowModel: getCoreRowModel(),
  });

  const colCount = columns.length;
  const showError = error;
  const showEmpty = !showError && data.length === 0;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={
                  header.id === actionsColumnId ? "text-right" : undefined
                }
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {showError ? (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="py-10 text-center text-muted-foreground italic"
            >
              {errorMessage}
            </TableCell>
          </TableRow>
        ) : showEmpty ? (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="py-10 text-center text-muted-foreground italic"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === actionsColumnId ? "text-right" : undefined
                  }
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
