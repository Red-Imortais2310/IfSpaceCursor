# 🌟 IfSpace - Rede Social

![IfSpace Logo](https://img.shields.io/badge/IfSpace-Rede%20Social-00a400?style=for-the-badge&logo=facebook&logoColor=white)

Uma rede social moderna e completa desenvolvida com HTML, CSS e JavaScript puro, pronta para integração com Firebase.

## 🚀 Demonstração

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-00a400?style=for-the-badge&logo=github&logoColor=white)](https://ageno.github.io/IfSpaceCursor)

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- **Login seguro** com validação de credenciais
- **Registro de usuários** com validação completa
- **Recuperação de senha** por email
- **Lembrar senha** com localStorage
- **Validação em tempo real** dos formulários

### 📱 Feed Principal
- **Interface similar ao Facebook** com design moderno
- **Sistema de Stories** com foto e áudio
- **Criação de posts** com texto, imagens e sentimentos
- **Botões de interação**: Live, Foto/Imagem, Sentimento
- **Modal de emojis** para expressar sentimentos
- **Timeline dinâmica** com posts em tempo real

### 💬 Sistema de Mensagens
- **Chat em tempo real** com 50 amigos pré-cadastrados
- **Interface de mensagens** profissional
- **Lista de contatos** com status online/offline
- **Sistema de notificações** visual
- **Responsividade completa** para mobile

### 🎨 Stories Avançados
- **Upload de fotos** do dispositivo
- **Gravação de áudio** para stories
- **Preview em tempo real** do conteúdo
- **Controles de áudio** integrados
- **Limite de 3 stories** por perfil

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos e responsivos
- **JavaScript ES6+** - Funcionalidades dinâmicas
- **Font Awesome** - Ícones profissionais
- **LocalStorage** - Persistência de dados
- **FileReader API** - Upload de arquivos

## 📁 Estrutura do Projeto

```
IfSpaceCursor/
├── index.html              # Página de login
├── feed.html               # Feed principal
├── cadastro.html           # Página de registro
├── recuperar-senha.html    # Recuperação de senha
├── mensagens.html          # Sistema de mensagens
├── styles/
│   ├── login.css           # Estilos do login
│   ├── feed.css            # Estilos do feed
│   ├── cadastro.css        # Estilos do cadastro
│   ├── recuperar-senha.css # Estilos de recuperação
│   └── mensagens.css       # Estilos das mensagens
├── scripts/
│   ├── login.js            # Lógica do login
│   ├── feed.js             # Funcionalidades do feed
│   ├── cadastro.js         # Validação do cadastro
│   ├── recuperar-senha.js  # Recuperação de senha
│   └── mensagens.js        # Sistema de mensagens
└── README.md               # Este arquivo
```

## 🚀 Como Executar

### 1. Clone o Repositório
```bash
git clone https://github.com/ageno/IfSpaceCursor.git
cd IfSpaceCursor
```

### 2. Abra o Projeto
- Abra o arquivo `index.html` no seu navegador
- Ou use um servidor local:
```bash
# Com Python
python -m http.server 8000

# Com Node.js
npx http-server

# Com PHP
php -S localhost:8000
```

### 3. Acesse o Sistema
- **URL**: `http://localhost:8000`
- **Login**: `admin@ifspace.com`
- **Senha**: `123456`

## 📱 Responsividade

O projeto é **100% responsivo** e funciona perfeitamente em:

- 📱 **Mobile** (< 768px)
- 📱 **Tablet** (768px - 1024px)
- 💻 **Desktop** (> 1024px)

### Características Responsivas:
- Layout adaptativo com CSS Grid e Flexbox
- Navegação otimizada para touch
- Botões com tamanho mínimo de 44px
- Imagens responsivas com object-fit
- Tipografia escalável

## 🎨 Design System

### Cores Principais
- **Primária**: `#00a400` (Verde IfSpace)
- **Secundária**: `#008a00` (Verde escuro)
- **Neutra**: `#f0f2f5` (Cinza claro)
- **Texto**: `#333` (Cinza escuro)

### Componentes
- **Botões** com hover effects
- **Cards** com sombras suaves
- **Modais** com backdrop blur
- **Formulários** com validação visual
- **Navegação** intuitiva

## 🔧 Funcionalidades Técnicas

### Validação de Formulários
- Validação em tempo real
- Mensagens de erro personalizadas
- Validação de email com regex
- Validação de idade mínima (13 anos)
- Aceite obrigatório de termos

### Upload de Arquivos
- Suporte a imagens (JPG, PNG, GIF)
- Suporte a áudio (MP3, WAV, OGG)
- Preview em tempo real
- Validação de tipos de arquivo
- Controles de áudio integrados

### Persistência de Dados
- LocalStorage para credenciais
- Sessão de usuário
- Dados de formulários
- Preferências do usuário

## 🚀 Deploy no GitHub Pages

### 1. Configure o Repositório
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ageno/IfSpaceCursor.git
git push -u origin main
```

### 2. Ative o GitHub Pages
1. Vá para **Settings** do repositório
2. Role até **Pages**
3. Selecione **Deploy from a branch**
4. Escolha **main** branch
5. Clique em **Save**

### 3. Acesse seu Site
- **URL**: `https://ageno.github.io/IfSpaceCursor`
- O site estará disponível em alguns minutos

## 🔮 Próximos Passos

### Integração com Firebase
- [ ] Autenticação com Firebase Auth
- [ ] Banco de dados Firestore
- [ ] Storage para imagens e áudios
- [ ] Real-time database para mensagens
- [ ] Push notifications

### Funcionalidades Avançadas
- [ ] Sistema de amigos
- [ ] Grupos e páginas
- [ ] Marketplace
- [ ] Eventos
- [ ] Videochamadas
- [ ] Stories com filtros

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Ageno**
- GitHub: [@ageno](https://github.com/ageno)
- LinkedIn: [Ageno LinkedIn](https://linkedin.com/in/ageno)
- Email: ageno@exemplo.com

## 🙏 Agradecimentos

- [Font Awesome](https://fontawesome.com/) pelos ícones
- [GitHub](https://github.com/) pelo hosting
- Comunidade open source pela inspiração

---

<div align="center">

### ⭐ Se este projeto te ajudou, considere dar uma estrela! ⭐

[![GitHub stars](https://img.shields.io/github/stars/ageno/IfSpaceCursor?style=social)](https://github.com/ageno/IfSpaceCursor/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ageno/IfSpaceCursor?style=social)](https://github.com/ageno/IfSpaceCursor/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/ageno/IfSpaceCursor?style=social)](https://github.com/ageno/IfSpaceCursor/watchers)

</div>
