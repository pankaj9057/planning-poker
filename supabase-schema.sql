-- Planning Poker Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    average NUMERIC,
    game_status TEXT NOT NULL CHECK (game_status IN ('Started', 'InProgress', 'Finished')),
    game_type TEXT NOT NULL,
    is_allow_members_to_manage_session BOOLEAN DEFAULT false,
    story_name TEXT,
    auto_reveal BOOLEAN DEFAULT false,
    cards JSONB NOT NULL,
    created_by TEXT NOT NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    show_timer BOOLEAN DEFAULT false,
    show_qr_code BOOLEAN DEFAULT false,
    timer_minutes INTEGER DEFAULT 5
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('NotStarted', 'InProgress', 'Finished')),
    value TEXT,
    emoji TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
-- Allow anyone to read games
CREATE POLICY "Allow public read access to games"
    ON games FOR SELECT
    USING (true);

-- Allow anyone to insert games (authentication optional)
CREATE POLICY "Allow public insert access to games"
    ON games FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update games (can be restricted later if needed)
CREATE POLICY "Allow public update access to games"
    ON games FOR UPDATE
    USING (true);

-- Create policies for players table
-- Allow anyone to read players
CREATE POLICY "Allow public read access to players"
    ON players FOR SELECT
    USING (true);

-- Allow anyone to insert players (authentication optional)
CREATE POLICY "Allow public insert access to players"
    ON players FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update players (authentication optional)
CREATE POLICY "Allow public update access to players"
    ON players FOR UPDATE
    USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
