// ==========================================
// ROTAS PEDAGÓGICO - ÁREA ADMINISTRATIVA
// ==========================================

const express = require("express");
const rota = express.Router();
const security = require("../security/cypher");
const execute = require("../services/execute_pedagogico");

// tirar isso aqui
rota.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

function jsonMount(boll, data, msg) {
  return {
    payload: security.jwtencript({ boleano: boll, obj: data, mensagem: msg }),
  };
}

function errorHandle(error, route) {
  console.log(`Erro na rota ${route}`);
  console.log(error);
  return jsonMount(false, {}, "Tente novamente mais tarde!");
}


// function validarAutenticacao(payload) {
//   // Remover debug após teste
//   console.log("=== DEBUG PAYLOAD ===");
//   console.log("Payload completo:", JSON.stringify(payload, null, 2));
//   console.log("Token encontrado:", payload.payload ? "SIM" : "NÃO");
//   console.log("==================");

//   let token = payload.payload;

//   if (!token) {
//     return { valido: false, mensagem: "Token não encontrado!" };
//   }

//   const data = security.jwtdecript({ payload: token });

//   if (!data) {
//     return { valido: false, mensagem: "Token inválido!" };
//   }

//   // CORREÇÃO: O usuario_id está dentro de data.obj
//   let usuario_id;
//   if (data.obj && data.obj.usuario_id) {
//     usuario_id = data.obj.usuario_id;
//   } else if (data.usuario_id) {
//     usuario_id = data.usuario_id;
//   }

//   if (!usuario_id) {
//     console.log("DEBUG - Estrutura do token:", JSON.stringify(data, null, 2));
//     return { valido: false, mensagem: "Token não contém usuario_id válido!" };
//   }

//   // Retornar dados no formato esperado pelas rotas
//   return {
//     valido: true,
//     data: {
//       usuario_id: usuario_id,
//       nome: data.obj ? data.obj.nome : data.nome,
//       email: data.obj ? data.obj.email : data.email,
//     },
//   };
// }

function validarAutenticacao(payload) {
  console.log("=== DEBUG COMPLETO ===");
  console.log("Payload recebido:", JSON.stringify(payload, null, 2));
  console.log("======================");

  let token = payload.payload;

  if (!token) {
    return { valido: false, mensagem: "Token não encontrado!" };
  }

  const tokenData = security.jwtdecript({ payload: token });

  if (!tokenData) {
    return { valido: false, mensagem: "Token inválido!" };
  }

  // Extrair usuario_id do token
  let usuario_id;
  if (tokenData.obj && tokenData.obj.usuario_id) {
    usuario_id = tokenData.obj.usuario_id;
  } else if (tokenData.usuario_id) {
    usuario_id = tokenData.usuario_id;
  }

  if (!usuario_id) {
    return { valido: false, mensagem: "Usuario ID não encontrado no token!" };
  }

  // Combinar dados do token com dados enviados no payload
  const dadosCombinados = {
    usuario_id: usuario_id,
    nome: tokenData.obj ? tokenData.obj.nome : tokenData.nome,
    email: tokenData.obj ? tokenData.obj.email : tokenData.email,
    // Incluir outros dados enviados (titulo, descricao, data_limite, etc.)
    ...Object.fromEntries(
      Object.entries(payload).filter(([key]) => key !== "payload")
    ),
  };

  console.log("=== DADOS FINAIS ===");
  console.log("Dados processados:", JSON.stringify(dadosCombinados, null, 2));
  console.log("===================");

  return {
    valido: true,
    data: dadosCombinados,
  };
}

// ================== AUTENTICAÇÃO ==================

rota.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.json(jsonMount(false, {}, "Email e senha são obrigatórios!"));
    }

    const senhaHash = security.cripto(senha);
    const usuario = await execute.execute_login_usuario(email, senhaHash);

    if (usuario.length <= 0) {
      return res.json(jsonMount(false, {}, "Email/senha incorretos!"));
    }

    // CRIAR TOKEN APENAS COM DADOS DO USUÁRIO (mais limpo)
    const tokenData = {
      usuario_id: usuario[0].id,
      nome: usuario[0].nome,
      email: usuario[0].email,
    };

    return res.json(jsonMount(true, tokenData, "Login realizado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/login"));
  }
});

// ================== FORMULÁRIOS ==================

rota.post("/listar_formularios", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    const formularios = await execute.execute_listar_formularios();
    return res.json(
      jsonMount(true, formularios, "Formulários carregados com sucesso!")
    );
  } catch (error) {
    return res.json(errorHandle(error, "/listar_formularios"));
  }
});

rota.post("/buscar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.formulario_id) {
      return res.json(jsonMount(false, {}, "ID do formulário é obrigatório!"));
    }

    const formulario = await execute.execute_get_formulario_by_id(
      auth.data.formulario_id
    );
    const perguntas = await execute.execute_listar_perguntas_formulario(
      auth.data.formulario_id
    );

    if (formulario.length === 0) {
      return res.json(jsonMount(false, {}, "Formulário não encontrado!"));
    }

    return res.json(
      jsonMount(
        true,
        {
          formulario: formulario[0],
          perguntas: perguntas,
        },
        "Formulário carregado com sucesso!"
      )
    );
  } catch (error) {
    return res.json(errorHandle(error, "/buscar_formulario"));
  }
});

rota.post("/criar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.titulo || !auth.data.data_limite) {
      return res.json(
        jsonMount(false, {}, "Título e data limite são obrigatórios!")
      );
    }

    const resultado = await execute.execute_criar_formulario(
      auth.data.titulo,
      auth.data.descricao || "",
      auth.data.data_limite,
      auth.data.usuario_id
    );

    return res.json(
      jsonMount(
        true,
        { formulario_id: resultado[0].id },
        "Formulário criado com sucesso!"
      )
    );
  } catch (error) {
    return res.json(errorHandle(error, "/criar_formulario"));
  }
});

rota.post("/editar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (
      !auth.data.formulario_id ||
      !auth.data.titulo ||
      !auth.data.data_limite
    ) {
      return res.json(
        jsonMount(false, {}, "ID, título e data limite são obrigatórios!")
      );
    }

    await execute.execute_editar_formulario(
      auth.data.formulario_id,
      auth.data.titulo,
      auth.data.descricao || "",
      auth.data.data_limite
    );

    return res.json(jsonMount(true, {}, "Formulário editado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/editar_formulario"));
  }
});

rota.post("/ativar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.formulario_id) {
      return res.json(jsonMount(false, {}, "ID do formulário é obrigatório!"));
    }

    await execute.execute_ativar_formulario(auth.data.formulario_id);
    return res.json(jsonMount(true, {}, "Formulário ativado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/ativar_formulario"));
  }
});

rota.post("/desativar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.formulario_id) {
      return res.json(jsonMount(false, {}, "ID do formulário é obrigatório!"));
    }

    await execute.execute_desativar_formulario(auth.data.formulario_id);
    return res.json(jsonMount(true, {}, "Formulário desativado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/desativar_formulario"));
  }
});

rota.post("/deletar_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.formulario_id) {
      return res.json(jsonMount(false, {}, "ID do formulário é obrigatório!"));
    }

    await execute.execute_delete_formulario(auth.data.formulario_id);
    return res.json(jsonMount(true, {}, "Formulário deletado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/deletar_formulario"));
  }
});

// ================== PERGUNTAS ==================

rota.post("/criar_pergunta", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (
      !auth.data.formulario_id ||
      !auth.data.titulo ||
      !auth.data.tipo ||
      !auth.data.ordem
    ) {
      return res.json(
        jsonMount(
          false,
          {},
          "Formulário, título, tipo e ordem são obrigatórios!"
        )
      );
    }

    const resultado = await execute.execute_criar_pergunta(
      auth.data.formulario_id,
      auth.data.titulo,
      auth.data.tipo,
      auth.data.opcoes || null,
      auth.data.ordem,
      auth.data.obrigatoria !== false
    );

    return res.json(
      jsonMount(
        true,
        { pergunta_id: resultado[0].id },
        "Pergunta criada com sucesso!"
      )
    );
  } catch (error) {
    return res.json(errorHandle(error, "/criar_pergunta"));
  }
});

rota.post("/editar_pergunta", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.pergunta_id || !auth.data.titulo || !auth.data.tipo) {
      return res.json(
        jsonMount(false, {}, "ID, título e tipo são obrigatórios!")
      );
    }

    await execute.execute_editar_pergunta(
      auth.data.pergunta_id,
      auth.data.titulo,
      auth.data.tipo,
      auth.data.opcoes || null,
      auth.data.obrigatoria !== false
    );

    return res.json(jsonMount(true, {}, "Pergunta editada com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/editar_pergunta"));
  }
});

rota.post("/deletar_pergunta", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.pergunta_id) {
      return res.json(jsonMount(false, {}, "ID da pergunta é obrigatório!"));
    }

    await execute.execute_delete_pergunta(auth.data.pergunta_id);
    return res.json(jsonMount(true, {}, "Pergunta deletada com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/deletar_pergunta"));
  }
});

rota.post("/reordenar_pergunta", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (
      !auth.data.formulario_id ||
      !auth.data.pergunta_id ||
      !auth.data.nova_ordem
    ) {
      return res.json(
        jsonMount(
          false,
          {},
          "Formulário, pergunta e nova ordem são obrigatórios!"
        )
      );
    }

    await execute.execute_reordenar_perguntas(
      auth.data.formulario_id,
      auth.data.pergunta_id,
      auth.data.nova_ordem
    );
    return res.json(jsonMount(true, {}, "Pergunta reordenada com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/reordenar_pergunta"));
  }
});

// ================== RESPOSTAS E RELATÓRIOS ==================

rota.post("/respostas_formulario", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.formulario_id) {
      return res.json(jsonMount(false, {}, "ID do formulário é obrigatório!"));
    }

    const respostas = await execute.execute_get_respostas_formulario(
      auth.data.formulario_id
    );
    return res.json(
      jsonMount(true, respostas, "Respostas carregadas com sucesso!")
    );
  } catch (error) {
    return res.json(errorHandle(error, "/respostas_formulario"));
  }
});

rota.post("/detalhes_resposta", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    if (!auth.data.resposta_formulario_id) {
      return res.json(jsonMount(false, {}, "ID da resposta é obrigatório!"));
    }

    const detalhes = await execute.execute_get_detalhes_resposta(
      auth.data.resposta_formulario_id
    );
    return res.json(
      jsonMount(true, detalhes, "Detalhes carregados com sucesso!")
    );
  } catch (error) {
    return res.json(errorHandle(error, "/detalhes_resposta"));
  }
});

// ================== RANKING E ESTATÍSTICAS ==================

rota.post("/ranking_global", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    const ranking = await execute.execute_get_ranking_global();
    return res.json(jsonMount(true, ranking, "Ranking carregado com sucesso!"));
  } catch (error) {
    return res.json(errorHandle(error, "/ranking_global"));
  }
});

rota.post("/top_participantes", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    const limite = auth.data.limite || 10;
    const top = await execute.execute_get_top_participantes(limite);
    return res.json(
      jsonMount(true, top, "Top participantes carregado com sucesso!")
    );
  } catch (error) {
    return res.json(errorHandle(error, "/top_participantes"));
  }
});

rota.post("/estatisticas", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    const estatisticas = await execute.execute_get_estatisticas_gerais();
    return res.json(
      jsonMount(
        true,
        estatisticas[0] || {},
        "Estatísticas carregadas com sucesso!"
      )
    );
  } catch (error) {
    return res.json(errorHandle(error, "/estatisticas"));
  }
});

// ================== DASHBOARD ==================

rota.post("/dashboard", async (req, res) => {
  try {
    const payload = req.body;
    const auth = validarAutenticacao(payload);

    if (!auth.valido) {
      return res.json(jsonMount(false, {}, auth.mensagem));
    }

    const formularios = await execute.execute_listar_formularios();
    const ranking = await execute.execute_get_top_participantes(5);
    const estatisticas = await execute.execute_get_estatisticas_gerais();

    return res.json(
      jsonMount(
        true,
        {
          formularios: formularios,
          top_ranking: ranking,
          estatisticas: estatisticas[0] || {},
        },
        "Dashboard carregado com sucesso!"
      )
    );
  } catch (error) {
    return res.json(errorHandle(error, "/dashboard"));
  }
});

module.exports = rota;
