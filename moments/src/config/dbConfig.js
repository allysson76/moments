import { MongoClient } from 'mongodb';
import { validarConnectionString } from '../utils/mongoUtils.js';

/**
 * Conecta ao banco de dados MongoDB
 * 
 * @param {string} stringConexao - Connection string do MongoDB
 * @returns {Promise<MongoClient>} - Cliente MongoDB conectado
 */

export const DB_NAME = process.env.DB_NAME || "moments_db";

let cachedConnection = null;

export default async function conectarAoBanco(stringConexao) {
    if (cachedConnection) {
        return cachedConnection;
    }

    let mongoClient;
    cachedConnection = mongoClient;

    try {
        // Validar connection string antes de conectar
        const validacao = validarConnectionString(stringConexao);
        
        if (!validacao.valida) {
            throw new Error(`Connection string inválida: ${validacao.erro}`);
        }

        mongoClient = new MongoClient(stringConexao);
        
        console.log('🔄 Conectando ao cluster do banco de dados...');
        
        await mongoClient.connect();
        
        console.log('✅ Conectado ao MongoDB Atlas com sucesso!');

        // Testar a conexão
        await mongoClient.db().admin().ping();
        console.log('🏓 Ping ao banco de dados bem-sucedido!');

        return mongoClient;
        
    } catch (erro) {
        console.error('❌ Falha na conexão com o banco!');
        console.error('Detalhes do erro:', erro);
        
        // Dicas de troubleshooting
        if (erro.message.includes('authentication failed')) {
            console.error('\n💡 Dica: Verifique se a senha está corretamente encodada no .env');
            console.error('   Use encodeURIComponent() para senhas com caracteres especiais');
        }
        
        if (erro.message.includes('ENOTFOUND') || erro.message.includes('ETIMEDOUT')) {
            console.error('\n💡 Dica: Verifique:');
            console.error('   1. Se o IP está na whitelist do MongoDB Atlas');
            console.error('   2. Se o cluster está ativo');
            console.error('   3. Se há conexão com a internet');
        }
        
        process.exit(1);
    }
}