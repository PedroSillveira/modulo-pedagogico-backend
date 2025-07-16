// ==========================================
// ADMIN.JS - FUNCIONALIDADES ADMINISTRATIVAS
// ==========================================

// ================== CONFIGURAÇÕES ==================

const ADMIN_CONFIG = {
    MESSAGES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    TIMEOUTS: {
        MESSAGE: 5000,
        REDIRECT: 2000
    }
};

// ================== FUNÇÕES DE UI ==================

/**
 * Mostrar mensagem na interface
 * @param {string} text - Texto da mensagem
 * @param {string} type - Tipo da mensagem (success, error, warning, info)
 * @param {string} containerId - ID do container da mensagem
 */
function showMessage(text, type = 'info', containerId = 'message') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = text;

    container.innerHTML = '';
    container.appendChild(messageDiv);

    // Auto remover após timeout
    setTimeout(() => {
        if (container.contains(messageDiv)) {
            container.removeChild(messageDiv);
        }
    }, ADMIN_CONFIG.TIMEOUTS.MESSAGE);
}

/**
 * Mostrar loading em elemento
 * @param {string} elementId - ID do elemento
 * @param {string} text - Texto do loading
 */
function showLoading(elementId, text = 'Carregando...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${text}</div>`;
    }
}

/**
 * Mostrar erro em elemento
 * @param {string} elementId - ID do elemento
 * @param {string} text - Texto do erro
 * @param {function} retryFunction - Função para tentar novamente
 */
function showError(elementId, text, retryFunction = null) {
    const element = document.getElementById(elementId);
    if (element) {
        let errorHTML = `<div class="error">${text}`;
        if (retryFunction) {
            errorHTML += `<br><button onclick="${retryFunction.name}()" class="btn" style="margin-top: 10px;">🔄 Tentar Novamente</button>`;
        }
        errorHTML += '</div>';
        element.innerHTML = errorHTML;
    }
}

/**
 * Formatar data para exibição
 * @param {string} dateString - String da data
 * @returns {string} - Data formatada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

/**
 * Formatar data para input datetime-local
 * @param {string} dateString - String da data
 * @returns {string} - Data formatada para input
 */
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
}

// ================== DASHBOARD ==================

const Dashboard = {
    /**
     * Carregar dados do dashboard
     */
    async carregar() {
        try {
            if (typeof API === 'undefined') {
                throw new Error('API não disponível');
            }

            const data = await API.admin.dashboard.dados();
            
            // Atualizar estatísticas
            if (data.estatisticas) {
                this.atualizarEstatisticas(data.estatisticas);
            }
            
            // Atualizar formulários recentes
            if (data.formularios) {
                this.atualizarFormulariosRecentes(data.formularios);
            }
            
            // Atualizar top ranking
            if (data.top_ranking) {
                this.atualizarTopRanking(data.top_ranking);
            }

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            showMessage(API.utils.handleError(error, 'carregamento do dashboard'), 'error');
        }
    },

    /**
     * Atualizar estatísticas na tela
     * @param {object} stats - Estatísticas
     */
    atualizarEstatisticas(stats) {
        const elementos = {
            'formulariosAtivos': stats.formularios_ativos || 0,
            'totalParticipantes': stats.total_participantes || 0,
            'totalRespostas': stats.total_respostas || 0,
            'mediaPontos': Math.round(stats.media_pontos || 0)
        };

        for (const [id, value] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    },

    /**
     * Atualizar formulários recentes
     * @param {array} formularios - Lista de formulários
     */
    atualizarFormulariosRecentes(formularios) {
        const container = document.getElementById('formulariosRecentes');
        if (!container) return;

        if (formularios && formularios.length > 0) {
            container.innerHTML = formularios.slice(0, 5).map(form => `
                <div class="recent-item">
                    <div>
                        <strong>${form.titulo}</strong><br>
                        <small>Criado em: ${formatDate(form.data_criacao)}</small>
                    </div>
                    <span class="status ${form.ativo ? 'ativo' : 'inativo'}">
                        ${form.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="loading">Nenhum formulário encontrado</div>';
        }
    },

    /**
     * Atualizar top ranking
     * @param {array} ranking - Lista do ranking
     */
    atualizarTopRanking(ranking) {
        const container = document.getElementById('topRanking');
        if (!container) return;

        if (ranking && ranking.length > 0) {
            container.innerHTML = ranking.map((participante, index) => `
                <div class="recent-item">
                    <div>
                        <strong>${index + 1}º - ${participante.nome}</strong><br>
                        <small>${participante.email}</small>
                    </div>
                    <span style="font-weight: bold; color: #667eea;">
                        ${participante.pontuacao_total} pts
                    </span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="loading">Nenhum participante no ranking</div>';
        }
    }
};

// ================== FORMULÁRIOS ==================

const Formularios = {
    /**
     * Carregar lista de formulários
     */
    async carregar() {
        const container = document.getElementById('formulariosTableBody');
        if (!container) return;

        try {
            showLoading('formulariosTableBody', 'Carregando formulários...');
            const formularios = await API.admin.formularios.listar();
            
            if (formularios && formularios.length > 0) {
                container.innerHTML = formularios.map(form => `
                    <tr>
                        <td>
                            <strong>${form.titulo}</strong>
                            ${form.descricao ? `<br><small style="color: #666;">${form.descricao}</small>` : ''}
                        </td>
                        <td>
                            <span class="status ${form.ativo ? 'ativo' : 'inativo'}">
                                ${form.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </td>
                        <td>${formatDate(form.data_criacao)}</td>
                        <td>${formatDate(form.data_limite)}</td>
                        <td>
                            <strong>${form.total_respostas || 0}</strong>
                            ${form.total_respostas > 0 ? `<br><a href="respostas.html?id=${form.id}" style="color: #667eea; font-size: 12px;">Ver respostas</a>` : ''}
                        </td>
                        <td>
                            <div class="actions">
                                <a href="editar-formulario.html?id=${form.id}" class="btn btn-sm">Editar</a>
                                ${form.ativo ? 
                                    `<button class="btn btn-warning btn-sm" onclick="Formularios.desativar(${form.id})">Desativar</button>` :
                                    `<button class="btn btn-success btn-sm" onclick="Formularios.ativar(${form.id})">Ativar</button>`
                                }
                                <button class="btn btn-danger btn-sm" onclick="Formularios.deletar(${form.id}, '${form.titulo}')">Deletar</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty">
                            Nenhum formulário encontrado.<br>
                            <a href="criar-formulario.html" class="btn" style="margin-top: 10px;">Criar Primeiro Formulário</a>
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            showError('formulariosTableBody', API.utils.handleError(error, 'carregamento de formulários'), () => this.carregar());
        }
    },

    /**
     * Ativar formulário
     * @param {number} formularioId - ID do formulário
     */
    async ativar(formularioId) {
        if (!confirm('Ativar este formulário? Isso permitirá que participantes respondam.')) {
            return;
        }

        try {
            await API.admin.formularios.ativar(formularioId);
            showMessage('Formulário ativado com sucesso!', 'success');
            this.carregar();
        } catch (error) {
            showMessage(API.utils.handleError(error, 'ativação do formulário'), 'error');
        }
    },

    /**
     * Desativar formulário
     * @param {number} formularioId - ID do formulário
     */
    async desativar(formularioId) {
        if (!confirm('Desativar este formulário? Participantes não poderão mais responder.')) {
            return;
        }

        try {
            await API.admin.formularios.desativar(formularioId);
            showMessage('Formulário desativado com sucesso!', 'success');
            this.carregar();
        } catch (error) {
            showMessage(API.utils.handleError(error, 'desativação do formulário'), 'error');
        }
    },

    /**
     * Deletar formulário
     * @param {number} formularioId - ID do formulário
     * @param {string} titulo - Título do formulário
     */
    async deletar(formularioId, titulo) {
        if (!confirm(`Deletar o formulário "${titulo}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await API.admin.formularios.deletar(formularioId);
            showMessage('Formulário deletado com sucesso!', 'success');
            this.carregar();
        } catch (error) {
            showMessage(API.utils.handleError(error, 'exclusão do formulário'), 'error');
        }
    },

    /**
     * Salvar formulário (criar ou editar)
     * @param {object} dadosFormulario - Dados do formulário
     * @param {boolean} isEdicao - Se é edição (true) ou criação (false)
     * @returns {number|null} - ID do formulário criado ou null
     */
    async salvar(dadosFormulario, isEdicao = false) {
        try {
            const dados = API.utils.formatData(dadosFormulario);
            
            if (isEdicao) {
                await API.admin.formularios.editar(dados.formulario_id, dados);
                return dados.formulario_id;
            } else {
                const resultado = await API.admin.formularios.criar(dados);
                return resultado.formulario_id;
            }
        } catch (error) {
            throw new Error(API.utils.handleError(error, isEdicao ? 'edição' : 'criação'));
        }
    }
};

// ================== PERGUNTAS ==================

const Perguntas = {
    /**
     * Salvar pergunta (criar ou editar)
     * @param {object} dadosPergunta - Dados da pergunta
     * @param {boolean} isEdicao - Se é edição (true) ou criação (false)
     * @returns {number|null} - ID da pergunta criada ou null
     */
    async salvar(dadosPergunta, isEdicao = false) {
        try {
            const dados = API.utils.formatData(dadosPergunta);
            
            if (isEdicao) {
                await API.admin.perguntas.editar(dados.pergunta_id, dados);
                return dados.pergunta_id;
            } else {
                const resultado = await API.admin.perguntas.criar(dados);
                return resultado.pergunta_id;
            }
        } catch (error) {
            throw new Error(API.utils.handleError(error, isEdicao ? 'edição' : 'criação'));
        }
    },

    /**
     * Deletar pergunta
     * @param {number} perguntaId - ID da pergunta
     */
    async deletar(perguntaId) {
        try {
            await API.admin.perguntas.deletar(perguntaId);
        } catch (error) {
            throw new Error(API.utils.handleError(error, 'exclusão da pergunta'));
        }
    },

    /**
     * Obter nome amigável do tipo de pergunta
     * @param {string} tipo - Tipo da pergunta
     * @returns {string} - Nome amigável
     */
    obterNomeTipo(tipo) {
        const tipos = {
            'texto': 'Texto Livre',
            'multipla_escolha': 'Múltipla Escolha',
            'escala_1_5': 'Escala 1-5',
            'escala_1_10': 'Escala 1-10',
            'sim_nao': 'Sim/Não',
            'numero': 'Número',
            'data': 'Data'
        };
        return tipos[tipo] || tipo;
    }
};

// ================== RESPOSTAS ==================

const Respostas = {
    /**
     * Carregar respostas de um formulário
     * @param {number} formularioId - ID do formulário
     */
    async carregar(formularioId) {
        const container = document.getElementById('respostasTableBody');
        if (!container) return;

        try {
            showLoading('respostasTableBody', 'Carregando respostas...');
            const respostas = await API.admin.respostas.porFormulario(formularioId);
            
            if (respostas && respostas.length > 0) {
                // Calcular estatísticas
                const pontuacoes = respostas.map(r => r.pontos_ganhos);
                const total = respostas.length;
                const media = Math.round(pontuacoes.reduce((a, b) => a + b, 0) / total);
                const maior = Math.max(...pontuacoes);
                const menor = Math.min(...pontuacoes);

                // Atualizar estatísticas na tela
                this.atualizarEstatisticas(total, media, maior, menor);

                // Mostrar respostas na tabela
                container.innerHTML = respostas.map(resposta => `
                    <tr>
                        <td><strong>${resposta.participante_nome}</strong></td>
                        <td>${resposta.participante_email}</td>
                        <td>${formatDate(resposta.data_resposta)}</td>
                        <td class="pontuacao">${resposta.pontos_ganhos} pts</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="Respostas.verDetalhes(${resposta.id})">
                                👁️ Ver Detalhes
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                container.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty">Nenhuma resposta encontrada.</td>
                    </tr>
                `;
                this.atualizarEstatisticas(0, 0, 0, 0);
            }
        } catch (error) {
            showError('respostasTableBody', API.utils.handleError(error, 'carregamento de respostas'), () => this.carregar(formularioId));
        }
    },

    /**
     * Atualizar estatísticas das respostas
     * @param {number} total - Total de respostas
     * @param {number} media - Média de pontos
     * @param {number} maior - Maior pontuação
     * @param {number} menor - Menor pontuação
     */
    atualizarEstatisticas(total, media, maior, menor) {
        const elementos = {
            'totalRespostas': total,
            'pontuacaoMedia': media,
            'maiorPontuacao': maior,
            'menorPontuacao': menor
        };

        for (const [id, value] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    },

    /**
     * Ver detalhes de uma resposta
     * @param {number} respostaFormularioId - ID da resposta do formulário
     */
    async verDetalhes(respostaFormularioId) {
        try {
            const modal = document.getElementById('detalhesModal');
            const content = document.getElementById('detalhesContent');
            
            if (!modal || !content) return;

            // Mostrar modal com loading
            content.innerHTML = '<div class="loading">Carregando detalhes...</div>';
            modal.style.display = 'block';

            // Carregar detalhes
            const detalhes = await API.admin.respostas.detalhes(respostaFormularioId);

            if (detalhes && detalhes.length > 0) {
                content.innerHTML = `
                    <div class="resposta-detalhes">
                        ${detalhes.map(item => `
                            <div class="resposta-item">
                                <h4>${item.pergunta_titulo}</h4>
                                <p><strong>Tipo:</strong> ${Perguntas.obterNomeTipo(item.pergunta_tipo)}</p>
                                <p><strong>Resposta:</strong> ${item.resposta || 'Não respondido'}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content.innerHTML = '<div class="error">Nenhum detalhe encontrado.</div>';
            }

        } catch (error) {
            const content = document.getElementById('detalhesContent');
            if (content) {
                content.innerHTML = `<div class="error">${API.utils.handleError(error, 'carregamento dos detalhes')}</div>`;
            }
        }
    }
};

// ================== RANKING ==================

const Ranking = {
    /**
     * Carregar ranking administrativo
     */
    async carregar() {
        const container = document.getElementById('rankingTableBody');
        if (!container) return;

        try {
            showLoading('rankingTableBody', 'Carregando ranking...');
            const ranking = await API.admin.ranking.global();
            
            if (ranking && ranking.length > 0) {
                // Atualizar estatísticas
                this.atualizarEstatisticas(ranking);
                
                // Mostrar ranking na tabela
                container.innerHTML = ranking.map(participante => `
                    <tr>
                        <td class="posicao ${this.obterClassePosicao(participante.posicao)}">
                            ${this.obterMedalha(participante.posicao)}${participante.posicao}º
                        </td>
                        <td>
                            <div class="participante-info">
                                <div class="avatar">
                                    ${this.obterIniciais(participante.nome)}
                                </div>
                                <div class="participante-details">
                                    <h4>${participante.nome}</h4>
                                    <small>${participante.email}</small>
                                </div>
                            </div>
                        </td>
                        <td class="pontuacao">
                            ${participante.pontuacao_total.toLocaleString()} pts
                        </td>
                        <td class="formularios-count">
                            ${participante.total_formularios}
                        </td>
                    </tr>
                `).join('');
            } else {
                container.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty">
                            <div class="empty-icon">🏆</div>
                            <h3>Nenhum Imperador no ranking ainda</h3>
                            <p>Quando participantes responderem formulários, eles aparecerão aqui!</p>
                        </td>
                    </tr>
                `;
                this.atualizarEstatisticas([]);
            }
        } catch (error) {
            showError('rankingTableBody', API.utils.handleError(error, 'carregamento do ranking'), () => this.carregar());
        }
    },

    /**
     * Atualizar estatísticas do ranking
     * @param {array} ranking - Dados do ranking
     */
    atualizarEstatisticas(ranking) {
        if (ranking.length === 0) {
            const elementos = ['totalImperadores', 'pontuacaoMedia', 'maiorPontuacao', 'totalRespostas'];
            elementos.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '0';
            });
            return;
        }

        const pontuacoes = ranking.map(r => r.pontuacao_total);
        const totalFormularios = ranking.reduce((sum, r) => sum + r.total_formularios, 0);
        const media = Math.round(pontuacoes.reduce((a, b) => a + b, 0) / ranking.length);
        const maior = Math.max(...pontuacoes);

        const elementos = {
            'totalImperadores': ranking.length,
            'pontuacaoMedia': media,
            'maiorPontuacao': maior,
            'totalRespostas': totalFormularios
        };

        for (const [id, value] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    },

    /**
     * Obter iniciais do nome
     * @param {string} nome - Nome completo
     * @returns {string} - Iniciais
     */
    obterIniciais(nome) {
        return nome.split(' ')
                   .map(n => n[0])
                   .join('')
                   .substring(0, 2)
                   .toUpperCase();
    },

    /**
     * Obter medalha para posição
     * @param {number} posicao - Posição no ranking
     * @returns {string} - HTML da medalha
     */
    obterMedalha(posicao) {
        switch(posicao) {
            case 1: return '🥇 ';
            case 2: return '🥈 ';
            case 3: return '🥉 ';
            default: return '';
        }
    },

    /**
     * Obter classe CSS para posição
     * @param {number} posicao - Posição no ranking
     * @returns {string} - Classes CSS
     */
    obterClassePosicao(posicao) {
        let classes = ['posicao'];
        if (posicao <= 3) {
            classes.push('top3');
            if (posicao === 1) classes.push('primeiro');
            else if (posicao === 2) classes.push('segundo');
            else if (posicao === 3) classes.push('terceiro');
        }
        return classes.join(' ');
    }
};

// ================== VALIDAÇÕES ==================

const Validacoes = {
    /**
     * Validar dados de formulário
     * @param {object} dados - Dados do formulário
     * @returns {object} - {valido: boolean, erros: array}
     */
    formulario(dados) {
        const erros = [];

        if (!dados.titulo || dados.titulo.trim() === '') {
            erros.push('Título é obrigatório');
        }

        if (!dados.data_limite) {
            erros.push('Data limite é obrigatória');
        } else {
            const dataLimite = new Date(dados.data_limite);
            const agora = new Date();
            if (dataLimite <= agora) {
                erros.push('Data limite deve ser futura');
            }
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    /**
     * Validar dados de pergunta
     * @param {object} dados - Dados da pergunta
     * @returns {object} - {valido: boolean, erros: array}
     */
    pergunta(dados) {
        const erros = [];

        if (!dados.titulo || dados.titulo.trim() === '') {
            erros.push('Título da pergunta é obrigatório');
        }

        if (!dados.tipo) {
            erros.push('Tipo da pergunta é obrigatório');
        }

        if (dados.tipo === 'multipla_escolha' && (!dados.opcoes || dados.opcoes.trim() === '')) {
            erros.push('Opções são obrigatórias para múltipla escolha');
        }

        if (!dados.ordem || dados.ordem < 1) {
            erros.push('Ordem da pergunta deve ser um número positivo');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
};

// ================== INICIALIZAÇÃO ==================

/**
 * Inicializar funcionalidades administrativas
 */
function initAdmin() {
    // Verificar dependências
    if (typeof API === 'undefined') {
        console.error('API não disponível');
        return;
    }

    if (typeof isAuthenticated === 'undefined' || !isAuthenticated()) {
        console.error('Usuário não autenticado');
        return;
    }

    // Atualizar nome do usuário se função disponível
    if (typeof updateUserNameInUI === 'function') {
        updateUserNameInUI();
    }

    console.log('Admin.js inicializado com sucesso');
}

// ================== OBJETO ADMIN PRINCIPAL ==================

const Admin = {
    config: ADMIN_CONFIG,
    ui: {
        showMessage,
        showLoading,
        showError,
        formatDate,
        formatDateForInput
    },
    dashboard: Dashboard,
    formularios: Formularios,
    perguntas: Perguntas,
    respostas: Respostas,
    ranking: Ranking,
    validacoes: Validacoes,
    init: initAdmin
};

// ================== AUTO-INICIALIZAÇÃO ==================

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está em página administrativa
    const isAdminPage = window.location.pathname.includes('/admin/') && 
                       !window.location.pathname.includes('/login.html');
    
    if (isAdminPage) {
        // Aguardar um pouco para garantir que auth.js e api.js estão carregados
        setTimeout(initAdmin, 100);
    }
});

// ================== EXPORTAR PARA COMPATIBILIDADE ==================

// Para compatibilidade com diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin;
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.Admin = Admin;
}