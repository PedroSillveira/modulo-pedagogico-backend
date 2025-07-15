# Imagem de Origem
FROM node:18-alpine
# Diretório de trabalho(é onde a aplicação ficará dentro do container).
WORKDIR /app

COPY package.json package-lock.json ./
# Instalando dependências da aplicação e armazenando em cache.
COPY . .

RUN npm install

# Inicializa a aplicação
CMD ["npm", "start"]