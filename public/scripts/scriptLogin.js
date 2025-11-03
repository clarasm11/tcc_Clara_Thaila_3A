// Escuta o envio do formulário de login
document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Captura os dados digitados
  const login = document.getElementById("user").value;
  const senha = document.getElementById("senha").value;

  try {
    // Envia requisição de login para o servidor
    const resposta = await fetch(`${window.location.origin}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha })
    });

    const resultado = await resposta.json();

    // Verificações de acesso e permissões
    if (!resposta.ok) {
      alert(resultado.mensagem || "Erro ao fazer login.");
      return;
    }

    if (!resultado.ativo) {
      alert("Seu acesso está desativado. Fale com o administrador.");
      return;
    }

    if (!resultado.validado) {
      alert("Seu cadastro ainda não foi validado. Aguarde a aprovação.");
      return;
    }

    // Redireciona para o painel inicial
    window.location.href = "index.handlebars";
  } catch (error) {
    alert("Erro na comunicação com o servidor.");
    console.error(error);
  }
});
