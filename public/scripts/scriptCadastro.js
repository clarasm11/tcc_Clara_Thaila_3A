async function cadastrarMinistro(event) {
  event.preventDefault();
  await enviarDadosMinistro();
}

async function enviarDadosMinistro() {
  // Gênero: converte para número (1 = masculino, 2 = feminino)
  const genero = parseInt(
    document.querySelector('input[name="genero"]:checked')?.value || "1",
  );

  // Pastor: converte para número (1 = Sim, 0 = Não)
  // Os inputs no HTML têm name="pastor" e ids "simPastor" / "nPastor".
  const pastorCheckedId = document.querySelector('input[name="pastor"]:checked')?.id;
  const pastor = pastorCheckedId === 'simPastor' ? 1 : 0;


  const dados = {
    nome: document.getElementById("nomeMinistro").value,
    genero,
    dataNasc: document.getElementById("dataNascMinistro").value,
    rg: document.getElementById("rgMinistro").value,
    cpf: document.getElementById("cpfMinistro").value,
    fone: document.getElementById("foneMinistro").value,
    email: document.getElementById("emailMinistro").value,

    rua: document.getElementById("ruaMinistro").value,
    nResidencia: document.getElementById("nResidenciaMinistro").value,
    bairro: document.getElementById("bairroMinistro").value,
    cidade: document.getElementById("cidadeMinistro").value,
    uf: document.getElementById("ufMinistro").value,
    cep: document.getElementById("cepMinistro").value,
    obs: document.getElementById("obsEnderecoMinistro").value,

    habilidades: document.getElementById("habilidadeMinistro").value,
    restricoes: document.getElementById("dificuldadeMinistro").value,
    escolaridade: document.getElementById("formacaoMinistro").value,
    profissao: document.getElementById("profissaoMinistro").value,
    projetoIgreja: document.getElementById("projetoMinistro").value,
    obsAdicional: document.getElementById("obsMinistro").value,
    dataIng: document.getElementById("dataEntMinistro").value,

    login: document.getElementById("userMinistro").value,
    senha: document.getElementById("senha").value,
    pastor,
  };

  try {
    const res = await fetch(`${window.location.origin}/api/ministro/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await res.json();

    if (res.ok) {
      alert("Cadastro realizado com sucesso!");
      document.getElementById("btnProximo").disabled = false;
    } else {
      // 🔹 Tratamento de login/senha duplicados
      if (resultado.message?.toLowerCase().includes("login")) {
        alert("Este login já está cadastrado para outro ministro. Escolha um diferente.");
      } else if (resultado.message?.toLowerCase().includes("senha")) {
        alert("Esta senha já está em uso por outro ministro. Escolha uma diferente.");
      } else {
        alert("Erro: " + (resultado.message || "Erro desconhecido"));
      }
    }
  } catch (err) {
    console.error(err);
    alert("Erro na conexão com o servidor.");
  }
}
