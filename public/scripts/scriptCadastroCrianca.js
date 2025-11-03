document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // impede reload
      await enviarDadosAluno();
    });
  }
});

async function enviarDadosAluno() {
  const dados = {
    nome: document.getElementById('nomeAluno').value,
    login: document.querySelector('#userAluno').value,
    senha: document.querySelector('#senha').value,
    dataNasc: document.getElementById('dataNascAluno').value,
    rg: document.getElementById('rgAluno').value,
    cpf: document.getElementById('cpfAluno').value,
    fone: document.querySelector('#foneAluno').value,
    email: document.querySelector('#emailAluno').value,

    nacionalidade: document.querySelector('#nacionalidade').value,
    linguaNativa: document.querySelector('#linguaNativa').value,
    linguaEstrangeira: document.querySelector('#linguaEstrangeira').value,
    escolaAtual: document.querySelector('#escolaAtual').value,
    aspectoPsi: document.querySelector('#laudo').value,
    medicamentos: document.querySelector('#medicamento').value,
    alergias: document.querySelector('#alergia').value,
    restricaoA: document.querySelector('#restricaoA').value,
    projetoIgreja: document.querySelector('#projetoAluno').value,
    obs: document.querySelector('#obsAluno').value,

    nomeResponsavel: document.querySelector('#nomeResponsavel1').value,
    grauParentesco: document.querySelector('#parentescoResponsavel1').value,
    cpfResponsavel: document.querySelector('#cpfResponsavel1').value,
    foneResponsavel: document.querySelector('#foneResponsavel1').value,

    nomeResponsavel2: document.querySelector('#nomeResponsavel2').value,
    grauParentesco2: document.querySelector('#parentescoResponsavel2').value,
    cpfResponsavel2: document.querySelector('#cpfResponsavel2').value,
    foneResponsavel2: document.querySelector('#foneResponsavel2').value,

    autImagem: document.querySelector('#autorizacaoS').checked,
    genero: document.querySelector('#feminino').checked ? 2 : 1,

    Endereco: {
      rua: document.querySelector('#ruaAluno').value,
      numero: document.querySelector('#nResidenciaAluno').value,
      bairro: document.querySelector('#bairroAluno').value,
      cidade: document.querySelector('#cidadeAluno').value,
      uf: document.querySelector('#ufAluno').value,
      cep: document.querySelector('#cepAluno').value,
      obs: document.querySelector('#obsEnderecoAluno').value
    }
  };

  try {
    const res = await fetch(`${window.location.origin}/api/aluno/finalizar-cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await res.json();

    if (res.ok) {
      alert('Cadastro realizado com sucesso!');
      document.getElementById("btnProximo").disabled = false;
    } else {
      // 🔹 Tratamento de login/senha duplicados
      if (resultado.message?.toLowerCase().includes("login")) {
        alert("Este login já está cadastrado para outro aluno. Escolha um diferente.");
      } else if (resultado.message?.toLowerCase().includes("senha")) {
        alert("Esta senha já está em uso por outro aluno. Escolha uma diferente.");
      } else {
        alert('Erro: ' + (resultado.message || 'Não foi possível cadastrar.'));
      }
    }
  } catch (err) {
    alert('Erro de conexão com o servidor.');
  }
}

window.onload = function() {
  const btn = document.getElementById("btnProximo");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "/login.html";
    });
  }
};
