# CIA
Central ID Allocation service

## Usage
To run this service locally use `npm start`. To run in a container
```shell
git clone git@github.com:MapColonies/CIA.git
cd CIA
docker build -t cia:latest .
docker run -p 8080:8080 --rm -it --env-file ./ormconfig.prod.env cia:latest
```

## Configuration
### Local (Dev) Deployment
Copy `.env.example` to `.env` and set your applications settings to the following environment variables
* `SERVER_PORT` - application port e.g. `8080`
* `HOST` - hostname e.g. `http://localhost`
* `NODE_ENV` - `development` or `production`

The following environment variables are optional settings for the application
* `CORE_IDS_RANGES_SIZES_SMALL` - definition of a small IDs allocation range e.g. `1000`
* `CORE_IDS_RANGES_SIZES_MEDIUM` - definition of a medium IDs allocation range e.g. `1000000`
* `CORE_IDS_RANGES_SIZES_LARGE` - definition of a large IDs allocation range e.g. `1000000000`

Edit `ormconfig.json` and modify the environment variables to fit your connection parameters to Postgresql DB instance, see [ormconfig.env](https://typeorm.io/#/using-ormconfig/using-environment-variables) for more info.
* `TYPEORM_CONNECTION` - DB type, currently only `postgres` is supported
* `TYPEORM_HOST` - e.g. `localhost`
* `TYPEORM_USERNAME` - e.g. `postgres`
* `TYPEORM_PASSWORD` - e.g. `Aa123456`
* `TYPEORM_DATABASE` - e.g. `postgres`
* `TYPEORM_PORT` - e.g. `5432`

### Production Deployment
Set environment variables as above and copy `ormconfig.prod.env.example` to `ormconfig.prod.env` and pass it to `docker run` as in [Usage](#Usage).

## Migrations
Please follow best practices when writing and deploying migrations. Please use [these](http://ryanogles.by/database-migrations-best-practices/) best practices on how to commit migrations to source control.

In order to generate a migration file through TypeORM update your [entity](https://typeorm.io/#/entities) file and run `npm run typeorm:migrate <MIGRATE-NAME>` (Replace `<MIGRATE-NAME>` with a name for your migration). This will generate a migration file, please check this file in the `migration` directory. Notice that the generated migration is the outcome of comparing the current entities to the schema in the DB, you must run the application or `npm run typeorm:run` in order for the DB to catch up the migrations.

If you would like to create a migration file by yourself run `npm run typeorm:create <MIGRATE-NAME>` (Replace `<MIGRATE-NAME>` with a name for your migration). This will create an empty migration file template where you need to implement the up and down functions, [see more](https://typeorm.io/#/migrations/creating-a-new-migration). If you prefer using this approach you must update your entities as well.

You can also run migrations mannualy using `npm run typeorm:run`. This will run all migrations files. To revert changes run `npm run typeorm:revert`. This will revert only the latest migration. In order to revert multiple migrations call this command multiple times.