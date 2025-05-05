import sql from 'mssql';

// Configurações de conexão com o SQL Server (destino - sistema Nasajon)
const CONFIG_DESTINO = {
  server: 'servidor-nasajon',
  database: 'db_nasajon',
  user: 'usuario_nasajon',
  password: 'senha_nasajon',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function criarTabelasNasajon() {
  try {
    console.log('Conectando ao banco de dados Nasajon...');
    const pool = await sql.connect(CONFIG_DESTINO);
    
    console.log('Criando tabelas no sistema Nasajon...');
    
    // Cria tabela de clientes
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nasajon_clientes')
      BEGIN
        CREATE TABLE nasajon_clientes (
          codigo_cliente VARCHAR(20) PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          documento VARCHAR(20),
          dt_nascimento DATE,
          email VARCHAR(100),
          fone VARCHAR(20),
          logradouro VARCHAR(200),
          cidade VARCHAR(100),
          uf CHAR(2),
          cep VARCHAR(10),
          data_importacao DATETIME NOT NULL,
          sistema_origem VARCHAR(50) NOT NULL
        );
        
        PRINT 'Tabela nasajon_clientes criada com sucesso';
      END
      ELSE
      BEGIN
        PRINT 'Tabela nasajon_clientes já existe';
      END
    `);
    
    // Cria tabela de produtos
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nasajon_produtos')
      BEGIN
        CREATE TABLE nasajon_produtos (
          codigo_produto VARCHAR(20) PRIMARY KEY,
          descricao VARCHAR(200) NOT NULL,
          valor_venda DECIMAL(15, 2),
          quantidade_estoque INT,
          unidade_medida VARCHAR(10),
          grupo VARCHAR(50),
          data_importacao DATETIME NOT NULL,
          sistema_origem VARCHAR(50) NOT NULL
        );
        
        PRINT 'Tabela nasajon_produtos criada com sucesso';
      END
      ELSE
      BEGIN
        PRINT 'Tabela nasajon_produtos já existe';
      END
    `);
    
    // Cria tabela de pedidos
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nasajon_pedidos')
      BEGIN
        CREATE TABLE nasajon_pedidos (
          codigo_pedido VARCHAR(20) PRIMARY KEY,
          codigo_cliente VARCHAR(20) NOT NULL,
          data_pedido DATE NOT NULL,
          valor_total DECIMAL(15, 2),
          status VARCHAR(20),
          observacao TEXT,
          data_importacao DATETIME NOT NULL,
          sistema_origem VARCHAR(50) NOT NULL,
          CONSTRAINT FK_nasajon_pedidos_cliente FOREIGN KEY (codigo_cliente)
            REFERENCES nasajon_clientes (codigo_cliente)
        );
        
        PRINT 'Tabela nasajon_pedidos criada com sucesso';
      END
      ELSE
      BEGIN
        PRINT 'Tabela nasajon_pedidos já existe';
      END
    `);
    
    // Cria tabela de itens de pedido
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nasajon_itens_pedido')
      BEGIN
        CREATE TABLE nasajon_itens_pedido (
          id INT IDENTITY(1,1) PRIMARY KEY,
          codigo_pedido VARCHAR(20) NOT NULL,
          codigo_produto VARCHAR(20) NOT NULL,
          quantidade DECIMAL(15, 3) NOT NULL,
          valor_unitario DECIMAL(15, 2) NOT NULL,
          valor_total DECIMAL(15, 2) NOT NULL,
          data_importacao DATETIME NOT NULL,
          sistema_origem VARCHAR(50) NOT NULL,
          CONSTRAINT FK_nasajon_itens_pedido_pedido FOREIGN KEY (codigo_pedido)
            REFERENCES nasajon_pedidos (codigo_pedido),
          CONSTRAINT FK_nasajon_itens_pedido_produto FOREIGN KEY (codigo_produto)
            REFERENCES nasajon_produtos (codigo_produto)
        );
        
        PRINT 'Tabela nasajon_itens_pedido criada com sucesso';
      END
      ELSE
      BEGIN
        PRINT 'Tabela nasajon_itens_pedido já existe';
      END
    `);
    
    console.log('Todas as tabelas foram criadas com sucesso!');
    
    await pool.close();
    console.log('Conexão fechada');
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
}

// Executa a criação das tabelas
criarTabelasNasajon();