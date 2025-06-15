-- Create functions for payment handling
CREATE OR REPLACE FUNCTION handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into payment status history
    INSERT INTO payment_status_history (payment_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);

    -- Update mass intention status when payment is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE mass_intentions
        SET status = 'confirmed'
        WHERE id = NEW.order_id::uuid;
    END IF;

    -- Update mass intention status when payment fails
    IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        UPDATE mass_intentions
        SET status = 'pending'
        WHERE id = NEW.order_id::uuid;
    END IF;

    -- Update mass intention status when payment is refunded
    IF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
        UPDATE mass_intentions
        SET status = 'cancelled'
        WHERE id = NEW.order_id::uuid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_status_change_trigger
    AFTER UPDATE OF status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION handle_payment_status_change();

-- Create function for checking mass intention availability
CREATE OR REPLACE FUNCTION check_mass_intention_availability(
    church_id_param uuid,
    date_param date,
    time_param time
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_count integer;
BEGIN
    SELECT COUNT(*)
    INTO existing_count
    FROM mass_intentions
    WHERE church_id = church_id_param
    AND date = date_param
    AND time = time_param
    AND status NOT IN ('cancelled');

    RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function for mass intention statistics
CREATE OR REPLACE FUNCTION get_mass_intention_stats(
    church_id_param uuid,
    start_date date,
    end_date date
)
RETURNS TABLE (
    total_intentions bigint,
    confirmed_intentions bigint,
    pending_intentions bigint,
    total_amount numeric,
    avg_amount numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(mi.id) as total_intentions,
        COUNT(mi.id) FILTER (WHERE mi.status = 'confirmed') as confirmed_intentions,
        COUNT(mi.id) FILTER (WHERE mi.status = 'pending') as pending_intentions,
        COALESCE(SUM(p.amount), 0) as total_amount,
        COALESCE(AVG(p.amount), 0) as avg_amount
    FROM mass_intentions mi
    LEFT JOIN payments p ON p.order_id = mi.id
    WHERE mi.church_id = church_id_param
    AND mi.date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Create function for payment analytics
CREATE OR REPLACE FUNCTION get_payment_analytics(
    start_date timestamp,
    end_date timestamp
)
RETURNS TABLE (
    date date,
    total_amount numeric,
    successful_count bigint,
    failed_count bigint,
    success_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('day', created_at)::date as date,
        SUM(amount) FILTER (WHERE status = 'completed') as total_amount,
        COUNT(*) FILTER (WHERE status = 'completed') as successful_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
            NULLIF(COUNT(*), 0)::numeric) * 100, 
            2
        ) as success_rate
    FROM payments
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('day', created_at)::date
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Create notification function
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    church_record RECORD;
    intention_record RECORD;
BEGIN
    -- Get associated records
    SELECT * INTO intention_record 
    FROM mass_intentions 
    WHERE id = NEW.order_id::uuid;

    SELECT * INTO user_record 
    FROM users 
    WHERE id = intention_record.user_id;

    SELECT * INTO church_record 
    FROM churches 
    WHERE id = intention_record.church_id;

    -- Insert notification task for background processing
    INSERT INTO notification_queue (
        user_id,
        type,
        payload
    ) VALUES (
        user_record.id,
        CASE 
            WHEN NEW.status = 'completed' THEN 'payment_success'
            WHEN NEW.status = 'failed' THEN 'payment_failed'
            WHEN NEW.status = 'refunded' THEN 'payment_refunded'
            ELSE 'payment_update'
        END,
        jsonb_build_object(
            'payment_id', NEW.id,
            'status', NEW.status,
            'amount', NEW.amount,
            'church_name', church_record.name,
            'intention_date', intention_record.date,
            'intention_time', intention_record.time
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_notification_trigger
    AFTER UPDATE OF status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_status_change();
