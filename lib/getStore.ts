import { CrmStore } from "./storeTypes";
import { MemoryStore } from "./memoryStore";

declare global {
  // eslint-disable-next-line no-var
  var __mcCrmStore: CrmStore | undefined;
}

export function getStore(): CrmStore {
  if (global.__mcCrmStore) return global.__mcCrmStore;

  const url = process.env.DATABASE_URL;
  if (url) {
    // Lazy require so the pg dependency / schema file is only touched
    // when a real Postgres connection string is configured.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PgStore } = require("./pgStore");
    global.__mcCrmStore = new PgStore(url);
  } else {
    global.__mcCrmStore = new MemoryStore();
  }
  return global.__mcCrmStore;
}

export function isUsingPostgres() {
  return Boolean(process.env.DATABASE_URL);
}
