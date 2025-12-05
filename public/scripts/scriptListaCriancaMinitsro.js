window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codTurma = params.get("turma");

  if (!codTurma) {
    alert("Nenhuma turma selecionada!");
    window.location.href = "turmasMinistro.handlebars";
    return;
  }

  fetchAlunos(codTurma);

  const filtroSelect = document.getElementById("filtroSelect");
  const barra = document.getElementById("barra");

  if (filtroSelect) filtroSelect.addEventListener("change", () => fetchAlunos(codTurma));
  if (barra) barra.addEventListener("input", () => fetchAlunos(codTurma));
});

async function fetchAlunos(codTurma) {
  try {
    const filtroEl = document.getElementById("filtroSelect");
    const barraEl = document.getElementById("barra");

    const filtro = filtroEl ? filtroEl.value : "todos";

    // 🔹 Usa a rota corrigida do turma.js
    const res = await fetch(`/api/turma/${codTurma}/alunos?status=${filtro}`);
    if (!res.ok) throw new Error("Erro ao buscar alunos");

    let alunos = await res.json();

    // aplicar busca na barra
    if (barraEl && barraEl.value.trim() !== "") {
      const busca = barraEl.value.toLowerCase();
      alunos = alunos.filter(
        a =>
          (a.nome && a.nome.toLowerCase().includes(busca)) ||
          (a.cod && a.cod.toString().includes(busca))
      );
    }

    renderizarLista(alunos, codTurma);
  } catch (error) {
    console.error("Erro no fetchAlunos:", error);
    alert("Erro ao carregar alunos.");
  }
}

function renderizarLista(alunos, codTurma) {
  const lista = document.getElementById("lista-criancas");
  if (!lista) {
    console.warn("Elemento #lista-criancas não encontrado.");
    return;
  }

  lista.innerHTML = "";

  if (!alunos || alunos.length === 0) {
    lista.innerHTML = `<li class="list-group-item text-center">Nenhum aluno encontrado</li>`;
    return;
  }

  alunos.forEach(aluno => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center botoes-crianca";

    const nomeStyle = aluno.status === "pre" ? "style='color:red; font-weight:bold;'" : "";

    // Botões de ação
    let botoes = `
      <button class="btn btn-sm btn-outline-info" onclick="verAluno('${aluno.cod}', '${codTurma}')">
        <i class="bi bi-eye"></i> Ver 
      </button>
     
    `;

    // Botão ativar/inativar dependendo do campo ativo
  

    li.innerHTML = `
      <div><strong>${aluno.cod || ""}</strong> - <span ${nomeStyle}>${aluno.nome || ""}</span></div>
      <div class="d-flex gap-2">
        ${botoes}
      </div>
    `;
    lista.appendChild(li);
  });
}

function verAluno(id, turma) {
  if (!id || !turma) return;
  window.location.href = `detalhesAlunoMinistro.handlebars?id=${id}&turma=${turma}`;
}

function editarAluno(id, turma) {
  if (!id || !turma) return;
  window.location.href = `editarAluno.handlebars?id=${id}&turma=${turma}`;
}

async function inativarAluno(id, turma) {
  if (!id || !turma) return;
  try {
    const res = await fetch(`/api/aluno/inativar/${id}`, { method: "PUT" });
    if (!res.ok) throw new Error("Falha na requisição");
    const data = await res.json();
    alert(data.message || "Aluno inativado.");
    await fetchAlunos(turma);
  } catch (error) {
    console.error("Erro ao inativar:", error);
    alert("Erro ao inativar aluno.");
  }
}

async function ativarAluno(id, turma) {
  if (!id || !turma) return;
  try {
    const res = await fetch(`/api/aluno/ativar/${id}`, { method: "PUT" });
    if (!res.ok) throw new Error("Falha na requisição");
    const data = await res.json();
    alert(data.message || "Aluno ativado.");
    await fetchAlunos(turma);
  } catch (error) {
    console.error("Erro ao ativar:", error);
    alert("Erro ao ativar aluno.");
  }
}
