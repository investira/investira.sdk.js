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
     * @returns Promise com a senha criptografada
     */
    encryptPassword: (pPlainPassword, pSaltRounds) => {
        return bcrypt.hash(pPlainPassword, pSaltRounds);
    }
};

module.exports = passwords;
