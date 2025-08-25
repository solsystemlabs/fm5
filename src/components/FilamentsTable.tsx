import type { ReactNode } from "react";
import { Cell, ColorSwatch, TableBody } from "react-aria-components";
import type { Filament } from "../lib/types";
import FMCell from "./ui/table/FMCell";
import FMColumn from "./ui/table/FMColumn";
import FMRow from "./ui/table/FMRow";
import FMTable from "./ui/table/FMTable";
import FMTableHeader from "./ui/table/FMTableHeader";
import FMTableWrapper from "./ui/table/FMTableWrapper";

export default function FilamentsTable({
  data,
}: {
  data: Filament[];
}): ReactNode {
  return (
    <FMTable>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6">
            Name & Color
          </FMColumn>
          <FMColumn>Type</FMColumn>
          <FMColumn className="hidden lg:table-cell">Brand</FMColumn>
          <FMColumn className="hidden lg:table-cell">Material</FMColumn>
          <FMColumn className="hidden lg:table-cell">Diameter</FMColumn>
          <FMColumn>Cost</FMColumn>
          <FMColumn>Weight</FMColumn>
          <FMColumn className="rounded-tr-lg">Models</FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((filament) => (
          <FMRow key={filament.id}>
            <Cell className="relative py-4 pr-3 pl-4 text-sm sm:pl-6">
              <div className="flex items-center gap-x-3">
                <ColorSwatch
                  className="h-8 w-8 flex-shrink-0 rounded-sm shadow-[0_4px_6px_0_rgba(50,50,50,0.25)]"
                  color={filament.color}
                />
                <div className="">
                  <div className="text-md text-foreground justify-end font-bold">
                    {filament.name}
                  </div>
                  <div className="font-medium text-muted-foreground">
                    {filament.color}
                  </div>
                </div>
              </div>
              <div className="mt-1 flex flex-col text-muted-foreground sm:block lg:hidden">
                <span>{filament.brandName}</span>
                <span className="hidden text-muted-foreground/60 sm:inline"> | </span>
                <span>{filament.Material.name}</span>
                <span className="hidden text-muted-foreground/60 sm:inline"> | </span>
                <span>{filament.diameter}mm</span>
              </div>
            </Cell>
            <FMCell>{filament.Type.name}</FMCell>
            <FMCell className="hidden lg:table-cell">
              {filament.brandName}
            </FMCell>
            <FMCell className="hidden lg:table-cell">
              {filament.Material.name}
            </FMCell>
            <FMCell className="hidden lg:table-cell">
              {filament.diameter}mm
            </FMCell>
            <FMCell>
              <div className="sm:hidden">${filament.cost}</div>
              <div className="hidden sm:block">${filament.cost}</div>
            </FMCell>
            <FMCell>
              {filament.grams}g
            </FMCell>
            <FMCell className="relative py-3.5 pr-4 pl-3 text-sm font-medium sm:pr-6">
              <div className="text-muted-foreground">
                {filament.Models && filament.Models.length > 0 ? (
                  <span>
                    {filament.Models.length} model
                    {filament.Models.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>No models</span>
                )}
              </div>
            </FMCell>
          </FMRow>
        ))}
      </TableBody>
    </FMTable>
  );
}
