// ==========================================
// PUBLIC.JS - FUNCIONALIDADES PÚBLICAS
// ==========================================

// ================== CONFIGURAÇÕES ==================

const PUBLIC_CONFIG = {
    MESSAGES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    TIMEOUTS: {
        MESSAGE: 5000,
        REDIRECT: 2000
    },
    PAGES: {
        INDEX: 'index.html',
        FORMULARIO: 'formulario.html',
        RANKING: 'ranking.html',
        SUCESSO: 'sucesso.html'
    }
};

// ================== FUNÇÕES DE UI PÚBLICAS ==================

/**
 * Mostrar mensagem na interface pública
 * @param {string} text - Texto da mensagem
 * @param {string} type - Tipo da mensagem
 * @param {string} containerId - ID do container da mensagem
 */
function showPublicMessage(text, type = 'info', containerId = 'message') {
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
    }, PUBLIC_CONFIG.TIMEOUTS.MESSAGE);
}

/**
 * Mostrar loading público
 * @param {string} elementId - ID do elemento
 * @param {string} text - Texto do loading
 */
function showPublicLoading(elementId, text = 'Carregando...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <h3>${text}</h3>
            </div>
        `;
    }
}

/**
 * Mostrar erro público
 * @param {string} elementId - ID do elemento
 * @param {string} text - Texto do erro
 * @param {function} retryFunction - Função para tentar novamente
 */
function showPublicError(elementId, text, retryFunction = null) {
    const element = document.getElementById(elementId);
    if (element) {
        let errorHTML = `
            <div class="error">
                <h3>❌ Erro</h3>
                <p>${text}</p>
        `;
        if (retryFunction) {
            errorHTML += `<button onclick="${retryFunction.name}()" style="background: white; color: #e74c3c; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px;">🔄 Tentar Novamente</button>`;
        }
        errorHTML += '</div>';
        element.innerHTML = errorHTML;
    }
}

/**
 * Formatar data para exibição pública
 * @param {string} dateString - String da data
 * @returns {string} - Data formatada
 */
function formatPublicDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

/**
 * Calcular tempo restante
 * @param {string} dataLimite - Data limite
 * @returns {object} - Objeto com texto e status de urgência
 */
function calcularTempoRestante(dataLimite) {
    const agora = new Date();
    const limite = new Date(dataLimite);
    const diferenca = limite - agora;

    if (diferenca <= 0) {
        return { texto: 'Expirado', urgente: true, expirado: true };
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (dias > 0) {
        return { 
            texto: `${dias} dia${dias > 1 ? 's' : ''} restante${dias > 1 ? 's' : ''}`,
            urgente: dias <= 1,
            expirado: false
        };
    } else if (horas > 0) {
        return { 
            texto: `${horas} hora${horas > 1 ? 's' : ''} restante${horas > 1 ? 's' : ''}`,
            urgente: true,
            expirado: false
        };
    } else {
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        return { 
            texto: `${minutos} minuto${minutos > 1 ? 's' : ''} restante${minutos > 1 ? 's' : ''}`,
            urgente: true,
            expirado: false
        };
    }
}

// ================== FORMULÁRIOS PÚBLICOS ==================

const FormulariosPublicos = {
    /**
     * Carregar lista de formulários disponíveis
     */
    async carregarLista() {
        const container = document.getElementById('formulariosContainer');
        if (!container) return;

        try {
            showPublicLoading('formulariosContainer', 'Carregando formulários disponíveis...');
            const formularios = await API.public.formularios.listar();
            
            if (formularios && formularios.length > 0) {
                container.innerHTML = `
                    <div class="formularios-grid">
                        ${formularios.map(form => {
                            const tempoRestante = calcularTempoRestante(form.data_limite);
                            
                            return `
                                <div class="formulario-card">
                                    <div class="formulario-header">
                                        <h3>${form.titulo}</h3>
                                        <div class="prazo">
                                            🕒 Prazo: ${formatPublicDate(form.data_limite)}
                                        </div>
                                    </div>
                                    <div class="formulario-content">
                                        <p>${form.descricao || 'Participe e ganhe pontos!'}</p>
                                    </div>
                                    <div class="formulario-actions">
                                        <a href="formulario.html?id=${form.id}" class="btn">
                                            📝 Responder
                                        </a>
                                        <div class="tempo-restante ${tempoRestante.urgente ? 'urgente' : ''}">
                                            ${tempoRestante.texto}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">📝</div>
                        <h3>Nenhum formulário disponível</h3>
                        <p>No momento não há formulários ativos para responder.</p>
                        <p>Volte em breve para novas oportunidades!</p>
                    </div>
                `;
            }
        } catch (error) {
            showPublicError('formulariosContainer', 
                'Erro ao carregar formulários: ' + (error.message || 'Erro desconhecido'), 
                () => this.carregarLista());
        }
    },

    /**
     * Carregar formulário específico para resposta
     * @param {number} formularioId - ID do formulário
     * @returns {object} - Dados do formulário e perguntas
     */
    async carregarFormulario(formularioId) {
        try {
            const data = await API.public.formularios.buscar(formularioId);
            
            // Verificar se não expirou
            const tempoRestante = calcularTempoRestante(data.formulario.data_limite);
            if (tempoRestante.expirado) {
                throw new Error('Este formulário já expirou e não aceita mais respostas.');
            }

            return data;
        } catch (error) {
            throw new Error('Erro ao carregar formulário: ' + (error.message || 'Erro desconhecido'));
        }
    },

    /**
     * Verificar se participante já respondeu
     * @param {string} email - Email do participante
     * @param {number} formularioId - ID do formulário
     * @returns {boolean} - True se já respondeu
     */
    async verificarParticipacao(email, formularioId) {
        try {
            const resultado = await API.public.formularios.verificarParticipacao(email, formularioId);
            return resultado.ja_respondeu;
        } catch (error) {
            console.error('Erro ao verificar participação:', error);
            return false;
        }
    },

    /**
     * Enviar resposta do formulário
     * @param {object} dadosResposta - Dados da resposta
     * @returns {object} - Resultado do envio
     */
    async enviarResposta(dadosResposta) {
        try {
            // Validar dados antes de enviar
            const validacao = Validacoes.respostaFormulario(dadosResposta);
            if (!validacao.valido) {
                throw new Error(validacao.erros.join(', '));
            }

            const resultado = await API.public.formularios.responder(dadosResposta);
            return resultado;
        } catch (error) {
            throw new Error('Erro ao enviar formulário: ' + (error.message || 'Erro desconhecido'));
        }
    }
};

// ================== RANKING PÚBLICO ==================

const RankingPublico = {
    /**
     * Carregar ranking completo
     */
    async carregar() {
        const container = document.getElementById('rankingContainer');
        if (!container) return;

        try {
            showPublicLoading('rankingContainer', 'Carregando ranking...');
            const ranking = await API.public.ranking.obter();
            
            if (ranking && ranking.length > 0) {
                // Atualizar estatísticas
                this.atualizarEstatisticas(ranking);
                
                // Mostrar ranking
                this.mostrarRanking(ranking);
            } else {
                container.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">🏆</div>
                        <h3>Nenhum Imperador no ranking ainda</h3>
                        <p>Seja o primeiro a responder formulários e dominar o ranking!</p>
                        <a href="index.html" style="background: #667eea; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 20px;">
                            📝 Ver Formulários
                        </a>
                    </div>
                `;
            }
        } catch (error) {
            showPublicError('rankingContainer', 
                'Erro ao carregar ranking: ' + (error.message || 'Erro desconhecido'), 
                () => this.carregar());
        }
    },

    /**
     * Mostrar ranking na interface
     * @param {array} ranking - Dados do ranking
     */
    mostrarRanking(ranking) {
        const container = document.getElementById('rankingContainer');
        if (!container) return;

        // Top 3 (Pódio)
        const top3 = ranking.slice(0, 3);
        let podiumHtml = '';
        
        if (top3.length > 0) {
            podiumHtml = `
                <div class="ranking-container">
                    <div class="ranking-header">
                        <h3>🏆 Pódio dos Imperadores</h3>
                    </div>
                    <div class="podium">
                        ${top3.map((participante, index) => {
                            const classes = ['segundo', 'primeiro', 'terceiro'];
                            const medals = ['🥈', '🥇', '🥉'];
                            return `
                                <div class="podium-item ${classes[index]}">
                                    <div class="medal">${medals[index]}</div>
                                    <div class="avatar">${this.obterIniciais(participante.nome)}</div>
                                    <div class="participante-nome">${participante.nome}</div>
                                    <div class="participante-pontos">${participante.pontuacao_total.toLocaleString()} pts</div>
                                    <small style="color: #666;">${participante.total_formularios} formulário${participante.total_formularios !== 1 ? 's' : ''}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
            `;
        }

        // Tabela completa
        const tabelaHtml = `
                    <div class="ranking-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 80px; text-align: center;">Posição</th>
                                    <th>Imperador</th>
                                    <th style="width: 120px; text-align: center;">Pontuação</th>
                                    <th style="width: 120px; text-align: center;">Formulários</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ranking.map(participante => `
                                    <tr>
                                        <td class="posicao">
                                            ${participante.posicao}º
                                        </td>
                                        <td>
                                            <div class="participante-info">
                                                <div class="avatar-small">
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
                                        <td style="text-align: center; color: #666;">
                                            ${participante.total_formularios}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
        `;

        container.innerHTML = podiumHtml + tabelaHtml;
    },

    /**
     * Atualizar estatísticas do ranking
     * @param {array} ranking - Dados do ranking
     */
    atualizarEstatisticas(ranking) {
        if (ranking.length === 0) return;

        const pontuacoes = ranking.map(r => r.pontuacao_total);
        const totalFormularios = ranking.reduce((sum, r) => sum + r.total_formularios, 0);
        const media = Math.round(pontuacoes.reduce((a, b) => a + b, 0) / ranking.length);
        const maior = Math.max(...pontuacoes);

        const elementos = {
            'totalImperadores': ranking.length,
            'pontuacaoMedia': media,
            'maiorPontuacao': maior,
            'totalFormularios': totalFormularios
        };

        for (const [id, value] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    },

    /**
     * Buscar imperador específico
     * @param {string} email - Email do participante
     * @returns {object} - Dados do participante
     */
    async buscarImperador(email) {
        try {
            if (!API.utils.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            const resultado = await API.public.ranking.buscarImperador(email);
            return resultado;
        } catch (error) {
            throw new Error('Imperador não encontrado: ' + (error.message || 'Erro desconhecido'));
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
    }
};

// ================== ESTATÍSTICAS PÚBLICAS ==================

const EstatisticasPublicas = {
    /**
     * Carregar estatísticas públicas
     */
    async carregar() {
        try {
            const stats = await API.public.estatisticas.obter();
            this.atualizar(stats);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    },

    /**
     * Atualizar estatísticas na interface
     * @param {object} stats - Estatísticas
     */
    atualizar(stats) {
        const elementos = {
            'totalFormularios': stats.formularios_ativos || 0,
            'totalParticipantes': stats.total_participantes || 0,
            'totalRespostas': stats.total_respostas || 0
        };

        for (const [id, value] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                // Mostrar container se encontrou dados
                const container = element.closest('.stats-bar');
                if (container && value > 0) {
                    container.style.display = 'block';
                }
            }
        }
    }
};

// ================== VALIDAÇÕES PÚBLICAS ==================

const Validacoes = {
    /**
     * Validar email
     * @param {string} email - Email para validar
     * @returns {boolean} - True se válido
     */
    email(email) {
        return API.utils.isValidEmail(email);
    },

    /**
     * Validar dados de resposta do formulário
     * @param {object} dados - Dados da resposta
     * @returns {object} - {valido: boolean, erros: array}
     */
    respostaFormulario(dados) {
        const erros = [];

        if (!dados.formulario_id) {
            erros.push('ID do formulário é obrigatório');
        }

        if (!dados.nome || dados.nome.trim() === '') {
            erros.push('Nome é obrigatório');
        }

        if (!dados.email || dados.email.trim() === '') {
            erros.push('Email é obrigatório');
        } else if (!this.email(dados.email)) {
            erros.push('Email inválido');
        }

        if (!dados.respostas || !Array.isArray(dados.respostas) || dados.respostas.length === 0) {
            erros.push('Pelo menos uma resposta é obrigatória');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
};

// ================== UTILITÁRIOS PÚBLICOS ==================

const UtilitariosPublicos = {
    /**
     * Redirecionar para página de sucesso
     * @param {number} pontos - Pontos ganhos
     * @param {string} email - Email do participante
     */
    redirecionarParaSucesso(pontos, email = '') {
        const params = new URLSearchParams();
        params.append('pontos', pontos);
        if (email) {
            params.append('email', email);
        }
        
        setTimeout(() => {
            window.location.href = `sucesso.html?${params.toString()}`;
        }, PUBLIC_CONFIG.TIMEOUTS.REDIRECT);
    },

    /**
     * Obter parâmetro da URL
     * @param {string} name - Nome do parâmetro
     * @returns {string|null} - Valor do parâmetro ou null
     */
    obterParametroURL(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * Scroll suave para elemento
     * @param {string} elementId - ID do elemento
     */
    scrollSuave(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Copiar texto para clipboard
     * @param {string} texto - Texto para copiar
     * @returns {boolean} - True se copiou com sucesso
     */
    async copiarTexto(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (error) {
            console.error('Erro ao copiar texto:', error);
            return false;
        }
    }
};

// ================== GERENCIADOR DE FORMULÁRIO DINÂMICO ==================

const FormularioDinamico = {
    /**
     * Gerar HTML para diferentes tipos de pergunta
     * @param {object} pergunta - Dados da pergunta
     * @returns {string} - HTML da pergunta
     */
    gerarPerguntaHTML(pergunta) {
        const obrigatoriaLabel = pergunta.obrigatoria ? '<span class="required">*</span>' : '';
        
        let inputHtml = '';
        
        switch (pergunta.tipo) {
            case 'texto':
                inputHtml = `<textarea id="pergunta-${pergunta.id}" placeholder="Digite sua resposta..." ${pergunta.obrigatoria ? 'required' : ''}></textarea>`;
                break;
                
            case 'multipla_escolha':
                const opcoes = JSON.parse(pergunta.opcoes || '[]');
                inputHtml = `
                    <div class="opcoes-container">
                        ${opcoes.map((opcao, index) => `
                            <div class="opcao-item" onclick="FormularioDinamico.selecionarOpcao(${pergunta.id}, '${opcao}', this)">
                                <input type="radio" name="pergunta-${pergunta.id}" value="${opcao}" id="opcao-${pergunta.id}-${index}" ${pergunta.obrigatoria ? 'required' : ''}>
                                <label for="opcao-${pergunta.id}-${index}">${opcao}</label>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'escala_1_5':
                inputHtml = `
                    <div class="escala-container">
                        ${[1,2,3,4,5].map(valor => `
                            <div class="escala-item" onclick="FormularioDinamico.selecionarEscala(${pergunta.id}, ${valor})">
                                <div class="escala-botao" id="escala-${pergunta.id}-${valor}">${valor}</div>
                                <small>${valor === 1 ? 'Muito Ruim' : valor === 5 ? 'Excelente' : ''}</small>
                            </div>
                        `).join('')}
                        <input type="hidden" id="pergunta-${pergunta.id}" ${pergunta.obrigatoria ? 'required' : ''}>
                    </div>
                `;
                break;
                
            case 'escala_1_10':
                inputHtml = `
                    <div class="escala-container">
                        ${[1,2,3,4,5,6,7,8,9,10].map(valor => `
                            <div class="escala-item" onclick="FormularioDinamico.selecionarEscala(${pergunta.id}, ${valor})">
                                <div class="escala-botao" id="escala-${pergunta.id}-${valor}">${valor}</div>
                            </div>
                        `).join('')}
                        <input type="hidden" id="pergunta-${pergunta.id}" ${pergunta.obrigatoria ? 'required' : ''}>
                    </div>
                `;
                break;
                
            case 'sim_nao':
                inputHtml = `
                    <div class="opcoes-container">
                        <div class="opcao-item" onclick="FormularioDinamico.selecionarOpcao(${pergunta.id}, 'Sim', this)">
                            <input type="radio" name="pergunta-${pergunta.id}" value="Sim" id="sim-${pergunta.id}" ${pergunta.obrigatoria ? 'required' : ''}>
                            <label for="sim-${pergunta.id}">✅ Sim</label>
                        </div>
                        <div class="opcao-item" onclick="FormularioDinamico.selecionarOpcao(${pergunta.id}, 'Não', this)">
                            <input type="radio" name="pergunta-${pergunta.id}" value="Não" id="nao-${pergunta.id}" ${pergunta.obrigatoria ? 'required' : ''}>
                            <label for="nao-${pergunta.id}">❌ Não</label>
                        </div>
                    </div>
                `;
                break;
                
            case 'numero':
                inputHtml = `<input type="number" id="pergunta-${pergunta.id}" placeholder="Digite um número..." ${pergunta.obrigatoria ? 'required' : ''}>`;
                break;
                
            case 'data':
                inputHtml = `<input type="date" id="pergunta-${pergunta.id}" ${pergunta.obrigatoria ? 'required' : ''}>`;
                break;
                
            default:
                inputHtml = `<input type="text" id="pergunta-${pergunta.id}" placeholder="Digite sua resposta..." ${pergunta.obrigatoria ? 'required' : ''}>`;
        }
        
        return `
            <div class="pergunta-container">
                <div class="pergunta-titulo">
                    ${pergunta.ordem}. ${pergunta.titulo} ${obrigatoriaLabel}
                </div>
                ${inputHtml}
            </div>
        `;
    },

    /**
     * Selecionar opção (múltipla escolha / sim-não)
     * @param {number} perguntaId - ID da pergunta
     * @param {string} valor - Valor selecionado
     * @param {HTMLElement} elemento - Elemento clicado
     */
    selecionarOpcao(perguntaId, valor, elemento) {
        // Remover seleção anterior
        const opcoes = elemento.parentElement.querySelectorAll('.opcao-item');
        opcoes.forEach(opt => opt.classList.remove('selected'));
        
        // Adicionar seleção atual
        elemento.classList.add('selected');
        
        // Marcar radio
        const radio = elemento.querySelector('input[type="radio"]');
        radio.checked = true;
    },

    /**
     * Selecionar escala
     * @param {number} perguntaId - ID da pergunta
     * @param {number} valor - Valor da escala
     */
    selecionarEscala(perguntaId, valor) {
        // Remover seleção anterior
        const container = document.querySelector(`#pergunta-${perguntaId}`).closest('.escala-container');
        const botoes = container.querySelectorAll('.escala-botao');
        botoes.forEach(botao => botao.classList.remove('selected'));
        
        // Adicionar seleção atual
        const botaoSelecionado = document.getElementById(`escala-${perguntaId}-${valor}`);
        if (botaoSelecionado) {
            botaoSelecionado.classList.add('selected');
        }
        
        // Definir valor no input hidden
        const input = document.getElementById(`pergunta-${perguntaId}`);
        input.value = valor;
    },

    /**
     * Coletar respostas do formulário
     * @param {array} perguntas - Lista de perguntas
     * @returns {array} - Array de respostas
     */
    coletarRespostas(perguntas) {
        const respostas = [];
        
        perguntas.forEach(pergunta => {
            const elemento = document.getElementById(`pergunta-${pergunta.id}`);
            let resposta = elemento ? elemento.value : '';
            
            if (resposta && resposta.trim() !== '') {
                respostas.push({
                    pergunta_id: pergunta.id,
                    resposta: resposta
                });
            }
        });
        
        return respostas;
    }
};

// ================== INICIALIZAÇÃO PÚBLICA ==================

/**
 * Inicializar funcionalidades públicas
 */
function initPublic() {
    // Verificar dependências
    if (typeof API === 'undefined') {
        console.error('API não disponível');
        return;
    }

    console.log('Public.js inicializado com sucesso');
}

// ================== OBJETO PUBLIC PRINCIPAL ==================

const Public = {
    config: PUBLIC_CONFIG,
    ui: {
        showMessage: showPublicMessage,
        showLoading: showPublicLoading,
        showError: showPublicError,
        formatDate: formatPublicDate,
        calcularTempoRestante
    },
    formularios: FormulariosPublicos,
    ranking: RankingPublico,
    estatisticas: EstatisticasPublicas,
    validacoes: Validacoes,
    utils: UtilitariosPublicos,
    formularioDinamico: FormularioDinamico,
    init: initPublic
};

// ================== AUTO-INICIALIZAÇÃO ==================

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está em página pública
    const isPublicPage = window.location.pathname.includes('/forms/');
    
    if (isPublicPage) {
        // Aguardar um pouco para garantir que api.js está carregado
        setTimeout(initPublic, 100);
    }
});

// ================== EXPORTAR PARA COMPATIBILIDADE ==================

// Para compatibilidade com diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Public;
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.Public = Public;
}