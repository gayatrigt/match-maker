-- Drop existing table if it exists
DROP TABLE IF EXISTS leaderboard;

-- Create the leaderboard table
CREATE TABLE leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    score INTEGER NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    achievement_nft_minted BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on score for faster leaderboard queries
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Create an index on XP for faster leaderboard queries
CREATE INDEX idx_leaderboard_xp ON leaderboard(xp DESC);

-- Create an index on wallet_address for faster lookups
CREATE INDEX idx_leaderboard_wallet ON leaderboard(wallet_address);

-- Create a unique constraint on wallet_address to prevent duplicates
ALTER TABLE leaderboard ADD CONSTRAINT unique_wallet_address UNIQUE (wallet_address);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the leaderboard
CREATE POLICY "Allow public read access" ON leaderboard
    FOR SELECT
    TO public
    USING (true);

-- Create a policy that allows anyone to insert scores (we'll validate wallet address in the app)
CREATE POLICY "Allow score inserts" ON leaderboard
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create a policy that allows updates to own scores (we'll validate wallet address in the app)
CREATE POLICY "Allow score updates" ON leaderboard
    FOR UPDATE
    TO public
    USING (true); 