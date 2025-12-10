-- Check transaction types
SELECT type, COUNT(*) as count, SUM(amount) as total_amount 
FROM transactions 
WHERE status = 'approved'
GROUP BY type;

-- Check income transactions
SELECT id, type, amount, category, description, date 
FROM transactions 
WHERE type = 'income' AND status = 'approved'
ORDER BY date DESC
LIMIT 20;

-- Check expense transactions  
SELECT id, type, amount, category, description, date 
FROM transactions 
WHERE type = 'expense' AND status = 'approved'
ORDER BY date DESC
LIMIT 20;
