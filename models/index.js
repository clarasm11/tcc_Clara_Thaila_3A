const { Sequelize, DataTypes } = require('sequelize');

//  Conexão com o banco de dados MySQL
const sequelize = new Sequelize('gracaKids', 'root', 'Claraeu@11', {
  host: 'localhost',
  dialect: 'mysql',
});

// Teste da conexão
sequelize.authenticate()
  .then(() => console.log(' Conectado ao MySQL!'))
  .catch(err => console.error(' Erro na conexão:', err));

// =====================
//  Importa os modelos
// =====================
const Ministro = require('./Ministro')(sequelize, DataTypes);
const Endereco = require('./Endereco')(sequelize, DataTypes);
const Genero = require('./Genero')(sequelize, DataTypes);
const Aluno = require('./Aluno')(sequelize, DataTypes);
const Turma = require('./Turma')(sequelize, DataTypes);
const DiaTurma = require('./DiaTurma')(sequelize, DataTypes);
const Possui = require('./Possui')(sequelize, DataTypes);
const Gerencia = require('./Gerencia')(sequelize, DataTypes);
const TurmaDia = require('./TurmaDia')(sequelize, DataTypes); 

const db = {
  sequelize,
  Sequelize,
  Ministro,
  Endereco,
  Genero,
  Aluno,
  Turma,
  DiaTurma,
  Possui,
  Gerencia,
  TurmaDia
};

// =====================
// 🔹 Definição dos relacionamentos
// =====================
// Um aluno pode estar em várias turmas (via tabela Possui)
Aluno.hasMany(Possui, { foreignKey: 'aluno', as: 'Turmas' });
Possui.belongsTo(Aluno, { foreignKey: 'aluno', as: 'Aluno' });

// Uma turma pode ter vários alunos (via tabela Possui)
Turma.hasMany(Possui, { foreignKey: 'turma', as: 'Alunos' });
Possui.belongsTo(Turma, { foreignKey: 'turma', as: 'Turma' });

// =====================
// 🔹 Executa associate() se existir
// =====================
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// =====================
// 🔹 Função de distribuição automática
// =====================
db.distribuirAlunosNasTurmas = async function () {
  try {
    const anoAtual = new Date().getFullYear();
    const turmas = await Turma.findAll();
    const alunos = await Aluno.findAll();

    for (const aluno of alunos) {
      if (!aluno.dataNasc) continue;

      const nascimento = new Date(aluno.dataNasc);
      const idade = anoAtual - nascimento.getFullYear();

      let turmaIdeal = turmas.find(t =>
        idade >= t.idadeMin && idade <= t.idadeMax
      );

      if (!turmaIdeal) {
        turmaIdeal = turmas.reduce((prev, curr) =>
          Math.abs(curr.idadeMin - idade) < Math.abs(prev.idadeMin - idade) ? curr : prev
        );
      }

      const possui = await Possui.findOne({ where: { aluno: aluno.cod } });
      if (!possui || possui.turma !== turmaIdeal.cod) {
        if (possui) {
          await possui.update({ turma: turmaIdeal.cod });
        } else {
          await Possui.create({ aluno: aluno.cod, turma: turmaIdeal.cod });
        }
      }
    }

    console.log('Distribuição de alunos nas turmas concluída!');
    return { message: 'Distribuição de alunos nas turmas concluída!' };
  } catch (error) {
    console.error('Erro na distribuição de alunos:', error);
    return { message: 'Erro na distribuição de alunos', error };
  }
};

// =====================
// 🔹 Exporta tudo
// =====================
module.exports = db;
