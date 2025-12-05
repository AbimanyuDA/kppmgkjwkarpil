-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Administrator',
    'admin@gkjw.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample member user (password: member123)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Member Perkap',
    'member@gkjw.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'member'
) ON CONFLICT (email) DO NOTHING;
