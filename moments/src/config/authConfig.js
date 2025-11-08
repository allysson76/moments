import 'dotenv/config';

export const authConfig = {
    // Chave secreta para assinar tokens JWT (NUNCA commitar isso!)

    jwtSecret: (() => {
        if (!process.env.JWT_SECRET) {
            console.error('❌ ERRO CRÍTICO: JWT_SECRET não definido no .env');
            console.error('A aplicação NÃO PODE iniciar sem esta variável.');
            process.exit(1);
        }
        if (process.env.JWT_SECRET.length < 32) {
            console.error('❌ ERRO: JWT_SECRET muito curto (mínimo 32 caracteres)');
            process.exit(1);
        }
        return process.env.JWT_SECRET;

    })(),

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