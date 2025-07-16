

const models = require('../models/model_pedagogico');
const { postgres } = require('../server/connect');

// ================== USUÁRIOS ADMINISTRATIVOS ==================

async function execute_login_usuario(email, senha) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.login_usuario(email, senha));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_usuario_by_id(usuario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_usuario_by_id(usuario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== GERENCIAMENTO DE FORMULÁRIOS ==================

async function execute_listar_formularios() {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.listar_formularios());
        return ret.rows;
    } catch (error) {
        console.error('Erro ao listar formulários:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_formulario_by_id(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_formulario_by_id(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_criar_formulario(titulo, descricao, data_limite, usuario_criador_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.criar_formulario(titulo, descricao, data_limite, usuario_criador_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao criar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_editar_formulario(formulario_id, titulo, descricao, data_limite) {
    const client = await postgres.connect();
    try {
        await client.query(models.editar_formulario(formulario_id, titulo, descricao, data_limite));
    } catch (error) {
        console.error('Erro ao editar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_ativar_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        await client.query(models.ativar_formulario(formulario_id));
    } catch (error) {
        console.error('Erro ao ativar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_desativar_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        await client.query(models.desativar_formulario(formulario_id));
    } catch (error) {
        console.error('Erro ao desativar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_delete_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        await client.query(models.delete_formulario(formulario_id));
    } catch (error) {
        console.error('Erro ao deletar formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_formularios_ativos() {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_formularios_ativos());
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar formulários ativos:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_formulario_publico(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_formulario_publico(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar formulário público:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== CRIAÇÃO E EDIÇÃO DE PERGUNTAS ==================

async function execute_listar_perguntas_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.listar_perguntas_formulario(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao listar perguntas:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_criar_pergunta(formulario_id, titulo, tipo, opcoes, ordem, obrigatoria) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.criar_pergunta(formulario_id, titulo, tipo, opcoes, ordem, obrigatoria));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao criar pergunta:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_editar_pergunta(pergunta_id, titulo, tipo, opcoes, obrigatoria) {
    const client = await postgres.connect();
    try {
        await client.query(models.editar_pergunta(pergunta_id, titulo, tipo, opcoes, obrigatoria));
    } catch (error) {
        console.error('Erro ao editar pergunta:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_delete_pergunta(pergunta_id) {
    const client = await postgres.connect();
    try {
        await client.query(models.delete_pergunta(pergunta_id));
    } catch (error) {
        console.error('Erro ao deletar pergunta:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_reordenar_perguntas(formulario_id, pergunta_id, nova_ordem) {
    const client = await postgres.connect();
    try {
        await client.query(models.reordenar_perguntas(formulario_id, pergunta_id, nova_ordem));
    } catch (error) {
        console.error('Erro ao reordenar perguntas:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== CONTROLE DE PARTICIPANTES ==================

async function execute_buscar_participante_por_email(email) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.buscar_participante_por_email(email));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar participante:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_criar_participante(nome, email) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.criar_participante(nome, email));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao criar participante:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_atualizar_participante(participante_id, nome) {
    const client = await postgres.connect();
    try {
        await client.query(models.atualizar_participante(participante_id, nome));
    } catch (error) {
        console.error('Erro ao atualizar participante:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_verificar_ja_respondeu(formulario_id, participante_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.verificar_ja_respondeu(formulario_id, participante_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao verificar resposta:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_atualizar_pontuacao_participante(participante_id) {
    const client = await postgres.connect();
    try {
        await client.query(models.atualizar_pontuacao_participante(participante_id));
    } catch (error) {
        console.error('Erro ao atualizar pontuação:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== SISTEMA DE PONTUAÇÃO ==================

async function execute_criar_resposta_formulario(formulario_id, participante_id, pontos_ganhos) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.criar_resposta_formulario(formulario_id, participante_id, pontos_ganhos));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao criar resposta do formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_criar_resposta_individual(resposta_formulario_id, pergunta_id, resposta) {
    const client = await postgres.connect();
    try {
        await client.query(models.criar_resposta_individual(resposta_formulario_id, pergunta_id, resposta));
    } catch (error) {
        console.error('Erro ao criar resposta individual:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_data_ativacao_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_data_ativacao_formulario(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar data de ativação:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_respostas_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_respostas_formulario(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar respostas do formulário:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_detalhes_resposta(resposta_formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_detalhes_resposta(resposta_formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar detalhes da resposta:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== RANKING GLOBAL ==================

async function execute_get_ranking_global() {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_ranking_global());
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar ranking global:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_top_participantes(limite = 10) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_top_participantes(limite));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar top participantes:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_get_estatisticas_gerais() {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.get_estatisticas_gerais());
        return ret.rows;
    } catch (error) {
        console.error('Erro ao buscar estatísticas gerais:', error);
        throw error;
    } finally {
        client.release();
    }
}

// ================== CONSULTAS AUXILIARES ==================

async function execute_count_respostas_formulario(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.count_respostas_formulario(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao contar respostas:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function execute_verificar_formulario_ativo(formulario_id) {
    const client = await postgres.connect();
    try {
        const ret = await client.query(models.verificar_formulario_ativo(formulario_id));
        return ret.rows;
    } catch (error) {
        console.error('Erro ao verificar formulário ativo:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    // Usuários
    execute_login_usuario,
    execute_get_usuario_by_id,
    
    // Formulários
    execute_listar_formularios,
    execute_get_formulario_by_id,
    execute_criar_formulario,
    execute_editar_formulario,
    execute_ativar_formulario,
    execute_desativar_formulario,
    execute_delete_formulario,
    execute_get_formularios_ativos,
    execute_get_formulario_publico,
    
    // Perguntas
    execute_listar_perguntas_formulario,
    execute_criar_pergunta,
    execute_editar_pergunta,
    execute_delete_pergunta,
    execute_reordenar_perguntas,
    
    // Participantes
    execute_buscar_participante_por_email,
    execute_criar_participante,
    execute_atualizar_participante,
    execute_verificar_ja_respondeu,
    execute_atualizar_pontuacao_participante,
    
    // Pontuação
    execute_criar_resposta_formulario,
    execute_criar_resposta_individual,
    execute_get_data_ativacao_formulario,
    execute_get_respostas_formulario,
    execute_get_detalhes_resposta,
    
    // Ranking
    execute_get_ranking_global,
    execute_get_top_participantes,
    execute_get_estatisticas_gerais,
    
    // Auxiliares
    execute_count_respostas_formulario,
    execute_verificar_formulario_ativo
};