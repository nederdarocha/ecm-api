## requisitos

- Node.js versão > 14.0
- Docker

### extensions VSCode

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Edge template](https://marketplace.visualstudio.com/items?itemName=luongnd.edge)
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

### clone o projeto para sua máquina

```bash
git clone git@github.com:bento-dev-br/sgp-api.git api
```

### no diretório do projeto instale as dependências

```bash
# ~/api
npm install
```

### copie as variáveis e atribua os valores correspondentes

```bash
cp .env.example .env
```

### Docker - execute a receita para ter um container do Postgres

```bash
docker-compose up -d

# docker-compose down
# docker-compose up --build -d
```

### Execute as migration e as seeds

```bash
# node ace migration:status
node ace migration:run
node ace db:seed
```

### build produção

```bash
npm run build

# cp .env /build/.env
cd build
node serve.js
```

### estrutura de arquivos remapeadas

```json
  "namespaces": {
    "models": "App/Modules",
    "validators": "App/Modules",
    "httpControllers": "App/Modules"
  },
  "directories": {
    "views": "App/Modules"
  },
```

### Criar novas chaves para o ambiente de produção e substituir as variáveis JWT_PRIVATE_KEY e JWT_PUBLIC_KEY no arquivo `~/build/.env`

```bash
openssl genrsa -out private-key.pem 2048
cat private-key.pem
openssl rsa -in private-key.pem -pubout -out public-key.pem
cat public-key.pem
```

### junte a saída das chaves e uma única linha respeitando as quebras de linha `\n`

JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIJQwI ... eqSg\n-----END PRIVATE KEY-----\n

JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMI ... wEAAQ\n-----END PUBLIC KEY-----\n

### scp staging

copia arquivos de um diretório para o servidor inclusive aquivos ocultos (dot files)
flags | -rpq (q=quiet)

```
scp -i "../key_dev_sahfe.pem" -rp /Users/Bento/Projetos/sgp/api/build/(*|.*) ubuntu@ec2-54-208-10-153.compute-1.amazonaws.com:~/api/build
```

## scp producao

### fazer o build do projeto

```bash
npm run build
```

### executar o shell para compactar e enviar o .zip para a máquina virtual

```bash
./deploy-prod.sh
```

### acessar a máquina virtual e rodar o shell para descompactar, copiar o arquivo, e reiniciar o PM2

```bash
./restart.sh
```

# legado envio arquivo a arquivo

copia arquivos de um diretório para o servidor inclusive aquivos ocultos (dot files)
flags | -rpq (q=quiet)

```
scp -i "../key_ec2_agb.pem" -rp /Users/Bento/Projetos/sgp/api/build/(*|.*) ubuntu@18.232.149.242:~/api
```
