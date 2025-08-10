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
} from "@/components/ui/table";
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
              brand={row.brandName}
            />
          );
        },
        size: 160,
      }),
      columnHelper.accessor("Brand.name", {
        header: "Brand",
        cell: (info) => (
          <div className="text-gray-900 font-medium">{info.getValue()}</div>
        ),
        size: 120,
      }),
      columnHelper.accessor("Material.name", {
        header: "Material",
        cell: (info) => <div className="text-gray-900">{info.getValue()}</div>,
        size: 100,
      }),
      columnHelper.accessor("diameter", {
        header: "Diameter",
        cell: (info) => (
          <div className="text-gray-900 font-mono text-sm">
            {info.getValue()}mm
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor("cost", {
        header: "Cost",
        cell: (info) => {
          const cost = info.getValue();
          return cost ? (
            <div className="text-gray-900 font-mono">${cost.toFixed(2)}</div>
          ) : (
            <div className="text-gray-500">—</div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor("grams", {
        header: "Weight",
        cell: (info) => {
          const grams = info.getValue();
          return grams ? (
            <div className="text-gray-900 font-mono text-sm">{grams}g</div>
          ) : (
            <div className="text-gray-500">—</div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor("Models", {
        header: "Associated Models",
        cell: (info) => {
          const models = info.getValue();
          if (!models || models.length === 0) {
            return <div className="text-gray-500">None</div>;
          }
          return (
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id}>
                  <div className="text-gray-900 font-medium text-sm">
                    {model.name}
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                      {model.Category.name}
                    </span>
                  </div>
                </div>
              ))}
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
                      const isFirstColumn = index === 0;
                      const isLastColumn =
                        index === row.getVisibleCells().length - 1;
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
