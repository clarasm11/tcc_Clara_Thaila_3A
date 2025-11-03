// Função principal para carregar os detalhes do ministro
async function carregarDetalhesMinistro() {
  const urlParams = new URLSearchParams(window.location.search);
  const cod = urlParams.get("cod");

  console.log(" Código recebido:", cod);

  if (!cod) {
    alert("ID do ministro não informado!");
    return;
  }

  try {
    const res = await fetch(`${window.location.origin}/api/ministro/detalhes/${cod}`);
    console.log(" Resposta da API:", res);

    if (!res.ok) {
      const erro = await res.text();
      console.error(" Erro retornado pela API:", erro);
      throw new Error("Falha ao carregar os detalhes do ministro.");
    }

    const ministro = await res.json();
    console.log(" Dados do ministro recebidos:", ministro);

    // PREENCHIMENTO DOS CAMPOS
  
    // Dados básicos
    document.getElementById("nomeMinistro").value = ministro.nome || "";
    document.getElementById("dataNascMinistro").value = ministro.dataNasc || "";
    document.getElementById("rgMinistro").value = ministro.rg || "";
    document.getElementById("cpfMinistro").value = ministro.cpf || "";
    document.getElementById("foneMinistro").value = ministro.fone || "";
    document.getElementById("emailMinistro").value = ministro.email || "";

    // Endereço
    if (ministro.Endereco) {
      document.getElementById("ruaMinistro").value = ministro.Endereco.rua || "";
      document.getElementById("nResidenciaMinistro").value = ministro.Endereco.numero || "";
      document.getElementById("bairroMinistro").value = ministro.Endereco.bairro || "";
      document.getElementById("cidadeMinistro").value = ministro.Endereco.cidade || "";
      document.getElementById("ufMinistro").value = ministro.Endereco.uf || "";
      document.getElementById("cepMinistro").value = ministro.Endereco.cep || "";
      document.getElementById("obsEnderecoMinistro").value = ministro.Endereco.obs || "";
    }

    // Dados adicionais
    document.getElementById("habilidadeMinistro").value = ministro.habilidades || "";
    document.getElementById("dificuldadeMinistro").value = ministro.restricoes || "";
    document.getElementById("formacaoMinistro").value = ministro.escolaridade || "";
    document.getElementById("profissaoMinistro").value = ministro.profissao || "";
    document.getElementById("projetoMinistro").value = ministro.projetoIgreja || "";
    document.getElementById("obsMinistro").value = ministro.obs || "";
    document.getElementById("dataEntMinistro").value = ministro.dataIng || "";

    // Gênero
    if (ministro.fK_genero == 1) document.getElementById("masculino").checked = true;
    if (ministro.fK_genero == 2) document.getElementById("feminino").checked = true;

    // Pastor
    if (ministro.pastor) document.getElementById("simPastor").checked = true;
    else document.getElementById("nPastor").checked = true;

  } catch (err) {
    console.error(" Erro no carregamento:", err);
    alert("Ocorreu um erro ao carregar os detalhes do ministro. Verifique o console para mais informações.");
  }
}


document.addEventListener("DOMContentLoaded", carregarDetalhesMinistro);
