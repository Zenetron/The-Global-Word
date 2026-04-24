CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    word VARCHAR(20) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes de recherche et d'agrégation
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_votes_ip_hash ON votes(ip_hash);
