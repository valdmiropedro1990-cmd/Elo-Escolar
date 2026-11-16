import { createClient } from '@supabase/supabase-js';
import { getMockStore, saveMockStore, MockStore } from './mock-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isRealSupabase = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

// Real Supabase client if configured
const realClient = isRealSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Mock chainable query builder that responds in 0ms with local Angola data
class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol?: string;
  private ascending: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any = null;
  private countMode?: string;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    this.operation = 'select';
    if (options?.count) this.countMode = options.count;
    return this;
  }

  insert(data: any | any[]) {
    this.operation = 'insert';
    this.payload = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => String(item[column]) === String(value));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => String(item[column]) !== String(value));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.ascending = options?.ascending ?? true;
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

  async then(resolve: (result: { data: any; error: any; count?: number }) => void) {
    const store = getMockStore();
    const list: any[] = (store as any)[this.table] || [];

    if (this.operation === 'insert') {
      const newItems = this.payload.map((item: any) => ({
        id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        ...item
      }));
      (store as any)[this.table] = [...list, ...newItems];
      saveMockStore(store);
      return resolve({ data: this.isSingle ? newItems[0] : newItems, error: null, count: newItems.length });
    }

    if (this.operation === 'update') {
      let updatedCount = 0;
      const updatedList = list.map((item) => {
        const matches = this.filters.every((f) => f(item));
        if (matches) {
          updatedCount++;
          return { ...item, ...this.payload };
        }
        return item;
      });
      (store as any)[this.table] = updatedList;
      saveMockStore(store);
      return resolve({ data: this.payload, error: null, count: updatedCount });
    }

    if (this.operation === 'delete') {
      const remaining = list.filter((item) => !this.filters.every((f) => f(item)));
      (store as any)[this.table] = remaining;
      saveMockStore(store);
      return resolve({ data: null, error: null, count: list.length - remaining.length });
    }

    // Default: 'select'
    let result = [...list];
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.ascending ? 1 : -1;
      result.sort((a, b) => {
        if (a[col] > b[col]) return asc;
        if (a[col] < b[col]) return -asc;
        return 0;
      });
    }

    const totalCount = result.length;
    if (this.limitCount && this.limitCount > 0) {
      result = result.slice(0, this.limitCount);
    }

    const finalData = this.isSingle ? (result[0] || null) : result;
    return resolve({ data: finalData, error: null, count: totalCount });
  }
}

// Mock Supabase wrapper
const mockClient: any = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('elo_escolar_user');
        localStorage.removeItem('elo_escolar_demo');
      }
      return { error: null };
    },
    signInWithPassword: async ({ email }: { email: string }) => {
      const user = {
        id: 'demo-admin',
        email: email || 'admin@eloescolar.ao',
        user_metadata: { full_name: 'Administrador Geral' }
      };
      return { data: { user, session: { user } }, error: null };
    },
    signUp: async ({ email, options }: any) => {
      const user = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: options?.data || { full_name: 'Novo Utilizador' }
      };
      return { data: { user, session: { user } }, error: null };
    },
    signInWithOAuth: async () => {
      return { error: null };
    }
  }
};

export const supabase = realClient || mockClient;
