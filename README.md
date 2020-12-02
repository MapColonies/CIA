# CIA
Central ID Allocation service

## Configuration
Copy `.env.example` to `.env` and set your applications settings
* `SERVER_PORT` - application port e.g. `1337`
* `HOST` - hostname e.g. `http://localhost`
* `NODE_ENV` - `development` or `production`

Copy `ormconfig.env.example` to `ormconfig.env` and modify the environment variables to fit your Postgresql DB instance, see [ormconfig.env](https://typeorm.io/#/using-ormconfig/using-environment-variables)
* `TYPEORM_CONNECTION` - DB type, currently only `postgres` is supported
* `TYPEORM_HOST` - e.g. `localhost`
* `TYPEORM_USERNAME` - e.g. `postgres`
* `TYPEORM_PASSWORD` - e.g. `Aa123456`
* `TYPEORM_DATABASE` - e.g. `postgres`
* `TYPEORM_PORT` - e.g. `5432`
