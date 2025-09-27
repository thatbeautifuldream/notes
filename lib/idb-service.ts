import Dexie, { type Table } from "dexie";

type TEventCallback = (...args: unknown[]) => void;

class EventEmitter {
  private events: Record<string, TEventCallback[]> = {};

  on(event: string, callback: TEventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  off(event: string, callback: TEventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: unknown[]) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(...args));
  }
}

export const appEventEmitter = new EventEmitter();

export type TBaseRecord = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  size?: number;
};

export type TStoredRecord<TContent = unknown> = TBaseRecord & {
  content: TContent;
};

export type TRecord<TContent = unknown> = Omit<
  TStoredRecord<TContent>,
  "createdAt" | "updatedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
};

export class IdbDatabase<TContent> extends Dexie {
  records!: Table<TStoredRecord<TContent>>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      records: "id, name, createdAt, updatedAt",
    });
  }
}

export class IdbService<TContent> {
  private db: IdbDatabase<TContent>;

  constructor(dbName: string) {
    this.db = new IdbDatabase<TContent>(dbName);
  }

  private toEntity(stored: TStoredRecord<TContent>): TRecord<TContent> {
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
    };
  }

  private toStored(entity: TRecord<TContent>): TStoredRecord<TContent> {
    return {
      ...entity,
      createdAt: entity.createdAt.getTime(),
      updatedAt: entity.updatedAt.getTime(),
    };
  }

  async init(): Promise<void> {
    await this.db.open();
  }

  async save(entity: TRecord<TContent>): Promise<void> {
    await this.db.records.put(this.toStored(entity));
    appEventEmitter.emit("record-saved", entity.id);
  }

  async get(id: string): Promise<TRecord<TContent> | null> {
    const stored = await this.db.records.get(id);
    return stored ? this.toEntity(stored) : null;
  }

  async getAll(): Promise<TRecord<TContent>[]> {
    const stored = await this.db.records
      .orderBy("updatedAt")
      .reverse()
      .toArray();
    return stored.map((s) => this.toEntity(s));
  }

  async delete(id: string): Promise<void> {
    await this.db.records.delete(id);
    appEventEmitter.emit("record-deleted", id);
  }

  async update(
    id: string,
    update: Partial<TStoredRecord<TContent>>
  ): Promise<void> {
    const updateData: any = {
      ...update,
      updatedAt: Date.now(),
    };
    const result = await this.db.records.update(id, updateData);
    if (result === 0) throw new Error("Record not found");
    appEventEmitter.emit("record-updated", id);
  }

  async search(query: string): Promise<TRecord<TContent>[]> {
    const lower = query.toLowerCase();
    const stored = await this.db.records
      .filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          String(e.content).toLowerCase().includes(lower)
      )
      .sortBy("updatedAt");
    return stored.reverse().map((s) => this.toEntity(s));
  }
}