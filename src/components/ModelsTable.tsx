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
import { Model } from "@/lib/types";
import { ColorLabel } from "./color/ColorLabel";

const columnHelper = createColumnHelper<Model>();

interface ModelsTableProps {
  data: Model[];
}

export function ModelsTable({ data }: ModelsTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        ),
        size: 220,
      }),
      columnHelper.accessor("Category.name", {
        header: "Category",
        cell: (info) => (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
            {info.getValue()}
          </span>
        ),
        size: 140,
      }),
      columnHelper.accessor((row) => row.Filaments, {
        id: "filaments",
        header: "Associated Filaments",
        cell: (info) => {
          const filaments = info.getValue();
          if (!filaments || filaments.length === 0) {
            return <div className="text-gray-500">None</div>;
          }
          return (
            <div className="space-y-2">
              {filaments.slice(0, 3).map((filament) => (
                <div key={filament.id} className="flex items-center gap-3">
                  <ColorLabel
                    color={filament.color}
                    name={filament.name}
                    brand={filament.brandName}
                    filamentId={filament.id}
                  />
                </div>
              ))}
              {filaments.length > 3 && (
                <div className="text-xs text-gray-500 font-medium mt-2">
                  +{filaments.length - 3} more filaments
                </div>
              )}
            </div>
          );
        },
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
    <div className="flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <Table className="min-w-full divide-y divide-gray-300">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isFirstColumn = index === 0;
                    const isLastColumn =
                      index === headerGroup.headers.length - 1;
                    return (
                      <TableHead
                        key={header.id}
                        className={`py-3.5 text-left text-sm font-semibold text-gray-900 ${
                          isFirstColumn
                            ? "pl-4 pr-3 sm:pl-0"
                            : isLastColumn
                              ? "pl-3 pr-4 sm:pr-0"
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
            <TableBody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      const isLastColumn =
                        index === row.getVisibleCells().length - 1;
                      const isFirstColumn = index === 0;
                      return (
                        <TableCell
                          key={cell.id}
                          className={`py-5 text-sm whitespace-nowrap ${
                            isFirstColumn
                              ? "pl-4 pr-3 sm:pl-0"
                              : isLastColumn
                                ? "pl-3 pr-4 sm:pr-0"
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
                    className="h-24 text-center text-gray-500"
                  >
                    No models found.
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
