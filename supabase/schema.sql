CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    word VARCHAR(20) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT
);


-- Table pour stocker les profils (pseudo) des utilisateurs
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les scores du jeu quotidien
CREATE TABLE game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_date DATE NOT NULL,
    score_total INTEGER NOT NULL DEFAULT 0,
    time_taken_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_date)
);

-- Index pour optimiser les requêtes de recherche et d'agrégation
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_votes_ip_hash ON votes(ip_hash);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_game_scores_date ON game_scores(game_date);
CREATE INDEX idx_game_scores_user ON game_scores(user_id);
