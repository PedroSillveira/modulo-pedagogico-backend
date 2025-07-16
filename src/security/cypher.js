const crypto = require('crypto');
const speak = require('speakeasy')
const jwt = require('jsonwebtoken');


const KEY = '7f251b51e0199f5a691a9908e73911a3';
const IV = Buffer.from('8ac1d51fc776cd79895cb766f02ad3d5', 'hex');
const SPEAKKEY = 'd4615b4d8bddbd807922b2d2f2b20dc5';
const jwtsecret = '786af68110556384b274e23e03da5b9e'


function encryptCPF(cpf) {
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    let encrypted = cipher.update(cpf, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}


function decryptCPF(encryptedCPF) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedCPF, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}


function cripto(data){
    return crypto.createHash('md5').update(data).digest('hex')
}


function speakeasytokengen() {
  const token = speak.totp({
      secret: SPEAKKEY,
      encoding: 'hex',   // <-- define corretamente como HEX
      digits: 6,
      step: 600          // 5 minutos
  });
  return token;
}

function speakeasytokenver(tokenRecebido) {
  const isValid = speak.totp.verify({
      secret: SPEAKKEY,
      encoding: 'hex',   // <-- igual na verificação
      token: tokenRecebido,
      step: 600,
      window: 1
  });
  return isValid;
}



  function generateExpirationTimestamp(hours) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return (nowInSeconds + hours * 3600).toString(); // 3600 segundos por hora
  }



  function geradortokenvideos(token_security_key, video_id) {
    const expiration = generateExpirationTimestamp(3)
    const data = token_security_key + video_id + expiration;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  

  function jwtencript(obj) {
    return jwt.sign(obj, jwtsecret, { expiresIn: '12h' }); // 1 hora de expiração
  }

  function jwtdecript(payload) {
    try {
      return jwt.verify(payload.payload, jwtsecret);
    } catch (err) {
      console.error('Token inválido ou expirado:', err.message);
      return null;
    }
  }


module.exports = {encryptCPF:encryptCPF,
    decryptCPF:decryptCPF,
    cripto:cripto,
    speakeasytokengen:speakeasytokengen,
    speakeasytokenver:speakeasytokenver,
    geradortokenvideos:geradortokenvideos,
    generateExpirationTimestamp:generateExpirationTimestamp,
    jwtencript:jwtencript,
    jwtdecript:jwtdecript}