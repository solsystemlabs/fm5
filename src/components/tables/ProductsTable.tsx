import type { Product } from "@/lib/types";
import type { ReactNode } from "react";
import { Cell, TableBody } from "react-aria-components";
import { DeleteConfirmDialog } from "../ui/DeleteConfirmDialog";
import { useDeleteProductTRPC } from "@/lib/trpc-hooks";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";

export default function ProductsTable({ data }: { data: Product[] }): ReactNode {
  const deleteProduct = useDeleteProductTRPC();
  
  const formatPrice = (price: number | null): string => {
    if (price === null) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  return (
    <FMTable>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6">
            Name
          </FMColumn>
          <FMColumn>Model</FMColumn>
          <FMColumn>Filaments</FMColumn>
          <FMColumn>Price</FMColumn>
          <FMColumn>Sliced File</FMColumn>
          <FMColumn className="rounded-tr-lg w-12">
            <span className="sr-only">Actions</span>
          </FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((product) => (
          <FMRow key={product.id}>
            <Cell className="relative py-4 pr-3 pl-4 text-sm sm:pl-6">
              <div className="flex items-center">
                <div className="text-md text-foreground font-bold">
                  {product.name}
                </div>
              </div>
              <div className="text-muted-foreground mt-1 flex flex-col sm:hidden">
                <span>{product.model.name} ({product.model.Category.name})</span>
                <span>{formatPrice(product.price)}</span>
              </div>
            </Cell>
            <FMCell className="hidden sm:table-cell">
              <div>
                <div className="text-foreground font-medium">
                  {product.model.name}
                </div>
                <div className="text-muted-foreground text-sm">
                  {product.model.Category.name}
                </div>
              </div>
            </FMCell>
            <FMCell className="hidden sm:table-cell">
              <div className="text-muted-foreground">
                {product.Filaments && product.Filaments.length > 0 ? (
                  <span>
                    {product.Filaments.length} filament
                    {product.Filaments.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>No filaments</span>
                )}
              </div>
            </FMCell>
            <FMCell className="hidden sm:table-cell">
              <span className="text-foreground font-medium">
                {formatPrice(product.price)}
              </span>
            </FMCell>
            <FMCell>
              <div className="text-muted-foreground">
                {product.slicedFile.name}
              </div>
            </FMCell>
            <FMCell className="py-4 pr-4 pl-3 text-right sm:pr-6">
              <DeleteConfirmDialog
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                itemName={product.name}
                onConfirm={() => deleteProduct.mutate(product.id)}
                isLoading={deleteProduct.isPending}
              />
            </FMCell>
          </FMRow>
        ))}
      </TableBody>
    </FMTable>
  );
}