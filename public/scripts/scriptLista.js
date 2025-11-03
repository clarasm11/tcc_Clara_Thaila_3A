let ministrosGlobal = [];

// Carrega todos os ministros da API
async function carregarMinistros() {
  try {
    const res = await fetch(`${window.location.origin}/api/ministro/listar/todos`);
    let data = await res.json();

    // 🔹 Garante que sempre será array
    ministrosGlobal = Array.isArray(data) ? data : [];
    aplicarFiltros();
  } catch (error) {
    console.error("Erro ao carregar ministros:", error);
    ministrosGlobal = [];
    aplicarFiltros();
  }
}

// Aplica os filtros de busca, status e validação
function aplicarFiltros() {
  const container = document.getElementById("listaMinistrosContainer");
  container.innerHTML = "";

  const termo = document.getElementById("barra")?.value?.toLowerCase() || "";
  const filtro = document.getElementById("filtroSelect")?.value || "validados";
  const editados = JSON.parse(localStorage.getItem("ministrosEditados")) || [];

  const filtrados = ministrosGlobal
    .filter(m => {
      const ativo = m.ativo !== false;
      const validado = m.validado === true;
      if (filtro === "validados") return ativo && validado;
      if (filtro === "naoValidados") return !validado && ativo;
      if (filtro === "inativos") return !ativo;
      return true;
    })
    .filter(m => (m.nome || "").toLowerCase().includes(termo));

  if (filtrados.length === 0) {
    container.innerHTML = `<p class="text-muted text-center mt-3">Nenhum ministro encontrado.</p>`;
    return;
  }

  // Exibe os ministros filtrados
  filtrados.forEach(ministro => {
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center p-2 border-bottom bg-light rounded";

    const corNome = ministro.validado ? "black" : "red";

    div.innerHTML = `
      <div>
        <strong>${ministro.cod}</strong> -
        <span style="color: ${corNome}; font-weight: bold;">
          ${ministro.nome ?? "(sem nome)"}
        </span>
      </div>
      <div>
        <a href="detalhesMinistro.handlebars?cod=${ministro.cod}" class="btn btn-outline-primary btn-sm me-2">Ver</a>
        <a href="editarMinistro.handlebars?cod=${ministro.cod}" class="btn btn-outline-warning btn-sm me-2">Editar</a>
        <button class="btn btn-${ministro.ativo ? "outline-danger" : "outline-success"} btn-sm"
          onclick="${ministro.ativo ? `inativarMinistro(${ministro.cod})` : `ativarMinistro(${ministro.cod})`}">
          ${ministro.ativo ? "Inativar" : "Ativar"}
        </button>
      </div>
    `;
    
    container.appendChild(div);
  });
}

// Marca um ministro como editado localmente (localStorage)
function marcarComoEditado(cod) {
  const editados = JSON.parse(localStorage.getItem("ministrosEditados")) || [];
  if (!editados.includes(cod)) {
    editados.push(cod);
    localStorage.setItem("ministrosEditados", JSON.stringify(editados));
  }
  aplicarFiltros();
}

// Inativa um ministro
async function inativarMinistro(cod) {
  if (!confirm("Tem certeza que deseja inativar este ministro?")) return;

  try {
    const res = await fetch(`${window.location.origin}/api/ministro/inativar/${cod}`, { method: "PUT" });
    const data = await res.json();
    alert(data.message || "Ministro inativado.");
    carregarMinistros(); // 🔹 atualiza lista sem reload
  } catch (error) {
    console.error("Erro ao inativar ministro:", error);
    alert("Erro ao inativar ministro.");
  }
}

// Ativa novamente um ministro
async function ativarMinistro(cod) {
  if (!confirm("Deseja reativar este ministro?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/ministro/ativar/${cod}`, { method: "PUT" });
    const data = await res.json();
    alert(data.message || "Ministro ativado.");
    carregarMinistros(); // 🔹 atualiza lista sem reload
  } catch (error) {
    console.error("Erro ao ativar ministro:", error);
    alert("Erro ao ativar ministro.");
  }
}

// Carrega lista ao abrir a página e ativa filtros
window.onload = () => {
  carregarMinistros();
  document.getElementById("barra")?.addEventListener("input", aplicarFiltros);
  document.getElementById("filtroSelect")?.addEventListener("change", aplicarFiltros);
};
