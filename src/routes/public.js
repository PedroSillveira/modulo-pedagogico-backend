// ==========================================
// ROTAS PUBLIC - ÁREA PÚBLICA DOS FORMULÁRIOS
// ==========================================

const express = require('express');
const rota = express.Router();
const security = require('../security/cypher');
const execute = require('../services/execute_pedagogico');

function jsonMount(boll, data, msg) {
    return { "payload": security.jwtencript({ boleano: boll, obj: data, mensagem: msg }) };
}

function errorHandle(error, route) {
    console.log(`Erro na rota pública ${route}`);
    console.log(error);
    return jsonMount(false, {}, 'Tente novamente mais tarde!');
}

// Função para calcular pontuação baseada no tempo
function calcularPontuacao(dataAtivacao) {
    if (!dataAtivacao) return 100;
    
    const agora = new Date();
    const ativacao = new Date(dataAtivacao);
    const horasDecorridas = (agora - ativacao) / (1000 * 60 * 60);
    
    let pontos = 100;
    
    if (horasDecorridas <= 12) {
        pontos = 150;
    } else if (horasDecorridas <= 24) {
        pontos = 125;
    } else if (horasDecorridas <= 48) {
        pontos = 115;
    }
    
    return pontos;
}

// ================== FORMULÁRIOS DISPONÍVEIS ==================

rota.get('/formularios', async (req, res) => {
    try {
        const formularios = await execute.execute_get_formularios_ativos();
        return res.json(jsonMount(true, formularios, 'Formulários disponíveis!'));
    } catch (error) {
        return res.json(errorHandle(error, '/formularios'));
    }
});

rota.post('/buscar_formulario', async (req, res) => {
    try {
        const payload = req.body;
        const data = security.jwtdecript(payload);
        
        if (!data.formulario_id) {
            return res.json(jsonMount(false, {}, 'ID do formulário é obrigatório!'));
        }
        
        const formulario = await execute.execute_get_formulario_publico(data.formulario_id);
        
        if (formulario.length === 0) {
            return res.json(jsonMount(false, {}, 'Formulário não encontrado ou indisponível!'));
        }
        
        const perguntas = await execute.execute_listar_perguntas_formulario(data.formulario_id);
        
        return res.json(jsonMount(true, {
            formulario: formulario[0],
            perguntas: perguntas
        }, 'Formulário carregado!'));
    } catch (error) {
        return res.json(errorHandle(error, '/buscar_formulario'));
    }
});

// ================== VERIFICAR PARTICIPAÇÃO ==================

rota.post('/verificar_participacao', async (req, res) => {
    try {
        const payload = req.body;
        const data = security.jwtdecript(payload);
        
        if (!data.email || !data.formulario_id) {
            return res.json(jsonMount(false, {}, 'Email e formulário são obrigatórios!'));
        }
        
        const participante = await execute.execute_buscar_participante_por_email(data.email);
        
        if (participante.length === 0) {
            return res.json(jsonMount(true, { ja_respondeu: false }, 'Pode responder!'));
        }
        
        const jaRespondeu = await execute.execute_verificar_ja_respondeu(data.formulario_id, participante[0].id);
        
        return res.json(jsonMount(true, { 
            ja_respondeu: jaRespondeu.length > 0 
        }, jaRespondeu.length > 0 ? 'Já respondeu!' : 'Pode responder!'));
    } catch (error) {
        return res.json(errorHandle(error, '/verificar_participacao'));
    }
});

// ================== RESPONDER FORMULÁRIO ==================

rota.post('/responder', async (req, res) => {
    try {
        const payload = req.body;
        const data = security.jwtdecript(payload);
        
        if (!data.formulario_id || !data.nome || !data.email || !data.respostas) {
            return res.json(jsonMount(false, {}, 'Dados incompletos!'));
        }
        
        // Verificar se formulário está disponível
        const formularioStatus = await execute.execute_verificar_formulario_ativo(data.formulario_id);
        
        if (formularioStatus.length === 0 || !formularioStatus[0].ativo) {
            return res.json(jsonMount(false, {}, 'Formulário indisponível!'));
        }
        
        if (new Date(formularioStatus[0].data_limite) < new Date()) {
            return res.json(jsonMount(false, {}, 'Prazo expirado!'));
        }
        
        // Buscar ou criar participante
        let participante = await execute.execute_buscar_participante_por_email(data.email);
        let participante_id;
        
        if (participante.length === 0) {
            const novoParticipante = await execute.execute_criar_participante(data.nome, data.email);
            participante_id = novoParticipante[0].id;
        } else {
            participante_id = participante[0].id;
            
            // Verificar se já respondeu
            const jaRespondeu = await execute.execute_verificar_ja_respondeu(data.formulario_id, participante_id);
            if (jaRespondeu.length > 0) {
                return res.json(jsonMount(false, {}, 'Você já respondeu este formulário!'));
            }
            
            await execute.execute_atualizar_participante(participante_id, data.nome);
        }
        
        // Calcular pontuação
        const dataAtivacao = await execute.execute_get_data_ativacao_formulario(data.formulario_id);
        const pontosGanhos = calcularPontuacao(dataAtivacao[0]?.data_ativacao);
        
        // Criar resposta do formulário
        const respostaFormulario = await execute.execute_criar_resposta_formulario(
            data.formulario_id,
            participante_id,
            pontosGanhos
        );
        
        // Salvar respostas individuais
        for (const resposta of data.respostas) {
            if (resposta.pergunta_id && resposta.resposta !== undefined) {
                await execute.execute_criar_resposta_individual(
                    respostaFormulario[0].id,
                    resposta.pergunta_id,
                    resposta.resposta.toString()
                );
            }
        }
        
        // Atualizar pontuação do participante
        await execute.execute_atualizar_pontuacao_participante(participante_id);
        
        return res.json(jsonMount(true, {
            pontos_ganhos: pontosGanhos
        }, `Sucesso! Você ganhou ${pontosGanhos} pontos!`));
    } catch (error) {
        return res.json(errorHandle(error, '/responder'));
    }
});

// ================== RANKING ==================

rota.get('/ranking', async (req, res) => {
    try {
        const ranking = await execute.execute_get_ranking_global();
        return res.json(jsonMount(true, ranking, 'Ranking carregado!'));
    } catch (error) {
        return res.json(errorHandle(error, '/ranking'));
    }
});

rota.post('/buscar_imperador', async (req, res) => {
    try {
        const payload = req.body;
        const data = security.jwtdecript(payload);
        
        if (!data.email) {
            return res.json(jsonMount(false, {}, 'Email é obrigatório!'));
        }
        
        const participante = await execute.execute_buscar_participante_por_email(data.email);
        
        if (participante.length === 0) {
            return res.json(jsonMount(false, {}, 'Imperador não encontrado!'));
        }
        
        const ranking = await execute.execute_get_ranking_global();
        const posicao = ranking.findIndex(p => p.email === data.email) + 1;
        
        return res.json(jsonMount(true, {
            ...participante[0],
            posicao_ranking: posicao || 'Não classificado'
        }, 'Imperador encontrado!'));
    } catch (error) {
        return res.json(errorHandle(error, '/buscar_imperador'));
    }
});

// ================== ESTATÍSTICAS SIMPLES ==================

rota.get('/estatisticas', async (req, res) => {
    try {
        const estatisticas = await execute.execute_get_estatisticas_gerais();
        
        const dados = {
            formularios_ativos: estatisticas[0]?.formularios_ativos || 0,
            total_participantes: estatisticas[0]?.total_participantes || 0,
            total_respostas: estatisticas[0]?.total_respostas || 0
        };
        
        return res.json(jsonMount(true, dados, 'Estatísticas carregadas!'));
    } catch (error) {
        return res.json(errorHandle(error, '/estatisticas'));
    }
});

module.exports = rota;