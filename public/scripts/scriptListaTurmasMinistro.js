document.addEventListener('DOMContentLoaded', async () => {
  const lista = document.getElementById('lista-turmas');
  const res = await fetch('/api/turma');
  const turmas = await res.json();

  turmas.forEach(turma => {
    const li = document.createElement('li');
    let diasStr = '';
    if (Array.isArray(turma.dias) && turma.dias.length > 0) {
      diasStr = turma.dias.map(d => d.dia).join(', ');
    } else {
      diasStr = 'Dias não definidos';
    }
    li.innerHTML = `
    <div class="turmasDiv d-flex flex-column justify-content-center align-items-center mt-md-2 mt-lg-0 mx-2 mb-3 col-4" onclick="verTurma(${turma.cod})"> 
      <p class="diaP mt-2">${turma.nome}</p>
      <p class="turmaP mt-2">${turma.idadeMin} a ${turma.idadeMax} anos</p>
      <p class="turmaP mb-2">${diasStr}</p>
    </div>`;
    lista.appendChild(li);
  });
});

function verTurma(cod) {
  window.location.href = 'listaCriancaMinistro.handlebars?turma=' + cod;
}

