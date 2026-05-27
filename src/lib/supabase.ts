import { createClient } from '@supabase/supabase-js';

// You will need to obtain these from your Supabase project settings
// and store them in a .env.local file at the root of your project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the real supabase client for interacting with authorization and fallback database queries
export const realSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

const LOCAL_PREFIX = 'pe2_curriculum_table_';

// Retrieve data from localStorage sandbox. Seeds from remote database if not yet populated.
export async function getLocalData(tableName: string): Promise<any[]> {
  const key = `${LOCAL_PREFIX}${tableName}`;
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}`, e);
    }
  }

  // Seeding: fetch fresh database records
  try {
    const { data, error } = await realSupabase.from(tableName).select('*');
    if (error) {
      console.warn(`Seeding table '${tableName}' from remote database failed:`, error);
      return [];
    }
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn(`Seeding table '${tableName}' encountered an exception:`, err);
  }
  return [];
}

// Persist mutated data to localStorage sandbox
export function setLocalData(tableName: string, data: any[]) {
  const key = `${LOCAL_PREFIX}${tableName}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Reset client-side database sandbox data
export function resetLocalSandbox() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

class MockQueryBuilder {
  private tableName: string;
  private filters: any[] = [];
  private orderings: any[] = [];
  private limitCount: number | null = null;
  private isSingle = false;
  private isMaybeSingle = false;
  private mutation: { type: string; payload?: any; options?: any } | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    // Fully supports all select actions by passing through the loaded data
    return this;
  }

  insert(values: any) {
    this.mutation = { type: 'insert', payload: values };
    return this;
  }

  update(values: any) {
    this.mutation = { type: 'update', payload: values };
    return this;
  }

  upsert(values: any, options?: any) {
    this.mutation = { type: 'upsert', payload: values, options };
    return this;
  }

  delete() {
    this.mutation = { type: 'delete' };
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const ascending = options?.ascending !== false;
    this.orderings.push({ column, ascending });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async execute() {
    try {
      let data = await getLocalData(this.tableName);

      // Perform filters on loaded data
      for (const filter of this.filters) {
        if (filter.type === 'eq') {
          data = data.filter(item => {
            const val = item[filter.column];
            return String(val) === String(filter.value);
          });
        } else if (filter.type === 'in') {
          const valSet = new Set(filter.values.map(String));
          data = data.filter(item => {
            const val = item[filter.column];
            return valSet.has(String(val));
          });
        }
      }

      // Apply mutations (CRUD writes) locally
      if (this.mutation) {
        const { type, payload, options } = this.mutation;
        let allData = await getLocalData(this.tableName);

        if (type === 'insert') {
          const toInsert = Array.isArray(payload) ? payload : [payload];
          const newRows = toInsert.map(row => {
            const newRow = { ...row };
            if (!newRow.id) {
              newRow.id = typeof self !== 'undefined' && self.crypto?.randomUUID
                ? self.crypto.randomUUID()
                : 'id_' + Math.random().toString(36).substring(2, 15);
            }
            if (!newRow.created_at) {
              newRow.created_at = new Date().toISOString();
            }
            return newRow;
          });
          allData = [...allData, ...newRows];
          setLocalData(this.tableName, allData);
          data = newRows;
        } else if (type === 'update') {
          const updatedRows: any[] = [];
          allData = allData.map(item => {
            let matches = true;
            for (const filter of this.filters) {
              if (filter.type === 'eq') {
                if (String(item[filter.column]) !== String(filter.value)) matches = false;
              } else if (filter.type === 'in') {
                const valSet = new Set(filter.values.map(String));
                if (!valSet.has(String(item[filter.column]))) matches = false;
              }
            }
            if (matches) {
              const updated = { ...item, ...payload };
              updatedRows.push(updated);
              return updated;
            }
            return item;
          });
          setLocalData(this.tableName, allData);
          data = updatedRows;
        } else if (type === 'upsert') {
          const toUpsert = Array.isArray(payload) ? payload : [payload];
          const conflictKeys = options?.onConflict
            ? options.onConflict.split(',').map((k: string) => k.trim())
            : [];

          const upsertedRows: any[] = [];
          for (const row of toUpsert) {
            let matchedIndex = -1;
            if (conflictKeys.length > 0) {
              matchedIndex = allData.findIndex(item =>
                conflictKeys.every(k => String(item[k]) === String(row[k]))
              );
            } else if (row.id) {
              matchedIndex = allData.findIndex(item => String(item.id) === String(row.id));
            }

            const mergedRow = { ...row };
            if (!mergedRow.id) {
              mergedRow.id = typeof self !== 'undefined' && self.crypto?.randomUUID
                ? self.crypto.randomUUID()
                : 'id_' + Math.random().toString(36).substring(2, 15);
            }
            if (!mergedRow.created_at) {
              mergedRow.created_at = new Date().toISOString();
            }

            if (matchedIndex !== -1) {
              allData[matchedIndex] = { ...allData[matchedIndex], ...mergedRow };
              upsertedRows.push(allData[matchedIndex]);
            } else {
              allData.push(mergedRow);
              upsertedRows.push(mergedRow);
            }
          }
          setLocalData(this.tableName, allData);
          data = upsertedRows;
        } else if (type === 'delete') {
          const remainingRows: any[] = [];
          const deletedRows: any[] = [];
          allData.forEach(item => {
            let matches = true;
            for (const filter of this.filters) {
              if (filter.type === 'eq') {
                if (String(item[filter.column]) !== String(filter.value)) matches = false;
              } else if (filter.type === 'in') {
                const valSet = new Set(filter.values.map(String));
                if (!valSet.has(String(item[filter.column]))) matches = false;
              }
            }
            if (matches) {
              deletedRows.push(item);
            } else {
              remainingRows.push(item);
            }
          });
          setLocalData(this.tableName, remainingRows);
          data = deletedRows;
        }
      }

      // Apply sorting
      if (this.orderings.length > 0) {
        data = [...data].sort((a, b) => {
          for (const order of this.orderings) {
            const valA = a[order.column];
            const valB = b[order.column];
            if (valA === undefined || valB === undefined) continue;

            const comparison = typeof valA === 'string'
              ? valA.localeCompare(String(valB))
              : Number(valA) - Number(valB);

            if (comparison !== 0) {
              return order.ascending ? comparison : -comparison;
            }
          }
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount);
      }

      // Implement client-side relational joins
      if (this.tableName === 'audit_logs') {
        const profiles = await getLocalData('profiles');
        data = data.map(item => {
          const matchedActor = profiles.find(p => p.id === item.actor_id);
          return {
            ...item,
            actor: matchedActor ? { name: matchedActor.name, email: matchedActor.email, role: matchedActor.role } : null
          };
        });
      } else if (this.tableName === 'faculty_overseen_programs') {
        const programs = await getLocalData('programs');
        data = data.map(item => {
          const matchedProgram = programs.find(p => p.id === item.program_id);
          return {
            ...item,
            programs: matchedProgram ? { id: matchedProgram.id, code: matchedProgram.code, name: matchedProgram.name } : null
          };
        });
      }

      // Handle single / maybeSingle return types
      if (this.isSingle) {
        if (data.length === 0) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: data[0], error: null };
      }

      if (this.isMaybeSingle) {
        return { data: data.length > 0 ? data[0] : null, error: null };
      }

      return { data, error: null };
    } catch (err: any) {
      console.error(`MockQueryBuilder error on table '${this.tableName}':`, err);
      return { data: null, error: { message: err?.message || String(err) } };
    }
  }

  // Promise-like behavior (then, catch, finally)
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any) {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: () => void) {
    return this.execute().finally(onfinally);
  }
}

// Export proxied client to intercept table queries (.from()) while keeping other functionality intact
export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return (tableName: string) => {
        return new MockQueryBuilder(tableName);
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}) as unknown as typeof realSupabase;
