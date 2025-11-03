// src/utils/mongoUtils.js

/**
 * Faz o URL encoding (percent-encoding) de uma senha para uso na connection string do MongoDB
 * 
 * Caracteres que precisam ser encodados: : / ? # [ ] @ ! $ & ' ( ) * + , ; = %
 * 
 * @param {string} password - Senha original
 * @returns {string} - Senha encodada
 */
export function encodeMongoPassword(password) {
    // encodeURIComponent já faz o encoding de todos os caracteres especiais necessários
    return encodeURIComponent(password);
}

/**
 * Constrói a connection string do MongoDB com a senha encodada
 * 
 * @param {string} username - Nome de usuário do MongoDB
 * @param {string} password - Senha original (será encodada automaticamente)
 * @param {string} cluster - Cluster do MongoDB Atlas (ex: cluster0.xxxxx.mongodb.net)
 * @param {string} database - Nome do banco de dados (opcional)
 * @param {object} options - Opções adicionais da connection string
 * @returns {string} - Connection string completa
 */
export function buildMongoConnectionString(username, password, cluster, database = '', options = {}) {
    const encodedPassword = encodeMongoPassword(password);

    // Opções padrão recomendadas
    const defaultOptions = {
        retryWrites: true,
        w: 'majority',
        ...options
    };

    // Converter opções para query string
    const queryString = Object.entries(defaultOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    // Construir connection string
    let connectionString = `mongodb+srv://${username}:${encodedPassword}@${cluster}`;

    if (database) {
        connectionString += `/${database}`;
    }

    if (queryString) {
        connectionString += `?${queryString}`;
    }

    return connectionString;
}

/**
 * Valida se uma connection string está bem formada
 * 
 * @param {string} connectionString - String de conexão
 * @returns {object} - { valida: boolean, erro?: string }
 */
export function validarConnectionString(connectionString) {
    if (!connectionString || typeof connectionString !== 'string') {
        return {
            valida: false,
            erro: 'Connection string não pode estar vazia'
        };
    }

    // Verificar se começa com mongodb:// ou mongodb+srv://
    if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
        return {
            valida: false,
            erro: 'Connection string deve começar com mongodb:// ou mongodb+srv://'
        };
    }

    // Verificar se contém @ (separador entre credenciais e host)
    if (!connectionString.includes('@')) {
        return {
            valida: false,
            erro: 'Connection string deve conter credenciais (username:password@host)'
        };
    }

    return { valida: true };
}