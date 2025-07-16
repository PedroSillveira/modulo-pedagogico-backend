// ==========================================
// AUTH.JS - FUNÇÕES DE AUTENTICAÇÃO
// ==========================================

// Configurações
const AUTH_CONFIG = {
    TOKEN_KEY: 'pedagogico_token',
    USER_KEY: 'pedagogico_user',
    LOGIN_PAGE: '../admin/login.html',
    DASHBOARD_PAGE: '../admin/dashboard.html'
};

// ================== FUNÇÕES JWT ==================

/**
 * Decodificar JWT simples (apenas payload)
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado ou null
 */
function decodeJWT(token) {
    try {
        if (!token || typeof token !== 'string') {
            return null;
        }
        
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = parts[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Erro ao decodificar JWT:', error);
        return null;
    }
}

/**
 * Verificar se JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - True se expirado
 */
function isTokenExpired(token) {
    try {
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Erro ao verificar expiração do token:', error);
        return true;
    }
}

// ================== GERENCIAMENTO DE USUÁRIO ==================

/**
 * Obter token armazenado
 * @returns {string|null} - Token ou null
 */
function getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

/**
 * Obter dados do usuário armazenado
 * @returns {object|null} - Dados do usuário ou null
 */
function getUser() {
    try {
        const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return null;
    }
}

/**
 * Armazenar token e dados do usuário
 * @param {string} token - Token JWT
 * @param {object} userData - Dados do usuário
 */
function setAuthData(token, userData) {
    try {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Erro ao armazenar dados de autenticação:', error);
    }
}

/**
 * Limpar dados de autenticação
 */
function clearAuthData() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
}

// ================== VERIFICAÇÃO DE AUTENTICAÇÃO ==================

/**
 * Verificar se usuário está autenticado
 * @returns {boolean} - True se autenticado
 */
function isAuthenticated() {
    const token = getToken();
    
    if (!token) {
        return false;
    }
    
    if (isTokenExpired(token)) {
        clearAuthData();
        return false;
    }
    
    return true;
}

/**
 * Verificar autenticação e redirecionar se necessário
 * @param {string} redirectUrl - URL para redirecionar se não autenticado
 * @returns {boolean} - True se autenticado
 */
function requireAuth(redirectUrl = null) {
    if (!isAuthenticated()) {
        const loginUrl = redirectUrl || AUTH_CONFIG.LOGIN_PAGE;
        window.location.href = loginUrl;
        return false;
    }
    return true;
}

/**
 * Verificar se já está logado e redirecionar
 * @param {string} redirectUrl - URL para redirecionar se já autenticado
 */
function redirectIfAuthenticated(redirectUrl = null) {
    if (isAuthenticated()) {
        const dashboardUrl = redirectUrl || AUTH_CONFIG.DASHBOARD_PAGE;
        window.location.href = dashboardUrl;
    }
}

// ================== FUNÇÕES DE LOGIN/LOGOUT ==================

/**
 * Fazer logout
 * @param {string} redirectUrl - URL para redirecionar após logout
 */
function logout(redirectUrl = null) {
    clearAuthData();
    const loginUrl = redirectUrl || AUTH_CONFIG.LOGIN_PAGE;
    window.location.href = loginUrl;
}

/**
 * Processar resposta de login
 * @param {object} response - Resposta da API de login
 * @returns {boolean} - True se login bem-sucedido
 */
function processLoginResponse(response) {
    try {
        if (!response || !response.payload) {
            throw new Error('Resposta inválida do servidor');
        }
        
        const decodedResponse = decodeJWT(response.payload);
        
        if (!decodedResponse || !decodedResponse.boleano) {
            throw new Error(decodedResponse?.mensagem || 'Erro no login');
        }
        
        const userData = decodedResponse.obj;
        setAuthData(response.payload, userData);
        
        return true;
    } catch (error) {
        console.error('Erro ao processar login:', error);
        throw error;
    }
}

// ================== FUNÇÕES PARA REQUISIÇÕES AUTENTICADAS ==================

/**
 * Criar payload para requisições autenticadas
 * @param {object} data - Dados adicionais
 * @returns {object} - Payload formatado
 */
function createAuthPayload(data = {}) {
    const user = getUser();
    
    if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
    }
    
    return {
        payload: {
            ...data,
            usuario_id: user.id
        }
    };
}

/**
 * Fazer requisição autenticada
 * @param {string} url - URL da requisição
 * @param {object} data - Dados para enviar
 * @param {object} options - Opções da requisição
 * @returns {Promise} - Promise da requisição
 */
async function authenticatedRequest(url, data = {}, options = {}) {
    // Verificar autenticação
    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    try {
        const payload = createAuthPayload(data);
        
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(payload),
            ...options
        };
        
        const response = await fetch(url, requestOptions);
        const result = await response.json();
        
        if (result.payload) {
            const decodedResponse = decodeJWT(result.payload);
            
            if (!decodedResponse.boleano) {
                // Verificar se é erro de autenticação
                if (decodedResponse.mensagem && 
                    decodedResponse.mensagem.toLowerCase().includes('token')) {
                    logout();
                    return;
                }
                throw new Error(decodedResponse.mensagem);
            }
            
            return decodedResponse.obj;
        }
        
        throw new Error('Resposta inválida do servidor');
    } catch (error) {
        console.error('Erro na requisição autenticada:', error);
        throw error;
    }
}

// ================== FUNÇÕES UTILITÁRIAS ==================

/**
 * Obter nome do usuário logado
 * @returns {string} - Nome do usuário ou string vazia
 */
function getUserName() {
    const user = getUser();
    return user?.nome || '';
}

/**
 * Obter email do usuário logado
 * @returns {string} - Email do usuário ou string vazia
 */
function getUserEmail() {
    const user = getUser();
    return user?.email || '';
}

/**
 * Obter ID do usuário logado
 * @returns {number|null} - ID do usuário ou null
 */
function getUserId() {
    const user = getUser();
    return user?.id || null;
}

/**
 * Verificar se token vai expirar em breve
 * @param {number} minutesThreshold - Minutos antes da expiração
 * @returns {boolean} - True se vai expirar em breve
 */
function willTokenExpireSoon(minutesThreshold = 5) {
    try {
        const token = getToken();
        if (!token) return true;
        
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - currentTime;
        const minutesUntilExpiry = timeUntilExpiry / 60;
        
        return minutesUntilExpiry <= minutesThreshold;
    } catch (error) {
        console.error('Erro ao verificar expiração do token:', error);
        return true;
    }
}

/**
 * Atualizar nome de usuário na interface
 * @param {string} elementId - ID do elemento HTML
 */
function updateUserNameInUI(elementId = 'userName') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = getUserName() || 'Usuário';
    }
}

/**
 * Inicializar autenticação na página
 * @param {object} config - Configurações de inicialização
 */
function initAuth(config = {}) {
    const {
        requireAuthentication = true,
        updateUserName = true,
        userNameElementId = 'userName',
        redirectIfNotAuth = true
    } = config;
    
    // Verificar se precisa de autenticação
    if (requireAuthentication && redirectIfNotAuth) {
        if (!requireAuth()) {
            return false;
        }
    }
    
    // Atualizar nome do usuário na interface
    if (updateUserName && isAuthenticated()) {
        updateUserNameInUI(userNameElementId);
    }
    
    return true;
}

// ================== INICIALIZAÇÃO AUTOMÁTICA ==================

// Auto-inicializar quando DOM estiver pronto (apenas se estiver em página administrativa)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está em página administrativa (baseado na URL)
    const isAdminPage = window.location.pathname.includes('/admin/') && 
                       !window.location.pathname.includes('/login.html');
    
    if (isAdminPage) {
        initAuth({
            requireAuthentication: true,
            updateUserName: true,
            redirectIfNotAuth: true
        });
    }
});

// ================== EXPORTAR FUNÇÕES (se usando módulos) ==================

// Para compatibilidade com diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // JWT
        decodeJWT,
        isTokenExpired,
        
        // Gerenciamento de dados
        getToken,
        getUser,
        setAuthData,
        clearAuthData,
        
        // Verificação
        isAuthenticated,
        requireAuth,
        redirectIfAuthenticated,
        
        // Login/Logout
        logout,
        processLoginResponse,
        
        // Requisições
        createAuthPayload,
        authenticatedRequest,
        
        // Utilitárias
        getUserName,
        getUserEmail,
        getUserId,
        willTokenExpireSoon,
        updateUserNameInUI,
        initAuth
    };
}