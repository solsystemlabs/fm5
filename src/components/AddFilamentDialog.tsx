import type { ReactNode } from "react";
import FMModal from "./FMModal";

type AddFilamentDialogProps = {
  triggerElement: ReactNode;
};

export default function AddFilamentDialog({
  triggerElement,
}: AddFilamentDialogProps): ReactNode {
  return (
    <FMModal
      triggerElement={triggerElement}
      title="Add Filament"
      description="Create a new filament entry for your 3D printing inventory."
      primaryAction={{
        label: "Add Filament",
        onPress: () => {
          // TODO: Implement form submission
          console.log("Add filament form submission");
        },
      }}
      secondaryAction={{
        label: "Cancel",
      }}
    >
      {/* TODO: Add form fields here */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Form fields will be added here.
      </div>
    </FMModal>
  );
}
