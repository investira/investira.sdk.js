const bcrypt = require("bcrypt");

const passwords = {
    /**
     * Verifica se senhas são iguais
     *
     * @param {*} pPlainPassword
     * @param {*} pEncryptedPassword
     * @returns Promise com resultado com true ou false
     */
    checkPassword: (pPlainPassword, pEncryptedPassword) => {
        return bcrypt.compare(pPlainPassword, pEncryptedPassword);
    },

    /**
     * Criptografa a senha
     *
     * @param {*} pPlainPassword
     * @param {*} pSaltRounds Quantidade de rodadas para gerar a senha.
     * 						  Quantio maior, mais tempo consome
     * @returns Promise com a senha criptografada
     */
    /**
     *
     *
     * @param {*} pPlainPassword
     * @returns
     */
    encryptPassword: (pPlainPassword, pSaltRounds = 10) => {
        return bcrypt.hash(pPlainPassword, pSaltRounds);
    }
};

module.exports = passwords;
