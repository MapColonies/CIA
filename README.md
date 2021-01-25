# CIA
Central IDs Allocation service, used to allocate IDs to OSM elements (Nodes, Ways and Relations) and OSM intristic properties that need distinct IDs ranges, such as Changesets.

## Usage
### Quick Start
To run this service locally use `npm start`. To run in a container
```shell
git clone git@github.com:MapColonies/CIA.git
cd CIA
docker build -t mapcolonies/cia:latest .
docker run -p 8080:8080 --rm -it --env-file ./ormconfig.prod.env mapcolonies/cia:latest
```

### Configuration
Set the following environment variables
* `SERVER_PORT` - application port e.g. `8080`
* `DB_TYPE` - DB type, currently only `postgres` is supported
* `DB_HOST` - e.g. `localhost`
* `DB_USERNAME` - e.g. `postgres`
* `DB_PASSWORD` - e.g. `1234`
* `DB_NAME` - e.g. `cia`
* `DB_PORT` - e.g. `5432`

The following environment variables are optional
* `CORE_IDS_RANGES_SIZES_SMALL` - definition of a small IDs allocation range e.g. `1000`
* `CORE_IDS_RANGES_SIZES_MEDIUM` - definition of a medium IDs allocation range e.g. `1000000`
* `CORE_IDS_RANGES_SIZES_LARGE` - definition of a large IDs allocation range e.g. `1000000000`

## Migrations
Please follow best practices when writing and deploying migrations. Please use [these](http://ryanogles.by/database-migrations-best-practices/) best practices on how to commit migrations to source control.

In order to generate a migration file through TypeORM update your [entity](https://typeorm.io/#/entities) file and run `npm run typeorm:generate <MIGRATE-NAME>` (Replace `<MIGRATE-NAME>` with a name for your migration). This will generate a migration file, please check this file in the `migration` directory. Notice that the generated migration is the outcome of comparing the current entities to the schema in the DB. Run `npm run typeorm:run` for the DB to catch up all pending migrations. Run `npm run typeorm:revert` to revert the latest migration. To revert multiple migrations, call `npm run typeorm:revert` multiple times.

If you would like to create a migration file by yourself run `npm run typeorm:create <MIGRATE-NAME>` (Replace `<MIGRATE-NAME>` with a name for your migration). This will create an empty migration file template where you need to implement the up and down functions, [see more](https://typeorm.io/#/migrations/creating-a-new-migration). If you prefer using this approach you must update your entities as well.