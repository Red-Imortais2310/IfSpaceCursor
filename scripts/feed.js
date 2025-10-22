// scripts/feed.js

console.log("-> feed.js starting execution.");

// Importar funções do Firebase
import { 
    savePostToFirebase, 
    loadPostsFromFirebase, 
    saveStoryToFirebase, 
    uploadFileToFirebase,
    saveMessageToFirebase,
    loadMessagesFromFirebase,
    onAuthStateChange,
    onPostsChange,
    onMessagesChange,
    logoutUser
} from './firebase-config.js';

// Variáveis para os elementos do DOM (declaradas fora do DOMContentLoaded para escopo maior)
let liveBtn;
let photoBtn;
let feelingBtn;
let feelingModal;
let closeModal;
let emojisGrid;
let postsFeed;
let postText;
let messagesBtn;
let contactsList;
let userNameSpan;     // Elemento do nome do usuário na sidebar
let profileImage;     // Elemento para exibir a foto de perfil do Firebase
let logoutButton;     // Botão de logout no header
let mainContentArea;  // Referência para o container principal onde os botões admin serão adicionados

// Variáveis para o feed dinâmico e scroll infinito
let lastVisiblePost = null;
let loadingPosts = false;
const POSTS_PER_PAGE = 10;

// Dados de exemplo para contatos (15 nomes)
const contacts = [
    { name: 'Maria Silva', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'João Santos', status: 'Há 2 min', avatar: 'https://via.placeholder.com/35' },
    { name: 'Ana Costa', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Pedro Oliveira', status: 'Há 5 min', avatar: 'https://via.placeholder.com/35' },
    { name: 'Carla Lima', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Rafael Souza', status: 'Há 10 min', avatar: 'https://via.placeholder.com/35' },
    { name: 'Fernanda Rocha', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Lucas Alves', status: 'Há 15 min', avatar: 'https://via.placeholder.com/35' },
    { name: 'Juliana Ferreira', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Diego Martins', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Patricia Gomes', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Marcos Silva', status: 'Há 30 min', avatar: 'https://via.placeholder.com/35' },
    { name: 'Camila Dias', status: 'Online', avatar: 'https://via.placeholder.com/35' },
    { name: 'Thiago Costa', status: 'Há 1 hora', avatar: 'https://via.placeholder.com/35' },
    { name: 'Larissa Santos', status: 'Online', avatar: 'https://via.placeholder.com/35' }
];

// Funções auxiliares para manipulação de mídia e links
function detectLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
}

function handleMediaUpload(file, type) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve({
                type: type,
                url: e.target.result
            });
        };
        reader.readAsDataURL(file);
    });
}

async function createLinkPreview(url) {
    // Simular preview por enquanto
    return {
        title: 'Preview do Link',
        description: url,
        image: 'https://via.placeholder.com/200'
    };
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    let mediaContent = '';
    if (post.type === 'image') {
        mediaContent = `<img src="${post.mediaUrl}" alt="Post image" class="post-image">`;
    } else if (post.type === 'audio') {
        mediaContent = `
            <div class="post-audio">
                <audio controls>
                    <source src="${post.mediaUrl}" type="audio/mpeg">
                </audio>
            </div>
        `;
    } else if (post.type === 'link') {
        mediaContent = `
            <div class="post-link-preview">
                <img src="${post.preview.image}" alt="Link preview">
                <h4>${post.preview.title}</h4>
                <p>${post.preview.description}</p>
            </div>
        `;
    }

    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar}" alt="${post.author}" class="profile-img">
            <div>
                <h4>${post.author}</h4>
                <span>${post.time}</span>
            </div>
        </div>
        <div class="post-content">
            ${post.content}
            ${mediaContent}
        </div>
        <div class="post-actions">
            <button class="post-action">
                <i class="fas fa-thumbs-up"></i>
                Curtir (${post.likes})
            </button>
            <button class="post-action">
                <i class="fas fa-comment"></i>
                Comentar (${post.comments})
            </button>
            <button class="post-action">
                <i class="fas fa-share"></i>
                Compartilhar (${post.shares})
            </button>
        </div>
    `;
    return postDiv;
}

function createNewPost(content, type = 'text', mediaUrl = null, preview = null) {
    const newPost = {
        author: userNameSpan ? userNameSpan.textContent : 'Usuário IfSpace',
        avatar: 'https://via.placeholder.com/40',
        content: content,
        time: 'Agora',
        likes: 0,
        comments: 0,
        shares: 0,
        type: type,
        mediaUrl: mediaUrl,
        preview: preview
    };

    if (postsFeed) {
        const postElement = createPostElement(newPost);
        postsFeed.insertBefore(postElement, postsFeed.firstChild);
    }
}

function setupEventListeners() {
    // Botão Live
    if (liveBtn) liveBtn.addEventListener('click', function() {
        alert('Funcionalidade de Live em desenvolvimento. Logo estará disponível!');
    });

    // Botão Foto/Imagem/Áudio com sugestões
    if (photoBtn) photoBtn.addEventListener('click', function() {
        openMediaSelector();
    });

    // Botão Sentimento com categorias
    if (feelingBtn) feelingBtn.addEventListener('click', function() {
        openFeelingSelector();
    });

    // Fechar modal de Sentimento
    if (closeModal) closeModal.addEventListener('click', function() {
        if (feelingModal) feelingModal.style.display = 'none';
    });

    // Fechar modal de Sentimento ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === feelingModal) {
            if (feelingModal) feelingModal.style.display = 'none';
        }
    });

    // Selecionar emoji
    if (emojisGrid) emojisGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('emoji-item')) {
            const emoji = e.target.dataset.emoji;
            if (postText) {
                const text = postText.value;
                postText.value = text + ` ${emoji}`;
            }
            if (feelingModal) feelingModal.style.display = 'none';
        }
    });

    // Botão de mensagens
    if (messagesBtn) messagesBtn.addEventListener('click', function() {
        window.location.href = 'mensagens.html';
    });

    // Criar novo post (com keypress e suporte a links)
    if (postText) postText.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            const content = this.value.trim();
            const links = detectLinks(content);
            
            if (links && links.length > 0) {
                const preview = await createLinkPreview(links[0]);
                createNewPost(content, 'link', null, preview);
            } else {
                createNewPost(content, 'text');
            }
            
            this.value = '';
        }
    });
}

function loadContacts() {
    if (contactsList) {
        contactsList.innerHTML = '';
        contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            contactElement.innerHTML = `
                <img src="${contact.avatar}" alt="${contact.name}">
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status">${contact.status}</div>
                </div>
            `;
            contactsList.appendChild(contactElement);
        });
    } else {
        console.warn("IfSpace UI: Elemento 'contactsList' não encontrado.");
    }
}

function loadPosts() {
    if (postsFeed) {
        postsFeed.innerHTML = '';
        // Aqui você pode implementar a lógica de carregamento de posts do Firebase
        // Por enquanto, pode deixar vazio ou adicionar alguns posts de exemplo
    } else {
        console.warn("IfSpace UI: Elemento 'postsFeed' não encontrado.");
    }
}

function init() {
    console.log("IfSpace UI: Inicializando componentes...");
    loadContacts();
    loadPosts();
    setupEventListeners();
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired in feed.js");

    // Obtenção de referências aos elementos do DOM
    liveBtn = document.getElementById('liveBtn');
    photoBtn = document.getElementById('photoBtn');
    feelingBtn = document.getElementById('feelingBtn');
    feelingModal = document.getElementById('feelingModal');
    closeModal = document.querySelector('.close');
    emojisGrid = document.querySelector('.emojis-grid');
    postsFeed = document.getElementById('postsFeed');
    postText = document.getElementById('postText');
    messagesBtn = document.getElementById('messagesBtn');
    contactsList = document.getElementById('contactsList');
    userNameSpan = document.getElementById('userName');
    profileImage = document.getElementById('profileImage');
    logoutButton = document.getElementById('logoutButton');
    mainContentArea = document.querySelector('.main-content');

    // Configuração de autenticação do Firebase
    if (window.firebaseAuth) {
        window.firebaseOnAuthStateChanged(window.firebaseAuth, async (user) => {
            if (user) {
                // Usuário está logado
                console.log("Firebase: Usuário logado:", user.uid);
                
                try {
                    const userDocRef = window.firebaseFirestoreDoc(window.firebaseFirestore, "users", user.uid);
                    const userDocSnap = await window.firebaseFirestoreGetDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        if (userNameSpan) {
                            userNameSpan.textContent = `${userData.firstName} ${userData.lastName}`;
                        }
                        if (profileImage && userData.profilePictureUrl) {
                            profileImage.src = userData.profilePictureUrl;
                        } else if (profileImage) {
                            profileImage.src = "https://via.placeholder.com/50";
                        }
                    } else {
                        if (userNameSpan) userNameSpan.textContent = "Usuário sem perfil";
                    }
                } catch (error) {
                    console.error("Firebase: Erro ao buscar dados do usuário:", error);
                    if (userNameSpan) userNameSpan.textContent = "Erro ao carregar nome";
                }

                // Inicializar a UI após confirmação de login
                init();

                // Configurar eventos do logout
                if (logoutButton) {
                    logoutButton.addEventListener('click', async () => {
                        try {
                            await window.firebaseSignOut(window.firebaseAuth);
                            console.log("Firebase: Usuário deslogado com sucesso.");
                            window.location.href = 'index.html';
                        } catch (error) {
                            console.error("Firebase: Erro ao fazer logout:", error);
                            alert("Erro ao fazer logout. Por favor, tente novamente.");
                        }
                    });
                }
            } else {
                // Usuário não está logado
                console.log("Firebase: Nenhum usuário logado. Redirecionando para index.html");
                window.location.href = 'index.html';
            }
        });
    } else {
        console.warn("Firebase: Firebase Auth não disponível. Inicializando sem autenticação.");
        init();
    }

    // Sistema de posts temporários (5 dias)
    function setupTemporaryPosts() {
        const posts = JSON.parse(localStorage.getItem('ifspace_posts') || '[]');
        const now = new Date().getTime();
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
        
        // Remover posts antigos
        const validPosts = posts.filter(post => {
            const postTime = new Date(post.timestamp).getTime();
            return (now - postTime) < fiveDaysInMs;
        });
        
        // Salvar posts válidos
        localStorage.setItem('ifspace_posts', JSON.stringify(validPosts));
        
        // Carregar posts no feed
        loadTemporaryPosts(validPosts);
    }

    async function loadTemporaryPosts(posts) {
        if (postsFeed) {
            postsFeed.innerHTML = '';
            
            // Se não há posts locais, carregar do Firebase
            if (!posts || posts.length === 0) {
                try {
                    const result = await loadPostsFromFirebase();
                    if (result.success) {
                        posts = result.posts;
                    }
                } catch (error) {
                    console.error('Erro ao carregar posts do Firebase:', error);
                }
            }
            
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsFeed.appendChild(postElement);
            });
        }
    }

    async function savePostToStorage(post) {
        try {
            const result = await savePostToFirebase(post);
            if (result.success) {
                console.log('Post salvo no Firebase:', result.id);
                return true;
            } else {
                console.error('Erro ao salvar post:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Erro ao salvar post:', error);
            return false;
        }
    }

    // Seletor de mídia avançado
    function openMediaSelector() {
        const mediaModal = document.createElement('div');
        mediaModal.className = 'media-modal';
        mediaModal.innerHTML = `
            <div class="media-modal-content">
                <div class="media-modal-header">
                    <h3>Adicionar Mídia</h3>
                    <span class="close-media-modal">&times;</span>
                </div>
                <div class="media-options">
                    <div class="media-option" data-type="image">
                        <i class="fas fa-image"></i>
                        <h4>Imagem</h4>
                        <p>Foto ou imagem</p>
                    </div>
                    <div class="media-option" data-type="video">
                        <i class="fas fa-video"></i>
                        <h4>Vídeo</h4>
                        <p>Vídeo com áudio</p>
                    </div>
                    <div class="media-option" data-type="link">
                        <i class="fas fa-link"></i>
                        <h4>Link</h4>
                        <p>URL de imagem ou vídeo</p>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .media-modal {
                display: flex;
                position: fixed;
                z-index: 3000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                align-items: center;
                justify-content: center;
            }
            .media-modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .media-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e1e1e1;
            }
            .media-modal-header h3 {
                color: #00a400;
                margin: 0;
            }
            .close-media-modal {
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .media-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                padding: 20px;
            }
            .media-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                border: 2px solid #e1e1e1;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .media-option:hover {
                border-color: #00a400;
                background: #f0f2f5;
            }
            .media-option i {
                font-size: 2rem;
                color: #00a400;
                margin-bottom: 10px;
            }
            .media-option h4 {
                margin: 5px 0;
                color: #333;
            }
            .media-option p {
                font-size: 12px;
                color: #666;
                margin: 0;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(mediaModal);

        // Event listeners
        setupMediaModalEvents(mediaModal);
    }

    function setupMediaModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-media-modal');
        const mediaOptions = modal.querySelectorAll('.media-option');

        closeBtn.addEventListener('click', () => modal.remove());

        mediaOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                modal.remove();
                
                switch(type) {
                    case 'image':
                        openImageSelector();
                        break;
                    case 'video':
                        openVideoSelector();
                        break;
                    case 'link':
                        openLinkSelector();
                        break;
                }
            });
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Seletor de imagens
    function openImageSelector() {
        const imageModal = document.createElement('div');
        imageModal.className = 'image-modal';
        imageModal.innerHTML = `
            <div class="image-modal-content">
                <div class="image-modal-header">
                    <h3>Adicionar Imagem</h3>
                    <span class="close-image-modal">&times;</span>
                </div>
                <div class="image-options">
                    <label class="image-option">
                        <i class="fas fa-folder-open"></i>
                        <h4>Meu Arquivo</h4>
                        <input type="file" accept="image/*" style="display: none;">
                    </label>
                    <div class="image-option" id="googleImages">
                        <i class="fab fa-google"></i>
                        <h4>Google Imagens</h4>
                    </div>
                    <div class="image-option" id="imageLink">
                        <i class="fas fa-link"></i>
                        <h4>Link da Imagem</h4>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent += `
            .image-modal, .video-modal, .link-modal {
                display: flex;
                position: fixed;
                z-index: 3000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                align-items: center;
                justify-content: center;
            }
            .image-modal-content, .video-modal-content, .link-modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .image-modal-header, .video-modal-header, .link-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e1e1e1;
            }
            .image-modal-header h3, .video-modal-header h3, .link-modal-header h3 {
                color: #00a400;
                margin: 0;
            }
            .close-image-modal, .close-video-modal, .close-link-modal {
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .image-options, .video-options, .link-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                padding: 20px;
            }
            .image-option, .video-option, .link-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                border: 2px solid #e1e1e1;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .image-option:hover, .video-option:hover, .link-option:hover {
                border-color: #00a400;
                background: #f0f2f5;
            }
            .image-option i, .video-option i, .link-option i {
                font-size: 2rem;
                color: #00a400;
                margin-bottom: 10px;
            }
            .image-option h4, .video-option h4, .link-option h4 {
                margin: 5px 0;
                color: #333;
            }
            .link-input {
                width: 100%;
                padding: 10px;
                border: 1px solid #e1e1e1;
                border-radius: 4px;
                margin: 10px 0;
            }
            .preview-container {
                margin: 15px 0;
                text-align: center;
            }
            .preview-image, .preview-video {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(imageModal);

        setupImageModalEvents(imageModal);
    }

    function setupImageModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-image-modal');
        const fileInput = modal.querySelector('input[type="file"]');
        const googleImages = modal.querySelector('#googleImages');
        const imageLink = modal.querySelector('#imageLink');

        closeBtn.addEventListener('click', () => modal.remove());

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const post = {
                        author: 'João Silva',
                        avatar: 'https://via.placeholder.com/40',
                        content: '',
                        time: 'Agora',
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        type: 'image',
                        mediaUrl: e.target.result
                    };
                    savePostToStorage(post);
                    createNewPost('', 'image', e.target.result);
                    modal.remove();
                };
                reader.readAsDataURL(file);
            }
        });

        googleImages.addEventListener('click', function() {
            alert('Funcionalidade do Google Imagens será implementada em breve!');
        });

        imageLink.addEventListener('click', function() {
            const url = prompt('Digite a URL da imagem:');
            if (url) {
                if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    const post = {
                        author: 'João Silva',
                        avatar: 'https://via.placeholder.com/40',
                        content: '',
                        time: 'Agora',
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        type: 'image',
                        mediaUrl: url
                    };
                    savePostToStorage(post);
                    createNewPost('', 'image', url);
                    modal.remove();
                } else {
                    alert('Por favor, insira uma URL válida de imagem (jpg, png, gif, webp)');
                }
            }
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Seletor de vídeos
    function openVideoSelector() {
        const videoModal = document.createElement('div');
        videoModal.className = 'video-modal';
        videoModal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>Adicionar Vídeo</h3>
                    <span class="close-video-modal">&times;</span>
                </div>
                <div class="video-options">
                    <label class="video-option">
                        <i class="fas fa-folder-open"></i>
                        <h4>Meu Arquivo</h4>
                        <input type="file" accept="video/*" style="display: none;">
                    </label>
                    <div class="video-option" id="videoLink">
                        <i class="fas fa-link"></i>
                        <h4>Link do Vídeo</h4>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(videoModal);
        setupVideoModalEvents(videoModal);
    }

    function setupVideoModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-video-modal');
        const fileInput = modal.querySelector('input[type="file"]');
        const videoLink = modal.querySelector('#videoLink');

        closeBtn.addEventListener('click', () => modal.remove());

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const post = {
                        author: 'João Silva',
                        avatar: 'https://via.placeholder.com/40',
                        content: '',
                        time: 'Agora',
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        type: 'video',
                        mediaUrl: e.target.result
                    };
                    savePostToStorage(post);
                    createNewPost('', 'video', e.target.result);
                    modal.remove();
                };
                reader.readAsDataURL(file);
            }
        });

        videoLink.addEventListener('click', function() {
            const url = prompt('Digite a URL do vídeo:');
            if (url) {
                if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
                    const post = {
                        author: 'João Silva',
                        avatar: 'https://via.placeholder.com/40',
                        content: '',
                        time: 'Agora',
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        type: 'video',
                        mediaUrl: url
                    };
                    savePostToStorage(post);
                    createNewPost('', 'video', url);
                    modal.remove();
                } else {
                    alert('Por favor, insira uma URL válida de vídeo (mp4, webm, ogg, avi, mov)');
                }
            }
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Seletor de links
    function openLinkSelector() {
        const linkModal = document.createElement('div');
        linkModal.className = 'link-modal';
        linkModal.innerHTML = `
            <div class="link-modal-content">
                <div class="link-modal-header">
                    <h3>Adicionar Link</h3>
                    <span class="close-link-modal">&times;</span>
                </div>
                <div class="link-options">
                    <div class="link-option">
                        <i class="fas fa-link"></i>
                        <h4>URL de Mídia</h4>
                        <input type="url" class="link-input" placeholder="Cole aqui a URL da imagem ou vídeo">
                        <button class="preview-btn">Visualizar</button>
                        <div class="preview-container"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(linkModal);
        setupLinkModalEvents(linkModal);
    }

    function setupLinkModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-link-modal');
        const linkInput = modal.querySelector('.link-input');
        const previewBtn = modal.querySelector('.preview-btn');
        const previewContainer = modal.querySelector('.preview-container');

        closeBtn.addEventListener('click', () => modal.remove());

        previewBtn.addEventListener('click', function() {
            const url = linkInput.value;
            if (url) {
                if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    previewContainer.innerHTML = `<img src="${url}" class="preview-image" alt="Preview">`;
                } else if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
                    previewContainer.innerHTML = `<video src="${url}" class="preview-video" controls></video>`;
                } else {
                    alert('URL não reconhecida como imagem ou vídeo válido');
                }
            }
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Sistema de sentimentos categorizados
    function openFeelingSelector() {
        const feelingModal = document.createElement('div');
        feelingModal.className = 'feeling-modal';
        feelingModal.innerHTML = `
            <div class="feeling-modal-content">
                <div class="feeling-modal-header">
                    <h3>Como você está se sentindo?</h3>
                    <span class="close-feeling-modal">&times;</span>
                </div>
                <div class="feeling-categories">
                    <div class="feeling-category">
                        <h4>😊 Alegre</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="😊">😊</div>
                            <div class="emoji-item" data-emoji="😄">😄</div>
                            <div class="emoji-item" data-emoji="😁">😁</div>
                            <div class="emoji-item" data-emoji="🤗">🤗</div>
                            <div class="emoji-item" data-emoji="🥳">🥳</div>
                        </div>
                    </div>
                    <div class="feeling-category">
                        <h4>😢 Triste</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="😢">😢</div>
                            <div class="emoji-item" data-emoji="😭">😭</div>
                            <div class="emoji-item" data-emoji="😔">😔</div>
                            <div class="emoji-item" data-emoji="😞">😞</div>
                            <div class="emoji-item" data-emoji="💔">💔</div>
                        </div>
                    </div>
                    <div class="feeling-category">
                        <h4>🤒 Doente</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="🤒">🤒</div>
                            <div class="emoji-item" data-emoji="🤕">🤕</div>
                            <div class="emoji-item" data-emoji="😷">😷</div>
                            <div class="emoji-item" data-emoji="🤧">🤧</div>
                            <div class="emoji-item" data-emoji="🤢">🤢</div>
                        </div>
                    </div>
                    <div class="feeling-category">
                        <h4>🤔 Dúvida</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="🤔">🤔</div>
                            <div class="emoji-item" data-emoji="😕">😕</div>
                            <div class="emoji-item" data-emoji="😐">😐</div>
                            <div class="emoji-item" data-emoji="🤨">🤨</div>
                            <div class="emoji-item" data-emoji="😶">😶</div>
                        </div>
                    </div>
                    <div class="feeling-category">
                        <h4>👍 Gostei</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="👍">👍</div>
                            <div class="emoji-item" data-emoji="👏">👏</div>
                            <div class="emoji-item" data-emoji="🙌">🙌</div>
                            <div class="emoji-item" data-emoji="💪">💪</div>
                            <div class="emoji-item" data-emoji="🔥">🔥</div>
                        </div>
                    </div>
                    <div class="feeling-category">
                        <h4>👎 Não Gostei</h4>
                        <div class="emojis-grid">
                            <div class="emoji-item" data-emoji="👎">👎</div>
                            <div class="emoji-item" data-emoji="😤">😤</div>
                            <div class="emoji-item" data-emoji="😠">😠</div>
                            <div class="emoji-item" data-emoji="🤬">🤬</div>
                            <div class="emoji-item" data-emoji="💢">💢</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent += `
            .feeling-modal {
                display: flex;
                position: fixed;
                z-index: 3000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                align-items: center;
                justify-content: center;
            }
            .feeling-modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .feeling-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e1e1e1;
            }
            .feeling-modal-header h3 {
                color: #00a400;
                margin: 0;
            }
            .close-feeling-modal {
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .feeling-categories {
                padding: 20px;
            }
            .feeling-category {
                margin-bottom: 20px;
            }
            .feeling-category h4 {
                color: #333;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .emojis-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
            }
            .emoji-item {
                font-size: 2rem;
                text-align: center;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .emoji-item:hover {
                background: #f0f2f5;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(feelingModal);

        setupFeelingModalEvents(feelingModal);
    }

    function setupFeelingModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-feeling-modal');
        const emojiItems = modal.querySelectorAll('.emoji-item');

        closeBtn.addEventListener('click', () => modal.remove());

        emojiItems.forEach(item => {
            item.addEventListener('click', function() {
                const emoji = this.dataset.emoji;
                if (postText) {
                    const text = postText.value;
                    postText.value = text + ` ${emoji}`;
                }
                modal.remove();
            });
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Inicializar sistema de posts temporários
    setupTemporaryPosts();
});