import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Filament } from '@/lib/types'

const columnHelper = createColumnHelper<Filament>()

const columns = [
  columnHelper.accessor('color', {
    header: 'Color',
    cell: (info) => (
      <div className="flex items-center space-x-2">
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: info.getValue().toLowerCase() }}
        />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('material.name', {
    header: 'Material',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('Model.name', {
    header: 'Associated Model',
    cell: (info) => info.getValue() || <span className="text-gray-400">None</span>,
  }),
  columnHelper.accessor('Model.category.name', {
    header: 'Category',
    cell: (info) => info.getValue() || <span className="text-gray-400">N/A</span>,
  }),
]

interface FilamentsTableProps {
  data: Filament[]
}

export function FilamentsTable({ data }: FilamentsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No filaments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}