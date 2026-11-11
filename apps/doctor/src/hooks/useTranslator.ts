import { useSyncExternalStore } from "react";
import translator from "@healthcare-platform/translator";

const subscribe = (onStoreChange: () => void) => {
  translator.on("languageChanged", onStoreChange);
  return () => translator.off("languageChanged", onStoreChange);
};

const getSnapshot = () => translator.language;

export function useTranslator() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return translator.t.bind(translator);
}
