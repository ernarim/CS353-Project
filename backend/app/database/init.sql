DO $$
BEGIN

    -- DECLARE
    --     r RECORD;
    -- BEGIN
    --     -- Loop through each table in the public schema and drop it
    --     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    --     LOOP
    --         EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE;';
    --     END LOOP;
    -- END;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Cart' OR table_name = 'cart'

    ) THEN
        CREATE TABLE Cart (
            cart_id UUID,
            is_gift BOOLEAN  DEFAULT FALSE,
            PRIMARY KEY (cart_id)
        );

        RAISE NOTICE 'Table ''Cart'' created successfully.';
    ELSE
        RAISE NOTICE 'Table ''Cart'' already exists. Skipping creation.';
    END IF;




    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Users' OR table_name = 'users'
    ) THEN
        CREATE TABLE Users (
            user_id UUID PRIMARY KEY,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(15),
            last_login TIMESTAMP
        );
        RAISE NOTICE 'Table ''Users'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Ticket_Buyer' OR table_name = 'ticket_buyer'
    ) THEN
        CREATE TABLE Ticket_Buyer (
            user_id UUID,
            name VARCHAR(255) NOT NULL,
            surname VARCHAR(255) NOT NULL,
            balance DECIMAL(10, 2) DEFAULT 0.0 CHECK(balance >= 0),
            birth_date DATE NOT NULL,
            current_cart UUID,
            PRIMARY KEY (user_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (current_cart) REFERENCES Cart(cart_id)
        );

        RAISE NOTICE 'Table ''Ticket_Buyer'' created successfully.';
    END IF;

    DROP TABLE IF EXISTS Admin CASCADE;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Admin' OR table_name = 'admin'
    ) THEN
        CREATE TABLE Admin (
            user_id UUID,
            PRIMARY KEY (user_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        );

        RAISE NOTICE 'Table ''Admin'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND (table_name = 'Event_Category' OR table_name = 'event_category')
    ) THEN
        -- Create the Event_Category table
        CREATE TABLE public.Event_Category (
            category_id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Insert default categories
        INSERT INTO public.Event_Category (category_id, name) VALUES
        (uuid_generate_v4(), 'Music'),
        (uuid_generate_v4(), 'Sports'),
        (uuid_generate_v4(), 'Theater'),
        (uuid_generate_v4(), 'Conference'),
        (uuid_generate_v4(), 'Comedy'),
        (uuid_generate_v4(), 'Dance'),
        (uuid_generate_v4(), 'Festival'),
        (uuid_generate_v4(), 'Food & Drink');

        -- Raise a notice to indicate success
        RAISE NOTICE 'Table ''Event_Category'' created successfully and default categories inserted.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Venue' OR table_name = 'venue'
    ) THEN
        CREATE TABLE Venue (
            venue_id UUID,
            requester_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            state VARCHAR(255) NOT NULL,
            street VARCHAR(255),
            status VARCHAR(255) DEFAULT 'pending',
            capacity INT,
            row_count INT,
            column_count INT,
            PRIMARY KEY (venue_id)
        );

        RAISE NOTICE 'Table ''Venue'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Event_Organizer' OR table_name = 'event_organizer'
    ) THEN
        CREATE TABLE Event_Organizer(
            user_id UUID,
            organizer_name VARCHAR(255)NOT NULL UNIQUE,
            balance DECIMAL(15, 2) DEFAULT 0.0 CHECK(balance >= 0),
            PRIMARY KEY (user_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        );


        RAISE NOTICE 'Table ''Event_Organizer'' created successfully.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Event' OR table_name = 'event'
    ) THEN
        CREATE TABLE Event (
            event_id UUID,
            name VARCHAR(255) NOT NULL,
            date TIMESTAMP NOT NULL,
            description TEXT NOT NULL,
            is_done BOOLEAN NOT NULL DEFAULT FALSE,
            is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
            remaining_seat_no INT,
            return_expire_date DATE,
            organizer_id UUID NOT NULL,
            venue_id UUID,
            category_id UUID NOT NULL,
            photo VARCHAR(255),
            photo_plan VARCHAR(255),
            PRIMARY KEY(event_id),
            FOREIGN KEY(category_id) REFERENCES Event_Category(category_id),
            FOREIGN KEY(venue_id) REFERENCES Venue(venue_id),
            FOREIGN KEY(organizer_id) REFERENCES Event_Organizer(user_id)
        );

        RAISE NOTICE 'Table ''Event'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Ticket' OR table_name = 'ticket'
    ) THEN
        CREATE TABLE Ticket (
            ticket_id UUID,
            is_sold BOOLEAN DEFAULT FALSE,
            event_id UUID NOT NULL,
            PRIMARY KEY (ticket_id),
            FOREIGN KEY (event_id) REFERENCES Event(event_id)
        );
        RAISE NOTICE 'Table ''Ticket'' created successfully.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Added' OR table_name = 'added'
    ) THEN
        CREATE TABLE Added (
            cart_id UUID,
            ticket_id UUID,
            PRIMARY KEY(cart_id, ticket_id),
            FOREIGN KEY(cart_id) REFERENCES Cart(cart_id),
            FOREIGN KEY(ticket_id) REFERENCES Ticket(ticket_id)
        );

        RAISE NOTICE 'Table ''Added'' created successfully.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Transaction' OR table_name = 'transaction'
    ) THEN
        CREATE TABLE Transaction (
            transaction_id UUID,
            organizer_id UUID,
            buyer_id UUID,
            transaction_date TIMESTAMP,
            amount DECIMAL(10, 2),
            event_id UUID,
            PRIMARY KEY (transaction_id),
            FOREIGN KEY (organizer_id) REFERENCES Event_Organizer(user_id),
            FOREIGN KEY (buyer_id) REFERENCES Ticket_Buyer(user_id),
            FOREIGN KEY (event_id) REFERENCES Event(event_id)
        );

        RAISE NOTICE 'Table ''Transaction'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Ticket_Category' OR table_name = 'ticket_category'
    ) THEN
        CREATE TABLE Ticket_Category (
            event_id UUID NOT NULL,
            category_name VARCHAR(255)NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            color VARCHAR(255),
            PRIMARY KEY (event_id, category_name),
            FOREIGN KEY(event_id) REFERENCES Event(event_id)
        );
        RAISE NOTICE 'Table ''Ticket_Category'' created successfully.';
    END IF;




    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Restriction' OR table_name = 'restriction'
    ) THEN
        CREATE TABLE Restriction(
            restriction_id UUID,
            alcohol BOOLEAN DEFAULT TRUE,
            smoke BOOLEAN DEFAULT TRUE,
            age INT,
            max_ticket INT,
            PRIMARY KEY (restriction_id)
        );
        RAISE NOTICE 'Table ''Restriction'' created successfully.';

    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Report' OR table_name = 'report'
    ) THEN
        CREATE TABLE Report (
            report_id UUID,
            date TIMESTAMP,
            organizer_id UUID,
            organizer_statistics JSONB,
            participant_statistics JSONB,
            age_statistics JSONB,
            revenue_statistics JSONB,
            PRIMARY KEY (report_id),
            FOREIGN KEY (organizer_id) REFERENCES Event_Organizer(user_id)

            );

        RAISE NOTICE 'Table ''Report'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Gift' OR table_name = 'gift'
    ) THEN
        CREATE TABLE Gift (
            gift_id UUID,
            gift_msg TEXT,
            gift_date TIMESTAMP,
            receiver_mail VARCHAR(255) NOT NULL,
            PRIMARY KEY (gift_id)
        );

        RAISE NOTICE 'Table ''Gift'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Seating_Plan' OR table_name = 'seating_plan'
    ) THEN
        CREATE TABLE Seating_Plan(
            event_id UUID,
            ticket_id UUID,
            category_name VARCHAR(255),
            row_number INT NOT NULL,
            column_number INT NOT NULL,
            is_available BOOLEAN DEFAULT TRUE,
            is_reserved BOOLEAN DEFAULT FALSE,
            last_reserver UUID,
            PRIMARY KEY (ticket_id),
            FOREIGN KEY(event_id) REFERENCES Event(event_id),
            FOREIGN KEY(event_id, category_name) REFERENCES Ticket_Category(event_id, category_name),
            FOREIGN KEY(ticket_id) REFERENCES Ticket(ticket_id)
        );
        RAISE NOTICE 'Table ''Seating_Plan'' created successfully.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Seats' OR table_name = 'seats'
    ) THEN
        CREATE TABLE Seats(
            row_number INT,
            column_number INT,
            venue_id UUID,
            PRIMARY KEY (venue_id, row_number, column_number),
            FOREIGN KEY (venue_id) REFERENCES Venue(venue_id)
        );
        RAISE NOTICE 'Table ''Seats'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Gifted' OR table_name = 'gifted'
    ) THEN
        CREATE TABLE Gifted(
            gift_id UUID,
            cart_id UUID,
            PRIMARY KEY(gift_id, cart_id),
            FOREIGN KEY(gift_id) REFERENCES Gift(gift_id),
            FOREIGN KEY(cart_id) REFERENCES Cart(cart_id)
        );
        RAISE NOTICE 'Table ''Gifted'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Owned' OR table_name = 'owned'
    ) THEN
        CREATE TABLE Owned (
            user_id UUID,
            cart_id UUID,
            PRIMARY KEY (user_id, cart_id),
            FOREIGN KEY (user_id) REFERENCES Ticket_Buyer(user_id),
            FOREIGN KEY (cart_id) REFERENCES Cart(cart_id)
        );

        RAISE NOTICE 'Table ''Owned'' created successfully.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Restricted' OR table_name = 'restricted'
    ) THEN
        CREATE TABLE Restricted(
            restriction_id UUID,
            event_id UUID,
            PRIMARY KEY(restriction_id, event_id),
            FOREIGN KEY(restriction_id) REFERENCES Restriction(restriction_id),
            FOREIGN KEY(event_id) REFERENCES Event(event_id)
        );
        RAISE NOTICE 'Table ''Restricted'' created successfully.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Ticket_List' OR table_name = 'ticket_list'
    ) THEN
        CREATE TABLE Ticket_List(
            user_id UUID,
            ticket_id UUID,
            PRIMARY KEY(user_id, ticket_id),
            FOREIGN KEY(user_id) REFERENCES Ticket_Buyer(user_id),
            FOREIGN KEY(ticket_id) REFERENCES Ticket(ticket_id)
        );

        RAISE NOTICE 'Table ''Ticket_List'' created successfully.';
    END IF;

    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    INSERT INTO Users (user_id, email, password)
    VALUES (
        gen_random_uuid(),
        'admin',
        crypt('admin', gen_salt('bf'))

    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO Admin (user_id)
    SELECT user_id FROM Users WHERE email = 'admin';


END $$;


