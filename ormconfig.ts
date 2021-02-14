import config from 'config';
import { ConnectionOptions } from 'typeorm';

const connectionOptions = config.get<ConnectionOptions>('db');

module.exports = {
  ...connectionOptions,
  entities: ['src/core/models/*.ts'],
  migrationsTableName: 'requests_migration_table',
  migrations: ['db/migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations',
  },
};
