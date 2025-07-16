// ==========================================
// API.JS - FUNÇÕES PARA CHAMADAS À API
// ==========================================

// Configurações da API
const API_CONFIG = {
    BASE_URL: 'http://localhost:4444',
    ADMIN_PREFIX: '/pedagogico',
    PUBLIC_PREFIX: '/public',
    TIMEOUT: 30000
};

// ================== FUNÇÕES BASE ==================

/**
 * Fazer requisição HTTP básica
 * @param {string} url - URL completa
 * @param {object} options - Opções da requisição
 * @returns {Promise} - Promise da requisição
 */
async function makeRequest(url, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        };

        const requestOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Requisição expirou. Tente novamente.');
        }
        console.error('Erro na requisição:', error);
        throw error;
    }
}

/**
 * Processar resposta da API (decodificar JWT)
 * @param {object} response - Resposta da API
 * @returns {object} - Dados decodificados
 */
function processAPIResponse(response) {
    try {
        if (!response || !response.payload) {
            throw new Error('Resposta inválida do servidor');
        }

        // Decodificar JWT (assumindo que auth.js está disponível)
        let decodedResponse;
        if (typeof decodeJWT === 'function') {
            decodedResponse = decodeJWT(response.payload);
        } else {
            // Fallback se auth.js não estiver disponível
            const parts = response.payload.split('.');
            if (parts.length !== 3) {
                throw new Error('Token JWT inválido');
            }
            decodedResponse = JSON.parse(atob(parts[1]));
        }

        if (!decodedResponse.boleano) {
            throw new Error(decodedResponse.mensagem || 'Erro na operação');
        }

        return decodedResponse.obj;
    } catch (error) {
        console.error('Erro ao processar resposta:', error);
        throw error;
    }
}

// ================== FUNÇÕES ADMINISTRATIVAS ==================

/**
 * Fazer requisição administrativa autenticada
 * @param {string} endpoint - Endpoint da API (sem prefixo)
 * @param {object} data - Dados para enviar
 * @returns {Promise} - Promise com dados processados
 */
async function adminRequest(endpoint, data = {}) {
    // Verificar se auth.js está disponível e usuário autenticado
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        throw new Error('Usuário não autenticado');
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}${endpoint}`;
    
    // Criar payload autenticado
    let payload;
    if (typeof createAuthPayload === 'function') {
        payload = createAuthPayload(data);
    } else {
        // Fallback básico
        const user = JSON.parse(localStorage.getItem('pedagogico_user') || '{}');
        payload = {
            payload: {
                ...data,
                usuario_id: user.id
            }
        };
    }

    const response = await makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    return processAPIResponse(response);
}

// ================== ADMIN - FORMULÁRIOS ==================

const AdminFormularios = {
    /**
     * Listar todos os formulários
     */
    async listar() {
        return await adminRequest('/listar_formularios');
    },

    /**
     * Buscar formulário por ID
     * @param {number} formularioId - ID do formulário
     */
    async buscar(formularioId) {
        return await adminRequest('/buscar_formulario', { formulario_id: formularioId });
    },

    /**
     * Criar novo formulário
     * @param {object} formularioData - Dados do formulário
     */
    async criar(formularioData) {
        return await adminRequest('/criar_formulario', formularioData);
    },

    /**
     * Editar formulário
     * @param {number} formularioId - ID do formulário
     * @param {object} formularioData - Dados atualizados
     */
    async editar(formularioId, formularioData) {
        return await adminRequest('/editar_formulario', {
            formulario_id: formularioId,
            ...formularioData
        });
    },

    /**
     * Ativar formulário
     * @param {number} formularioId - ID do formulário
     */
    async ativar(formularioId) {
        return await adminRequest('/ativar_formulario', { formulario_id: formularioId });
    },

    /**
     * Desativar formulário
     * @param {number} formularioId - ID do formulário
     */
    async desativar(formularioId) {
        return await adminRequest('/desativar_formulario', { formulario_id: formularioId });
    },

    /**
     * Deletar formulário
     * @param {number} formularioId - ID do formulário
     */
    async deletar(formularioId) {
        return await adminRequest('/deletar_formulario', { formulario_id: formularioId });
    }
};

// ================== ADMIN - PERGUNTAS ==================

const AdminPerguntas = {
    /**
     * Criar pergunta
     * @param {object} perguntaData - Dados da pergunta
     */
    async criar(perguntaData) {
        return await adminRequest('/criar_pergunta', perguntaData);
    },

    /**
     * Editar pergunta
     * @param {number} perguntaId - ID da pergunta
     * @param {object} perguntaData - Dados atualizados
     */
    async editar(perguntaId, perguntaData) {
        return await adminRequest('/editar_pergunta', {
            pergunta_id: perguntaId,
            ...perguntaData
        });
    },

    /**
     * Deletar pergunta
     * @param {number} perguntaId - ID da pergunta
     */
    async deletar(perguntaId) {
        return await adminRequest('/deletar_pergunta', { pergunta_id: perguntaId });
    },

    /**
     * Reordenar pergunta
     * @param {number} formularioId - ID do formulário
     * @param {number} perguntaId - ID da pergunta
     * @param {number} novaOrdem - Nova ordem
     */
    async reordenar(formularioId, perguntaId, novaOrdem) {
        return await adminRequest('/reordenar_pergunta', {
            formulario_id: formularioId,
            pergunta_id: perguntaId,
            nova_ordem: novaOrdem
        });
    }
};

// ================== ADMIN - RESPOSTAS ==================

const AdminRespostas = {
    /**
     * Obter respostas de um formulário
     * @param {number} formularioId - ID do formulário
     */
    async porFormulario(formularioId) {
        return await adminRequest('/respostas_formulario', { formulario_id: formularioId });
    },

    /**
     * Obter detalhes de uma resposta
     * @param {number} respostaFormularioId - ID da resposta do formulário
     */
    async detalhes(respostaFormularioId) {
        return await adminRequest('/detalhes_resposta', { 
            resposta_formulario_id: respostaFormularioId 
        });
    }
};

// ================== ADMIN - RANKING E ESTATÍSTICAS ==================

const AdminRanking = {
    /**
     * Obter ranking global
     */
    async global() {
        return await adminRequest('/ranking_global');
    },

    /**
     * Obter top participantes
     * @param {number} limite - Limite de participantes
     */
    async top(limite = 10) {
        return await adminRequest('/top_participantes', { limite });
    },

    /**
     * Obter estatísticas gerais
     */
    async estatisticas() {
        return await adminRequest('/estatisticas');
    }
};

// ================== ADMIN - DASHBOARD ==================

const AdminDashboard = {
    /**
     * Obter dados do dashboard
     */
    async dados() {
        return await adminRequest('/dashboard');
    }
};

// ================== ADMIN - AUTENTICAÇÃO ==================

const AdminAuth = {
    /**
     * Fazer login
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     */
    async login(email, senha) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}/login`;
        
        const response = await makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        return processAPIResponse(response);
    }
};

// ================== FUNÇÕES PÚBLICAS ==================

/**
 * Fazer requisição pública
 * @param {string} endpoint - Endpoint da API (sem prefixo)
 * @param {object} data - Dados para enviar
 * @param {string} method - Método HTTP
 * @returns {Promise} - Promise com dados processados
 */
async function publicRequest(endpoint, data = null, method = 'GET') {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PUBLIC_PREFIX}${endpoint}`;
    
    let options = { method };
    
    if (data && method === 'POST') {
        options.body = JSON.stringify({
            payload: data
        });
    }

    const response = await makeRequest(url, options);
    return processAPIResponse(response);
}

// ================== PUBLIC - FORMULÁRIOS ==================

const PublicFormularios = {
    /**
     * Listar formulários disponíveis
     */
    async listar() {
        return await publicRequest('/formularios');
    },

    /**
     * Buscar formulário público por ID
     * @param {number} formularioId - ID do formulário
     */
    async buscar(formularioId) {
        return await publicRequest('/buscar_formulario', { formulario_id: formularioId }, 'POST');
    },

    /**
     * Verificar se participante já respondeu
     * @param {string} email - Email do participante
     * @param {number} formularioId - ID do formulário
     */
    async verificarParticipacao(email, formularioId) {
        return await publicRequest('/verificar_participacao', {
            email: email,
            formulario_id: formularioId
        }, 'POST');
    },

    /**
     * Responder formulário
     * @param {object} respostaData - Dados da resposta
     */
    async responder(respostaData) {
        return await publicRequest('/responder', respostaData, 'POST');
    }
};

// ================== PUBLIC - RANKING ==================

const PublicRanking = {
    /**
     * Obter ranking público
     */
    async obter() {
        return await publicRequest('/ranking');
    },

    /**
     * Buscar imperador por email
     * @param {string} email - Email do participante
     */
    async buscarImperador(email) {
        return await publicRequest('/buscar_imperador', { email }, 'POST');
    }
};

// ================== PUBLIC - ESTATÍSTICAS ==================

const PublicEstatisticas = {
    /**
     * Obter estatísticas públicas
     */
    async obter() {
        return await publicRequest('/estatisticas');
    }
};

// ================== FUNÇÕES UTILITÁRIAS ==================

/**
 * Tratar erro da API e mostrar mensagem amigável
 * @param {Error} error - Erro capturado
 * @param {string} operacao - Nome da operação que falhou
 * @returns {string} - Mensagem de erro amigável
 */
function handleAPIError(error, operacao = 'operação') {
    console.error(`Erro na ${operacao}:`, error);
    
    let mensagem = `Erro na ${operacao}: `;
    
    if (error.message.includes('Token inválido') || error.message.includes('autenticado')) {
        mensagem = 'Sessão expirada. Faça login novamente.';
        // Redirecionar para login se função disponível
        if (typeof logout === 'function') {
            setTimeout(() => logout(), 2000);
        }
    } else if (error.message.includes('expirou')) {
        mensagem += 'Tempo limite excedido. Tente novamente.';
    } else if (error.message.includes('HTTP')) {
        mensagem += 'Erro de conexão com o servidor.';
    } else {
        mensagem += error.message || 'Erro desconhecido.';
    }
    
    return mensagem;
}

/**
 * Formatar dados para envio (sanitizar)
 * @param {object} data - Dados para formatar
 * @returns {object} - Dados formatados
 */
function formatDataForAPI(data) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
            if (typeof value === 'string') {
                formatted[key] = value.trim();
            } else {
                formatted[key] = value;
            }
        }
    }
    
    return formatted;
}

/**
 * Validar email
 * @param {string} email - Email para validar
 * @returns {boolean} - True se válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Obter timestamp atual para requisições
 * @returns {number} - Timestamp atual
 */
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// ================== OBJETO API PRINCIPAL ==================

const API = {
    // Configurações
    config: API_CONFIG,
    
    // Funções base
    makeRequest,
    processAPIResponse,
    adminRequest,
    publicRequest,
    
    // Módulos administrativos
    admin: {
        auth: AdminAuth,
        formularios: AdminFormularios,
        perguntas: AdminPerguntas,
        respostas: AdminRespostas,
        ranking: AdminRanking,
        dashboard: AdminDashboard
    },
    
    // Módulos públicos
    public: {
        formularios: PublicFormularios,
        ranking: PublicRanking,
        estatisticas: PublicEstatisticas
    },
    
    // Utilitários
    utils: {
        handleError: handleAPIError,
        formatData: formatDataForAPI,
        isValidEmail,
        getCurrentTimestamp
    }
};

// ================== EXPORTAR PARA COMPATIBILIDADE ==================

// Para compatibilidade com diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.API = API;
}