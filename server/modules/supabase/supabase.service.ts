import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://woemeffuldsgpggsxtrv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CGTJm73gscLpvlYf7fs56w_NUO96Y2Z';

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text,
  priority text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
`;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  public client: SupabaseClient;
  private tableReady = false;

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureTable();
    } catch (error) {
      this.logger.warn('无法自动创建 tasks 表，请手动执行建表 SQL', error);
    }
  }

  private async ensureTable(): Promise<void> {
    if (this.tableReady) return;

    try {
      const { error } = await this.client.from('tasks').select('id').limit(1);
      if (!error) {
        this.tableReady = true;
        return;
      }
      if (error.code !== '42P01' && !error.message.includes('does not exist')) {
        throw error;
      }
    } catch (error) {
      this.logger.warn('检测 tasks 表失败，尝试自动创建', error);
    }

    try {
      const { error } = await this.client.rpc('exec_sql', { sql: CREATE_TABLE_SQL });
      if (error) {
        throw error;
      }
      this.tableReady = true;
      this.logger.log('tasks 表创建成功');
    } catch (createError) {
      this.logger.warn(
        '自动建表失败（anon key 无 DDL 权限属正常现象）。请在 Supabase SQL Editor 中执行以下 SQL 建表：\n' +
          CREATE_TABLE_SQL +
          '\n如需开启匿名读写，还需执行：\n' +
          'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;\n' +
          'CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);\n' +
          'CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);\n' +
          'CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);\n' +
          'CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);',
      );
      throw createError;
    }
  }

  isTableReady(): boolean {
    return this.tableReady;
  }

  getCreateTableSql(): string {
    return CREATE_TABLE_SQL;
  }
}
