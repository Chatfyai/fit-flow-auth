-- Criar tabela de desafios
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rules TEXT,
    end_date DATE NOT NULL,
    max_participants INTEGER,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de participantes de desafios
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('admin', 'participant')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_status ON challenge_participants(status);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_participants_updated_at
    BEFORE UPDATE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para challenges
CREATE POLICY "Users can view all challenges" ON challenges
    FOR SELECT USING (true);

CREATE POLICY "Users can create challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own challenges" ON challenges
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own challenges" ON challenges
    FOR DELETE USING (auth.uid() = created_by);

-- Políticas de segurança para challenge_participants
CREATE POLICY "Users can view challenge participants" ON challenge_participants
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM challenges 
            WHERE challenges.id = challenge_participants.challenge_id 
            AND challenges.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join challenges" ON challenge_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON challenge_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Challenge creators can update participants" ON challenge_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM challenges 
            WHERE challenges.id = challenge_participants.challenge_id 
            AND challenges.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can leave challenges" ON challenge_participants
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM challenges 
            WHERE challenges.id = challenge_participants.challenge_id 
            AND challenges.created_by = auth.uid()
        )
    ); 