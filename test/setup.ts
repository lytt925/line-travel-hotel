import { DataSource } from 'typeorm';
import { MySqlContainer } from '@testcontainers/mysql';

global.mysql = null;
global.datasource = null;

const initMysql = async () => {
  const mysql = await new MySqlContainer('mysql:8.0')
    .withDatabase('e2e_test')
    .withUsername('testuser')
    .withUserPassword('testpassword')
    .start();

  global.mysql = mysql;

  process.env.DB_HOST = mysql.getHost();
  process.env.MYSQL_PORT = mysql.getPort().toString();
  process.env.MYSQL_USER = mysql.getUsername();
  process.env.MYSQL_PASSWORD = mysql.getUserPassword();
  process.env.MYSQL_DATABASE = mysql.getDatabase();

  const datasource = await getDatasource();
  await datasource.runMigrations();
  console.log('MySQL initialized');
};

export default async () => {
  await initMysql();
};

export const getDatasource = async (): Promise<DataSource> => {
  if (global.datasource) {
    return global.datasource;
  }

  const datasource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    entities: ['src/**/*.entity.ts'],
    migrations: ['test/seeds/*.ts'],
    synchronize: true,
    logging: false,
  });

  global.datasource = datasource;
  await datasource.initialize();
  return datasource;
};
