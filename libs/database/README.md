# Database

This library provides the database schema and client for the eCFR Opportunities project.

## Configuration

The database requires a PostgreSQL connection string in the `DATABASE_URL` environment variable:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

## Commands

```bash
# Generate database migrations (new syntax)
nx run database:db:generate

# Push schema changes to database (new syntax)
nx run database:db:push

# Open database studio UI
nx run database:db:studio
```

## Building

Run `nx build database` to build the library.
