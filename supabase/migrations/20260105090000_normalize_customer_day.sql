-- Normalize customer service day: Workshop is a type, not a service day.
UPDATE customers
SET day = NULL
WHERE day = 'Workshop';

ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_day_check;

ALTER TABLE customers
ADD CONSTRAINT customers_day_check
CHECK (
  day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  OR day IS NULL
);
