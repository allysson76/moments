/**
 * Script helper para encodar senhas do MongoDB
 * 
 * Uso:
 * node src/scripts/encodePassword.js
 * 
 * Ou passar a senha como argumento:
 * node src/scripts/encodePassword.js "MinhaSenh@123!"
 */

import readline from 'readline';

// Caracteres especiais que precisam ser encodados
const CARACTERES_ESPECIAIS = {
    ':': '%3A',
    '/': '%2F',
    '?': '%3F',
    '#': '%23',
    '[': '%5B',
    ']': '%5D',
    '@': '%40',
    '!': '%21',
    '$': '%24',
    '&': '%26',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A',
    '+': '%2B',
    ',': '%2C',
    ';': '%3B',
    '=': '%3D',
    '%': '%25'
};

function encodePassword(password) {
    return encodeURIComponent(password);
}

function mostrarTabela(senha, senhaEncodada) {
    console.log('\n' + '='.repeat(70));
    console.log('RESULTADO DO ENCODING');
    console.log('='.repeat(70));
    console.log(`\n🔓 Senha Original:  ${senha}`);
    console.log(`🔒 Senha Encodada:  ${senhaEncodada}`);

    // Mostrar caracteres que foram alterados
    const caracteresAlterados = [];
    for (let i = 0; i < senha.length; i++) {
        const char = senha[i];
        if (CARACTERES_ESPECIAIS[char]) {
            caracteresAlterados.push({
                char,
                encoded: CARACTERES_ESPECIAIS[char]
            });
        }
    }

    if (caracteresAlterados.length > 0) {
        console.log('\n Caracteres Especiais Encodados:');
        caracteresAlterados.forEach(({ char, encoded }) => {
            console.log(`   ${char} → ${encoded}`);
        });
    } else {
        console.log('\n Nenhum caractere especial encontrado. Senha não precisa de encoding.');
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('='.repeat(70));
    console.log('\n1. Copie a senha encodada acima');
    console.log('2. Cole no arquivo .env na variável STRING_CONECTION');
    console.log('3. Formato completo:');
    console.log(`   STRING_CONECTION=mongodb+srv://usuario:${senhaEncodada}@cluster.mongodb.net/database`);
    console.log('\n' + '='.repeat(70) + '\n');
}

// Verificar se a senha foi passada como argumento
const senhaArgumento = process.argv[2];

if (senhaArgumento) {
    const senhaEncodada = encodePassword(senhaArgumento);
    mostrarTabela(senhaArgumento, senhaEncodada);
} else {
    // Modo interativo
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n' + '='.repeat(70));
    console.log('ENCODER DE SENHA MONGODB');
    console.log('='.repeat(70));
    console.log('\nEste script irá encodar sua senha para uso no MongoDB Atlas.');
    console.log('Caracteres especiais serão convertidos para formato URL-safe.\n');

    rl.question('Digite sua senha (não será visível em produção): ', (senha) => {
        if (!senha) {
            console.log('\n❌ Senha não pode estar vazia!');
            rl.close();
            return;
        }

        const senhaEncodada = encodePassword(senha);
        mostrarTabela(senha, senhaEncodada);

        rl.close();
    });
}