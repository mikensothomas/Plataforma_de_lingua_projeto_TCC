const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// const connectDb = async () => {
//     const client = new Client({
//         user: process.env.PGUSER,
//         host: process.env.PGHOST,
//         database: process.env.PGDATABASE,
//         password: process.env.PGPASSWORD,
//         port: process.env.PGPORT
//     });

//     try {
//         await client.connect();
//         return client;
//     } catch (error) {
//         console.error("Erro ao conectar ao banco de dados:", error);
//         throw error;
//     }
// };

const connectDb = async () => {
    const client = new Client({
        // connectionString: process.env.DATABASE_URL
        connectionString: process.env.POSTGRES_URL
    });

    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
};

async function criarTabelas(client) {
    try {
        const queryUsuarios = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                senha VARCHAR(100),
                is_admin BOOLEAN DEFAULT FALSE,
                reset_token VARCHAR(100),
                reset_token_expires BIGINT
            );
        `;

        const queryVideos = `
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(100),
                descricao TEXT,
                link text,
                nivel int
            );
        `;

        const queryComentario = `
            CREATE TABLE IF NOT EXISTS comentarios (
                id SERIAL PRIMARY KEY,
                video_id INT REFERENCES videos(id) ON DELETE CASCADE,
                comentario TEXT,
                data TIMESTAMP DEFAULT NOW()
            );
        `;
        
        const queryAvaliacoes = `
            CREATE TABLE IF NOT EXISTS avaliacoes (
                id SERIAL PRIMARY KEY,
                video_id INT REFERENCES videos(id) ON DELETE CASCADE,
                avaliacao INT NOT NULL
            );
        `;
        
        await client.query(queryUsuarios);
        await client.query(queryVideos);
        await client.query(queryComentario);
        await client.query(queryAvaliacoes);

    } catch (error) {
        throw error;
    }
}

module.exports = connectDb;