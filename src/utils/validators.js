/**
 * Valida formato de email
 */
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export function validarSenha(senha) {
    const erros = [];

    if (senha.length < 8) {
        erros.push('A senha deve ter no mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(senha)) {
        erros.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(senha)) {
        erros.push('A senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(senha)) {
        erros.push('A senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
        erros.push('A senha deve conter pelo menos um caractere especial');
    }

    return {
        valida: erros.length === 0,
        erros
    };
}

/**
 * Valida nome de usuário
 */
export function validarNome(nome) {
    if (!nome || nome.trim().length < 2) {
        return {
            valido: false,
            erro: 'O nome deve ter pelo menos 2 caracteres'
        };
    }

    if (nome.length > 100) {
        return {
            valido: false,
            erro: 'O nome deve ter no máximo 100 caracteres'
        };
    }

    return { valido: true };
}

/**
 * Sanitiza entrada de texto
 */
export function sanitizarTexto(texto) {
    if (!texto) return '';
    return texto.trim().replace(/[<>]/g, '');
}