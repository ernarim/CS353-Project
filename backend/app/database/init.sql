DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'item'
    ) THEN
        CREATE TABLE item (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            tax NUMERIC(10, 2) NOT NULL
        );
        RAISE NOTICE 'Table ''item'' created successfully.';
    ELSE
        -- Print a message if the table already exists
        RAISE NOTICE 'Table ''item'' already exists. Skipping creation.';
    END IF;
END $$;