document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const mapaDia = { segunda: 8, terca: 9, quarta: 3, quinta: 4, sexta: 5, sabado: 6, domingo: 7 };

  const diasSelecionados = dias
    .filter(d => document.querySelector(`#${d}`).checked)
    .map(d => mapaDia[d]);

  const nome = document.querySelector('#nome').value;
  const idadeMin = document.querySelector('#idadeMin').value;
  const idadeMax = document.querySelector('#idadeMax').value;

  if (!nome || !idadeMin || !idadeMax || diasSelecionados.length === 0) {
    alert('Preencha todos os campos e selecione pelo menos um dia!');
    return;
  }

  const formData = {
    nome,
    idadeMin: Number(idadeMin),
    idadeMax: Number(idadeMax),
    dias: diasSelecionados
  };

  try {
    const res = await fetch(`${window.location.origin}/api/turma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await res.json();
    alert(result.message);
  } catch (err) {
    alert('Erro ao criar turma');
  }
});
