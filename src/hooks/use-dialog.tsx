import { useContext } from "react";

import { DialogContext, type DialogComponents, type DialogState } from "@/context/dialog";

export const useDialog = <D extends DialogComponents = DialogComponents>() => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context as unknown as DialogState<D>;
};

