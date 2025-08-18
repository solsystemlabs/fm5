import { useMemo } from "react";
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
} from "@/components/aria/table";
import { Filament } from "@/lib/types";
import { ColorLabel } from "./color/ColorLabel";

const columnHelper = createColumnHelper<Filament>();

interface FilamentsTableProps {
  data: Filament[];
}

export function FilamentsTable({ data }: FilamentsTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("color", {
        header: "Color",
        cell: (info) => {
          const row = info.row.original;
          return (
            <ColorLabel 
              color={info.getValue().toLowerCase()} 
              name={row.name}
              filamentId={row.id}
            />
          );
        },
        size: 160,
      }),
      columnHelper.accessor("Brand.name", {
        header: "Brand",
        cell: (info) => info.getValue(),
        size: 120,
      }),
      columnHelper.accessor("Material.name", {
        header: "Material",
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor("diameter", {
        header: "Diameter",
        cell: (info) => `${info.getValue()}mm`,
        size: 100,
      }),
      columnHelper.accessor("cost", {
        header: "Cost",
        cell: (info) => {
          const cost = info.getValue();
          return cost ? `$${cost.toFixed(2)}` : "—";
        },
        size: 100,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Edit</span>,
        cell: ({ row }) => (
          <a
            href={`/filament/${row.original.id}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Edit<span className="sr-only">, {row.original.name}</span>
          </a>
        ),
        size: 80,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <Table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isFirstColumn = index === 0;
                    const isLastColumn = index === headerGroup.headers.length - 1;
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        className={`py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white ${
                          isFirstColumn
                            ? "pr-3 pl-4 sm:pl-0"
                            : isLastColumn
                              ? "pr-4 pl-3 sm:pr-0"
                              : "px-3"
                        }`}
                        style={
                          isLastColumn ? {} : { width: `${header.getSize()}px` }
                        }
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
            <TableBody className="divide-y divide-gray-200 dark:divide-white/10">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell, index) => {
                      const isFirstColumn = index === 0;
                      const isLastColumn = index === row.getVisibleCells().length - 1;
                      return (
                        <TableCell
                          key={cell.id}
                          className={`py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400 ${
                            isFirstColumn
                              ? "pr-3 pl-4 font-medium text-gray-900 dark:text-white sm:pl-0"
                              : isLastColumn
                                ? "pr-4 pl-3 text-right font-medium sm:pr-0"
                                : "px-3"
                          }`}
                          style={
                            isLastColumn
                              ? {}
                              : { width: `${cell.column.getSize()}px` }
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                  >
                    No filaments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
