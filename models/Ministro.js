const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ministro = sequelize.define('Ministro', {
    cod: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    dataNasc: { type: DataTypes.DATEONLY, allowNull: false },
    dataIng: { type: DataTypes.DATEONLY, allowNull: false },
    rg: { type: DataTypes.STRING, allowNull: false, unique: true },
    cpf: { type: DataTypes.STRING, allowNull: false, unique: true },
    fone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    habilidades: { type: DataTypes.STRING },
    restricoes: { type: DataTypes.STRING },
    escolaridade: { type: DataTypes.STRING },
    profissao: { type: DataTypes.STRING },
    projetoIgreja: { type: DataTypes.STRING },
    pastor: { type: DataTypes.BOOLEAN, defaultValue: false },
    obs: { type: DataTypes.STRING },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    validado: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Ajuste: agora bate com suas rotas (Endereco, Genero)
    fK_endereco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Endereco', key: 'cod' }
    },
    fK_genero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Genero', key: 'cod' }
    }
  }, {
    tableName: 'Ministro',
    timestamps: false
  });

  Ministro.associate = (models) => {
    Ministro.belongsTo(models.Endereco, {
      foreignKey: 'fK_endereco',
      as: 'Endereco' // 🔹 igual ao que você usa na rota
    });
    Ministro.belongsTo(models.Genero, {
      foreignKey: 'fK_genero',
      as: 'Genero'  // 🔹 igual ao que você usa na rota
    });
  };

  return Ministro;
};
