import type { Model } from "@prisma/client";
import type { ReactNode } from "react";
import { Cell, TableBody } from "react-aria-components";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";

export default function ModelsTable({ data }: { data: Model[] }): ReactNode {
  return (
    <FMTable>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6">
            Name
          </FMColumn>
          <FMColumn>Category</FMColumn>
          <FMColumn className="rounded-tr-lg">Filaments</FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((model) => (
          <FMRow key={model.id}>
            <Cell className="relative py-4 pr-3 pl-4 text-sm sm:pl-6">
              <div className="flex items-center">
                <div className="text-md text-foreground font-bold">
                  {model.name}
                </div>
              </div>
              <div className="text-muted-foreground mt-1 flex flex-col sm:hidden">
                <span>{model.Category.name}</span>
              </div>
            </Cell>
            <FMCell className="hidden sm:table-cell">
              {model.Category.name}
            </FMCell>
            <FMCell className="relative py-3.5 pr-4 pl-3 text-sm font-medium sm:pr-6">
              <div className="text-muted-foreground">
                {model.Filaments && model.Filaments.length > 0 ? (
                  <span>
                    {model.Filaments.length} filament
                    {model.Filaments.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>No filaments</span>
                )}
              </div>
            </FMCell>
          </FMRow>
        ))}
      </TableBody>
    </FMTable>
  );
}
