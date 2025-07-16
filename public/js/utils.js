// ==========================================
// UTILS.JS - FUNÇÕES UTILITÁRIAS GERAIS
// ==========================================

// ================== FORMATAÇÃO DE DADOS ==================

const Formatacao = {
    /**
     * Formatar data para formato brasileiro
     * @param {string|Date} data - Data para formatar
     * @param {boolean} incluirHora - Se deve incluir hora
     * @returns {string} - Data formatada
     */
    data(data, incluirHora = false) {
        try {
            const date = typeof data === 'string' ? new Date(data) : data;
            
            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }
            
            const opcoes = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            
            if (incluirHora) {
                opcoes.hour = '2-digit';
                opcoes.minute = '2-digit';
            }
            
            return date.toLocaleDateString('pt-BR', opcoes);
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    },

    /**
     * Formatar data para input datetime-local
     * @param {string|Date} data - Data para formatar
     * @returns {string} - Data formatada para input
     */
    dataParaInput(data) {
        try {
            const date = typeof data === 'string' ? new Date(data) : data;
            
            if (isNaN(date.getTime())) {
                return '';
            }
            
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date.toISOString().slice(0, 16);
        } catch (error) {
            console.error('Erro ao formatar data para input:', error);
            return '';
        }
    },

    /**
     * Formatar número com separadores de milhares
     * @param {number} numero - Número para formatar
     * @param {number} casasDecimais - Número de casas decimais
     * @returns {string} - Número formatado
     */
    numero(numero, casasDecimais = 0) {
        try {
            if (isNaN(numero)) {
                return '0';
            }
            
            return Number(numero).toLocaleString('pt-BR', {
                minimumFractionDigits: casasDecimais,
                maximumFractionDigits: casasDecimais
            });
        } catch (error) {
            console.error('Erro ao formatar número:', error);
            return '0';
        }
    },

    /**
     * Formatar texto para título (primeira letra maiúscula)
     * @param {string} texto - Texto para formatar
     * @returns {string} - Texto formatado
     */
    titulo(texto) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Truncar texto com reticências
     * @param {string} texto - Texto para truncar
     * @param {number} limite - Limite de caracteres
     * @returns {string} - Texto truncado
     */
    truncar(texto, limite = 50) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        if (texto.length <= limite) {
            return texto;
        }
        
        return texto.substring(0, limite).trim() + '...';
    },

    /**
     * Formatar bytes para tamanho legível
     * @param {number} bytes - Tamanho em bytes
     * @returns {string} - Tamanho formatado
     */
    bytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// ================== VALIDAÇÕES ==================

const Validacoes = {
    /**
     * Validar email
     * @param {string} email - Email para validar
     * @returns {boolean} - True se válido
     */
    email(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    },

    /**
     * Validar CPF
     * @param {string} cpf - CPF para validar
     * @returns {boolean} - True se válido
     */
    cpf(cpf) {
        if (!cpf || typeof cpf !== 'string') {
            return false;
        }
        
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        // Validação dos dígitos verificadores
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    },

    /**
     * Validar telefone brasileiro
     * @param {string} telefone - Telefone para validar
     * @returns {boolean} - True se válido
     */
    telefone(telefone) {
        if (!telefone || typeof telefone !== 'string') {
            return false;
        }
        
        // Remove caracteres não numéricos
        const tel = telefone.replace(/\D/g, '');
        
        // Verifica se tem 10 ou 11 dígitos
        return tel.length === 10 || tel.length === 11;
    },

    /**
     * Validar se é uma URL válida
     * @param {string} url - URL para validar
     * @returns {boolean} - True se válida
     */
    url(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }
        
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validar se string não está vazia
     * @param {string} valor - Valor para validar
     * @returns {boolean} - True se não vazio
     */
    naoVazio(valor) {
        return valor !== null && valor !== undefined && String(valor).trim() !== '';
    },

    /**
     * Validar se é um número válido
     * @param {any} valor - Valor para validar
     * @returns {boolean} - True se é número válido
     */
    numero(valor) {
        return !isNaN(parseFloat(valor)) && isFinite(valor);
    },

    /**
     * Validar se data é futura
     * @param {string|Date} data - Data para validar
     * @returns {boolean} - True se é futura
     */
    dataFutura(data) {
        try {
            const date = typeof data === 'string' ? new Date(data) : data;
            return date > new Date();
        } catch {
            return false;
        }
    }
};

// ================== MANIPULAÇÃO DE DOM ==================

const DOM = {
    /**
     * Buscar elemento por ID
     * @param {string} id - ID do elemento
     * @returns {HTMLElement|null} - Elemento encontrado ou null
     */
    buscar(id) {
        return document.getElementById(id);
    },

    /**
     * Buscar elementos por classe
     * @param {string} classe - Nome da classe
     * @returns {NodeList} - Lista de elementos
     */
    buscarPorClasse(classe) {
        return document.getElementsByClassName(classe);
    },

    /**
     * Buscar elementos por seletor
     * @param {string} seletor - Seletor CSS
     * @returns {NodeList} - Lista de elementos
     */
    buscarTodos(seletor) {
        return document.querySelectorAll(seletor);
    },

    /**
     * Adicionar classe a elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     * @param {string} classe - Nome da classe
     */
    adicionarClasse(elemento, classe) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el && el.classList) {
            el.classList.add(classe);
        }
    },

    /**
     * Remover classe de elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     * @param {string} classe - Nome da classe
     */
    removerClasse(elemento, classe) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el && el.classList) {
            el.classList.remove(classe);
        }
    },

    /**
     * Alternar classe de elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     * @param {string} classe - Nome da classe
     */
    alternarClasse(elemento, classe) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el && el.classList) {
            el.classList.toggle(classe);
        }
    },

    /**
     * Verificar se elemento tem classe
     * @param {HTMLElement|string} elemento - Elemento ou ID
     * @param {string} classe - Nome da classe
     * @returns {boolean} - True se tem a classe
     */
    temClasse(elemento, classe) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        return el && el.classList && el.classList.contains(classe);
    },

    /**
     * Mostrar elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     */
    mostrar(elemento) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el) {
            el.style.display = '';
            this.removerClasse(el, 'hidden');
        }
    },

    /**
     * Esconder elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     */
    esconder(elemento) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el) {
            el.style.display = 'none';
            this.adicionarClasse(el, 'hidden');
        }
    },

    /**
     * Scroll suave para elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     */
    scrollPara(elemento) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Limpar conteúdo de elemento
     * @param {HTMLElement|string} elemento - Elemento ou ID
     */
    limpar(elemento) {
        const el = typeof elemento === 'string' ? this.buscar(elemento) : elemento;
        if (el) {
            el.innerHTML = '';
        }
    }
};

// ================== ARMAZENAMENTO LOCAL ==================

const Storage = {
    /**
     * Salvar item no localStorage
     * @param {string} chave - Chave do item
     * @param {any} valor - Valor para salvar
     * @returns {boolean} - True se salvou com sucesso
     */
    salvar(chave, valor) {
        try {
            const valorString = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
            localStorage.setItem(chave, valorString);
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },

    /**
     * Obter item do localStorage
     * @param {string} chave - Chave do item
     * @param {any} valorPadrao - Valor padrão se não encontrar
     * @returns {any} - Valor encontrado ou padrão
     */
    obter(chave, valorPadrao = null) {
        try {
            const valor = localStorage.getItem(chave);
            
            if (valor === null) {
                return valorPadrao;
            }
            
            // Tentar parsear como JSON
            try {
                return JSON.parse(valor);
            } catch {
                return valor;
            }
        } catch (error) {
            console.error('Erro ao obter do localStorage:', error);
            return valorPadrao;
        }
    },

    /**
     * Remover item do localStorage
     * @param {string} chave - Chave do item
     * @returns {boolean} - True se removeu com sucesso
     */
    remover(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },

    /**
     * Limpar todo o localStorage
     * @returns {boolean} - True se limpou com sucesso
     */
    limpar() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    },

    /**
     * Verificar se chave existe no localStorage
     * @param {string} chave - Chave para verificar
     * @returns {boolean} - True se existe
     */
    existe(chave) {
        return localStorage.getItem(chave) !== null;
    }
};

// ================== UTILITÁRIOS DE STRING ==================

const Strings = {
    /**
     * Remover acentos de string
     * @param {string} texto - Texto para processar
     * @returns {string} - Texto sem acentos
     */
    removerAcentos(texto) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    /**
     * Gerar slug a partir de texto
     * @param {string} texto - Texto para converter
     * @returns {string} - Slug gerado
     */
    slug(texto) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        return this.removerAcentos(texto)
                   .toLowerCase()
                   .replace(/[^a-z0-9\s-]/g, '')
                   .replace(/\s+/g, '-')
                   .replace(/-+/g, '-')
                   .trim('-');
    },

    /**
     * Capitalizar primeira letra
     * @param {string} texto - Texto para capitalizar
     * @returns {string} - Texto capitalizado
     */
    capitalizar(texto) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    },

    /**
     * Gerar string aleatória
     * @param {number} tamanho - Tamanho da string
     * @param {string} caracteres - Caracteres permitidos
     * @returns {string} - String aleatória
     */
    aleatoria(tamanho = 8, caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let resultado = '';
        for (let i = 0; i < tamanho; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return resultado;
    },

    /**
     * Contar palavras em texto
     * @param {string} texto - Texto para contar
     * @returns {number} - Número de palavras
     */
    contarPalavras(texto) {
        if (!texto || typeof texto !== 'string') {
            return 0;
        }
        
        return texto.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Mascarar texto (ex: email)
     * @param {string} texto - Texto para mascarar
     * @param {number} mostrarInicio - Caracteres para mostrar no início
     * @param {number} mostrarFim - Caracteres para mostrar no fim
     * @returns {string} - Texto mascarado
     */
    mascarar(texto, mostrarInicio = 3, mostrarFim = 3) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }
        
        if (texto.length <= mostrarInicio + mostrarFim) {
            return texto;
        }
        
        const inicio = texto.substring(0, mostrarInicio);
        const fim = texto.substring(texto.length - mostrarFim);
        const meio = '*'.repeat(texto.length - mostrarInicio - mostrarFim);
        
        return inicio + meio + fim;
    }
};

// ================== UTILITÁRIOS DE URL ==================

const URL_Utils = {
    /**
     * Obter parâmetro da URL
     * @param {string} nome - Nome do parâmetro
     * @returns {string|null} - Valor do parâmetro ou null
     */
    obterParametro(nome) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nome);
    },

    /**
     * Obter todos os parâmetros da URL
     * @returns {object} - Objeto com todos os parâmetros
     */
    obterTodosParametros() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        
        return params;
    },

    /**
     * Adicionar parâmetro à URL atual
     * @param {string} nome - Nome do parâmetro
     * @param {string} valor - Valor do parâmetro
     * @param {boolean} recarregar - Se deve recarregar a página
     */
    adicionarParametro(nome, valor, recarregar = false) {
        const url = new URL(window.location);
        url.searchParams.set(nome, valor);
        
        if (recarregar) {
            window.location.href = url.toString();
        } else {
            window.history.pushState({}, '', url.toString());
        }
    },

    /**
     * Remover parâmetro da URL atual
     * @param {string} nome - Nome do parâmetro
     * @param {boolean} recarregar - Se deve recarregar a página
     */
    removerParametro(nome, recarregar = false) {
        const url = new URL(window.location);
        url.searchParams.delete(nome);
        
        if (recarregar) {
            window.location.href = url.toString();
        } else {
            window.history.pushState({}, '', url.toString());
        }
    },

    /**
     * Construir URL com parâmetros
     * @param {string} base - URL base
     * @param {object} parametros - Objeto com parâmetros
     * @returns {string} - URL completa
     */
    construir(base, parametros = {}) {
        const url = new URL(base, window.location.origin);
        
        for (const [key, value] of Object.entries(parametros)) {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        }
        
        return url.toString();
    }
};

// ================== UTILITÁRIOS DE PERFORMANCE ==================

const Performance = {
    /**
     * Debounce - Atrasa execução de função
     * @param {function} func - Função para executar
     * @param {number} delay - Delay em milissegundos
     * @returns {function} - Função com debounce
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle - Limita execução de função
     * @param {function} func - Função para executar
     * @param {number} limit - Limite em milissegundos
     * @returns {function} - Função com throttle
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Medir tempo de execução de função
     * @param {function} func - Função para medir
     * @param {...any} args - Argumentos da função
     * @returns {object} - Resultado e tempo de execução
     */
    async medir(func, ...args) {
        const inicio = performance.now();
        const resultado = await func(...args);
        const fim = performance.now();
        
        return {
            resultado,
            tempo: fim - inicio
        };
    }
};

// ================== UTILITÁRIOS DIVERSOS ==================

const Diversos = {
    /**
     * Gerar ID único
     * @returns {string} - ID único
     */
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Aguardar tempo específico
     * @param {number} ms - Milissegundos para aguardar
     * @returns {Promise} - Promise que resolve após o tempo
     */
    aguardar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Copiar texto para clipboard
     * @param {string} texto - Texto para copiar
     * @returns {Promise<boolean>} - True se copiou com sucesso
     */
    async copiarTexto(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (error) {
            console.error('Erro ao copiar texto:', error);
            return false;
        }
    },

    /**
     * Detectar se é dispositivo móvel
     * @returns {boolean} - True se é móvel
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Detectar se é modo escuro
     * @returns {boolean} - True se é modo escuro
     */
    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    /**
     * Converter objeto em FormData
     * @param {object} objeto - Objeto para converter
     * @returns {FormData} - FormData criado
     */
    objetoParaFormData(objeto) {
        const formData = new FormData();
        
        for (const [key, value] of Object.entries(objeto)) {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        }
        
        return formData;
    },

    /**
     * Converter FormData em objeto
     * @param {FormData} formData - FormData para converter
     * @returns {object} - Objeto criado
     */
    formDataParaObjeto(formData) {
        const objeto = {};
        
        for (const [key, value] of formData.entries()) {
            objeto[key] = value;
        }
        
        return objeto;
    }
};

// ================== OBJETO UTILS PRINCIPAL ==================

const Utils = {
    formatacao: Formatacao,
    validacoes: Validacoes,
    dom: DOM,
    storage: Storage,
    strings: Strings,
    url: URL_Utils,
    performance: Performance,
    diversos: Diversos
};

// ================== EXPORTAR PARA COMPATIBILIDADE ==================

// Para compatibilidade com diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Compatibilidade com nomes individuais para facilitar uso
if (typeof window !== 'undefined') {
    window.Formatacao = Formatacao;
    window.Validacoes = Validacoes;
    window.DOM = DOM;
    window.Storage = Storage;
    window.Strings = Strings;
}