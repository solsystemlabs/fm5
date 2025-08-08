import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Model } from "@/lib/types";

const columnHelper = createColumnHelper<Model>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <span className="font-medium">{info.getValue()}</span>
    ),
    size: 200,
  }),
  columnHelper.accessor("Category.name", {
    header: "Category",
    cell: (info) => (
      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
        {info.getValue()}
      </span>
    ),
    size: 120,
  }),
  columnHelper.accessor((row) => row.Filaments, {
    id: "filaments",
    header: "Associated Filaments",
    cell: (info) => {
      const filaments = info.getValue();
      if (!filaments || filaments.length === 0) {
        return <span className="text-gray-400">None</span>;
      }
      return (
        <div className="space-y-1">
          {filaments.slice(0, 3).map((filament) => (
            <div key={filament.id} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: filament.color.toLowerCase() }}
              />
              <span className="text-sm">{filament.color}</span>
              <span className="text-xs text-gray-500">{filament.Brand.name}</span>
            </div>
          ))}
          {filaments.length > 3 && (
            <div className="text-xs text-gray-500">
              +{filaments.length - 3} more
            </div>
          )}
        </div>
      );
    },
  }),
];

interface ModelsTableProps {
  data: Model[];
}

export function ModelsTable({ data }: ModelsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const isLastColumn = index === headerGroup.headers.length - 1;
                return (
                  <TableHead 
                    key={header.id} 
                    className={isLastColumn ? "w-full" : ""}
                    style={isLastColumn ? {} : { width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell, index) => {
                  const isLastColumn = index === row.getVisibleCells().length - 1;
                  return (
                    <TableCell 
                      key={cell.id}
                      className={isLastColumn ? "w-full" : ""}
                      style={isLastColumn ? {} : { width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No models found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}