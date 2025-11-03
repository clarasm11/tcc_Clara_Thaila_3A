CREATE DATABASE gracaKids;
USE gracaKids;

CREATE TABLE Endereco (
  cod INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
  rua VARCHAR(40) NOT NULL,
  numero INTEGER,
  bairro VARCHAR(30) NOT NULL,
  cidade VARCHAR(30) NOT NULL,
  uf CHAR(2) NOT NULL DEFAULT 'SC',
  cep VARCHAR (11) NOT NULL,
  obs VARCHAR(90),
  PRIMARY KEY (cod)
);

CREATE TABLE Genero (
  cod INTEGER NOT NULL UNIQUE,
  descricao VARCHAR(9) NOT NULL,
  PRIMARY KEY (cod)
);

CREATE TABLE Ministro (
  cod INTEGER AUTO_INCREMENT NOT NULL UNIQUE,
  nome VARCHAR (50) NOT NULL,
  login VARCHAR(15) NOT NULL UNIQUE,
  CHECK (CHAR_LENGTH(login) >= 5),
  senha VARCHAR(100) NOT NULL,
  CHECK (CHAR_LENGTH(senha) >= 5),
  dataNasc DATE NOT NULL,
  dataIng DATE NOT NULL,
  rg VARCHAR (14) NOT NULL UNIQUE,
  cpf CHAR (14) NOT NULL UNIQUE,
  fone varchar(15),
  email VARCHAR (70) UNIQUE,
  habilidades VARCHAR (100),
  restricoes VARCHAR (100),
  escolaridade VARCHAR (60),
  profissao VARCHAR (50),
  projetoIgreja VARCHAR (60),
  pastor BOOLEAN NOT NULL,
  obs VARCHAR (100),
  ativo BOOLEAN NOT NULL,
  validado BOOLEAN NOT NULL,
  fK_endereco INTEGER NOT NULL,
  fK_genero INTEGER NOT NULL,
  PRIMARY KEY (cod),
  FOREIGN KEY (fK_endereco) REFERENCES Endereco(cod),
  FOREIGN KEY (fK_genero) REFERENCES Genero(cod)
);

INSERT INTO Genero (cod, descricao) VALUES
(1, 'Masculino'),
(2, 'Feminino');

CREATE TABLE Aluno (
  cod INTEGER AUTO_INCREMENT NOT NULL UNIQUE,
  nome VARCHAR (50) NOT NULL,
  login VARCHAR (15) UNIQUE,
  CHECK (CHAR_LENGTH(login) >= 5),
  senha VARCHAR (100), -- aumentado pra suportar bcrypt
  dataNasc DATE NOT NULL,
  rg VARCHAR (14) NOT NULL UNIQUE,
  cpf CHAR (14) NOT NULL UNIQUE,
  fone VARCHAR(15),
  email VARCHAR (70) UNIQUE,
  nacionalidade VARCHAR (30),
  linguaNativa VARCHAR (15),
  linguaEstrangeira VARCHAR (30),
  escolaAtual VARCHAR (50),
  aspectoPsi VARCHAR (50),
  medicamentos VARCHAR (60),
  alergias VARCHAR (50),
  restricaoA VARCHAR (100),
  projetoIgreja VARCHAR (60),
  imagem VARCHAR (60),
  obs VARCHAR (100),
  nomeResponsavel VARCHAR (50),
  grauParentesco VARCHAR (50),
  cpfResponsavel CHAR (14) UNIQUE,
  foneResponsavel VARCHAR(15),
  nomeResponsavel2 VARCHAR (50),
  grauParentesco2 VARCHAR (50),
  cpfResponsavel2 CHAR (14) UNIQUE,
  foneResponsavel2 VARCHAR(15),
  autImagem BOOLEAN,
  status ENUM('pre', 'ativo') DEFAULT 'ativo',
  endereco INTEGER,
  genero INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (cod),
  FOREIGN KEY (endereco) REFERENCES Endereco (cod),
  FOREIGN KEY (genero) REFERENCES Genero (cod)
);

CREATE TABLE DiaTurma (
  cod INTEGER NOT NULL UNIQUE auto_increment,
  dia VARCHAR(10) NOT NULL,
  PRIMARY KEY (cod)
);

INSERT INTO DiaTurma (cod, dia) VALUES
(8, 'segunda'),
(9, 'terca'),
(3, 'quarta'),
(4, 'quinta'),
(5, 'sexta'),
(6, 'sabado'),
(7, 'domingo');

CREATE TABLE Turma (
  cod INTEGER NOT NULL UNIQUE auto_increment,
  nome VARCHAR (15) NOT NULL,
  idadeMin INTEGER NOT NULL,
  idadeMax INTEGER NOT NULL,
  diaTurma INTEGER,
  PRIMARY KEY (cod),
  FOREIGN KEY (diaTurma) REFERENCES DiaTurma (cod)
);

CREATE TABLE Possui (
  cod INTEGER NOT NULL UNIQUE auto_increment,
  aluno INTEGER,
  turma INTEGER,
  PRIMARY KEY (cod),
  FOREIGN KEY (aluno) REFERENCES Aluno(cod),
  FOREIGN KEY (turma) REFERENCES Turma(cod)
);

CREATE TABLE Gerencia (
  cod INTEGER NOT NULL UNIQUE auto_increment,
  ministro INTEGER,
  turma INTEGER,
  PRIMARY KEY (cod),
  FOREIGN KEY (ministro) REFERENCES Ministro(cod),
  FOREIGN KEY (turma) REFERENCES Turma(cod)
);
