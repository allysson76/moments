import 'dotenv/config';

export const authConfig = {
    // Chave secreta para assinar tokens JWT (NUNCA commitar isso!)
    jwtSecret: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui',

    // Tempo de expiração do token (24 horas)
    jwtExpiresIn: '24h',

    // Tempo de expiração do refresh token (7 dias)
    refreshTokenExpiresIn: '7d',

    // Configurações do bcrypt
    bcrypt: {
        saltRounds: 10 // Quanto maior, mais seguro (mas mais lento)
    },

    // Configurações de recuperação de senha
    resetPassword: {
        tokenExpiresIn: '1h', // Token expira em 1 hora
        maxAttempts: 3 // Máximo de tentativas de reset por hora
    }
};