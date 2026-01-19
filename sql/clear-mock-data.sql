-- Clear mock/test data from the database
-- WARNING: This will delete all data. Use with caution!

-- Delete all messages
DELETE FROM messages;

-- Delete all reviews
DELETE FROM reviews;

-- Delete all portfolio items
DELETE FROM portfolio;

-- Delete all services
DELETE FROM services;

-- Delete all agencies
DELETE FROM agencies;

-- Reset sequences (optional, but helps keep IDs clean)
-- Note: Only run these if you want to reset auto-increment IDs
-- ALTER SEQUENCE agencies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE services_id_seq RESTART WITH 1;
-- ALTER SEQUENCE portfolio_id_seq RESTART WITH 1;
-- ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
-- ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM agencies) as agencies_count,
  (SELECT COUNT(*) FROM services) as services_count,
  (SELECT COUNT(*) FROM portfolio) as portfolio_count,
  (SELECT COUNT(*) FROM reviews) as reviews_count,
  (SELECT COUNT(*) FROM messages) as messages_count;
