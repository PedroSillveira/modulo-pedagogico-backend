function login_usuario(email, senha) {
    return `
        SELECT 
            id,
            nome,
            email,
            ativo
        FROM usuarios 
        WHERE email = '${email}' 
        AND senha = '${senha}' 
        AND ativo = true
    `;
}

function get_usuario_by_id(usuario_id) {
    return `
        SELECT id, nome, email, ativo
        FROM usuarios 
        WHERE id = ${usuario_id} AND ativo = true
    `;
}

// ================== GERENCIAMENTO DE FORMULÁRIOS ==================

function listar_formularios() {
    return `
        SELECT 
            f.id,
            f.titulo,
            f.descricao,
            f.data_limite,
            f.ativo,
            f.data_criacao,
            f.data_ativacao,
            u.nome as criador_nome,
            (SELECT COUNT(*) FROM resposta_formulario rf WHERE rf.formulario_id = f.id) as total_respostas
        FROM formulario f
        LEFT JOIN usuarios u ON f.usuario_criador_id = u.id
        ORDER BY f.data_criacao DESC
    `;
}

function get_formulario_by_id(formulario_id) {
    return `
        SELECT 
            f.*,
            u.nome as criador_nome
        FROM formulario f
        LEFT JOIN usuarios u ON f.usuario_criador_id = u.id
        WHERE f.id = ${formulario_id}
    `;
}

function criar_formulario(titulo, descricao, data_limite, usuario_criador_id) {
    return `
        INSERT INTO formulario (titulo, descricao, data_limite, usuario_criador_id)
        VALUES ('${titulo}', '${descricao}', '${data_limite}', ${usuario_criador_id})
        RETURNING id
    `;
}

function editar_formulario(formulario_id, titulo, descricao, data_limite) {
    return `
        UPDATE formulario 
        SET titulo = '${titulo}', 
            descricao = '${descricao}', 
            data_limite = '${data_limite}'
        WHERE id = ${formulario_id}
    `;
}

function ativar_formulario(formulario_id) {
    return `
        UPDATE formulario 
        SET ativo = true, 
            data_ativacao = CURRENT_TIMESTAMP
        WHERE id = ${formulario_id}
    `;
}

function desativar_formulario(formulario_id) {
    return `
        UPDATE formulario 
        SET ativo = false
        WHERE id = ${formulario_id}
    `;
}

function delete_formulario(formulario_id) {
    return `
        DELETE FROM formulario 
        WHERE id = ${formulario_id}
    `;
}

function get_formularios_ativos() {
    return `
        SELECT 
            id,
            titulo,
            descricao,
            data_limite
        FROM formulario 
        WHERE ativo = true 
        AND data_limite > CURRENT_TIMESTAMP
        ORDER BY data_criacao DESC
    `;
}

// ================== CRIAÇÃO E EDIÇÃO DE PERGUNTAS ==================

function listar_perguntas_formulario(formulario_id) {
    return `
        SELECT 
            id,
            titulo,
            tipo,
            opcoes,
            ordem,
            obrigatoria
        FROM pergunta 
        WHERE formulario_id = ${formulario_id}
        ORDER BY ordem ASC
    `;
}

function criar_pergunta(formulario_id, titulo, tipo, opcoes, ordem, obrigatoria) {
    const opcoesSQL = opcoes ? `'${opcoes}'` : 'NULL';
    return `
        INSERT INTO pergunta (formulario_id, titulo, tipo, opcoes, ordem, obrigatoria)
        VALUES (${formulario_id}, '${titulo}', '${tipo}', ${opcoesSQL}, ${ordem}, ${obrigatoria})
        RETURNING id
    `;
}

function editar_pergunta(pergunta_id, titulo, tipo, opcoes, obrigatoria) {
    const opcoesSQL = opcoes ? `'${opcoes}'` : 'NULL';
    return `
        UPDATE pergunta 
        SET titulo = '${titulo}', 
            tipo = '${tipo}', 
            opcoes = ${opcoesSQL}, 
            obrigatoria = ${obrigatoria}
        WHERE id = ${pergunta_id}
    `;
}

function delete_pergunta(pergunta_id) {
    return `
        DELETE FROM pergunta 
        WHERE id = ${pergunta_id}
    `;
}

function reordenar_perguntas(formulario_id, pergunta_id, nova_ordem) {
    return `
        UPDATE pergunta 
        SET ordem = ${nova_ordem}
        WHERE id = ${pergunta_id} 
        AND formulario_id = ${formulario_id}
    `;
}

// ================== CONTROLE DE PARTICIPANTES ==================

function buscar_participante_por_email(email) {
    return `
        SELECT id, nome, email, pontuacao_total, total_formularios
        FROM participante 
        WHERE email = '${email}'
    `;
}

function criar_participante(nome, email) {
    return `
        INSERT INTO participante (nome, email)
        VALUES ('${nome}', '${email}')
        RETURNING id
    `;
}

function atualizar_participante(participante_id, nome) {
    return `
        UPDATE participante 
        SET nome = '${nome}'
        WHERE id = ${participante_id}
    `;
}

function verificar_ja_respondeu(formulario_id, participante_id) {
    return `
        SELECT id 
        FROM resposta_formulario 
        WHERE formulario_id = ${formulario_id} 
        AND participante_id = ${participante_id}
    `;
}

function atualizar_pontuacao_participante(participante_id) {
    return `
        UPDATE participante 
        SET pontuacao_total = (
            SELECT COALESCE(SUM(pontos_ganhos), 0) 
            FROM resposta_formulario 
            WHERE participante_id = ${participante_id}
        ),
        total_formularios = (
            SELECT COUNT(*) 
            FROM resposta_formulario 
            WHERE participante_id = ${participante_id}
        )
        WHERE id = ${participante_id}
    `;
}

// ================== SISTEMA DE PONTUAÇÃO ==================

function criar_resposta_formulario(formulario_id, participante_id, pontos_ganhos) {
    return `
        INSERT INTO resposta_formulario (formulario_id, participante_id, pontos_ganhos)
        VALUES (${formulario_id}, ${participante_id}, ${pontos_ganhos})
        RETURNING id
    `;
}

function criar_resposta_individual(resposta_formulario_id, pergunta_id, resposta) {
    return `
        INSERT INTO resposta (resposta_formulario_id, pergunta_id, resposta)
        VALUES (${resposta_formulario_id}, ${pergunta_id}, '${resposta}')
    `;
}

function get_data_ativacao_formulario(formulario_id) {
    return `
        SELECT data_ativacao 
        FROM formulario 
        WHERE id = ${formulario_id} AND ativo = true
    `;
}

function get_respostas_formulario(formulario_id) {
    return `
        SELECT 
            rf.id,
            rf.data_resposta,
            rf.pontos_ganhos,
            p.nome as participante_nome,
            p.email as participante_email
        FROM resposta_formulario rf
        LEFT JOIN participante p ON rf.participante_id = p.id
        WHERE rf.formulario_id = ${formulario_id}
        ORDER BY rf.data_resposta DESC
    `;
}

function get_detalhes_resposta(resposta_formulario_id) {
    return `
        SELECT 
            r.resposta,
            pg.titulo as pergunta_titulo,
            pg.tipo as pergunta_tipo
        FROM resposta r
        LEFT JOIN pergunta pg ON r.pergunta_id = pg.id
        WHERE r.resposta_formulario_id = ${resposta_formulario_id}
        ORDER BY pg.ordem ASC
    `;
}

// ================== RANKING GLOBAL ==================

function get_ranking_global() {
    return `
        SELECT 
            nome,
            email,
            pontuacao_total,
            total_formularios,
            ROW_NUMBER() OVER (ORDER BY pontuacao_total DESC, data_cadastro ASC) as posicao
        FROM participante 
        WHERE pontuacao_total > 0
        ORDER BY pontuacao_total DESC, data_cadastro ASC
    `;
}

function get_top_participantes(limite = 10) {
    return `
        SELECT 
            nome,
            email,
            pontuacao_total,
            total_formularios
        FROM participante 
        WHERE pontuacao_total > 0
        ORDER BY pontuacao_total DESC, data_cadastro ASC
        LIMIT ${limite}
    `;
}

function get_estatisticas_gerais() {
    return `
        SELECT 
            (SELECT COUNT(*) FROM formulario WHERE ativo = true) as formularios_ativos,
            (SELECT COUNT(*) FROM formulario) as total_formularios,
            (SELECT COUNT(*) FROM participante WHERE pontuacao_total > 0) as total_participantes,
            (SELECT COUNT(*) FROM resposta_formulario) as total_respostas,
            (SELECT COALESCE(AVG(pontos_ganhos), 0) FROM resposta_formulario) as media_pontos
    `;
}

// ================== CONSULTAS AUXILIARES ==================

function get_formulario_publico(formulario_id) {
    return `
        SELECT 
            id,
            titulo,
            descricao,
            data_limite
        FROM formulario 
        WHERE id = ${formulario_id} 
        AND ativo = true 
        AND data_limite > CURRENT_TIMESTAMP
    `;
}

function count_respostas_formulario(formulario_id) {
    return `
        SELECT COUNT(*) as total 
        FROM resposta_formulario 
        WHERE formulario_id = ${formulario_id}
    `;
}

function verificar_formulario_ativo(formulario_id) {
    return `
        SELECT ativo, data_limite 
        FROM formulario 
        WHERE id = ${formulario_id}
    `;
}

module.exports = {
    login_usuario,
    get_usuario_by_id,    
    listar_formularios,
    get_formulario_by_id,
    criar_formulario,
    editar_formulario,
    ativar_formulario,
    desativar_formulario,
    delete_formulario,
    get_formularios_ativos,
    get_formulario_publico,    
    listar_perguntas_formulario,
    criar_pergunta,
    editar_pergunta,
    delete_pergunta,
    reordenar_perguntas,    
    buscar_participante_por_email,
    criar_participante,
    atualizar_participante,
    verificar_ja_respondeu,
    atualizar_pontuacao_participante,    
    criar_resposta_formulario,
    criar_resposta_individual,
    get_data_ativacao_formulario,
    get_respostas_formulario,
    get_detalhes_resposta,
    get_ranking_global,
    get_top_participantes,
    get_estatisticas_gerais,    
    count_respostas_formulario,
    verificar_formulario_ativo
};