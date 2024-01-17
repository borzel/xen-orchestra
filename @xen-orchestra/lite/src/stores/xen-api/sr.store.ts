import { useXenApiStoreSubscribableContext } from "@/composables/xen-api-store-subscribable-context.composable";
import { createUseCollection } from "@/stores/xen-api/create-use-collection";
import { defineStore } from "pinia";

export const useSrStore = defineStore("xen-api-sr", () => {
  const context =  useXenApiStoreSubscribableContext("sr");

  return {
    ...context
  };
});

export const useSrCollection = createUseCollection(useSrStore);
