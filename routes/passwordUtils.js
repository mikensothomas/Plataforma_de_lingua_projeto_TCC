const bcryptjs = require('bcryptjs');
const saltRounds = 10;

async function hashPassword(password) {
  try {
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    return hashedPassword;
  } catch (err) {
    throw new Error('Erro ao criptografar a senha');
  }
}

module.exports = {
  hashPassword
};