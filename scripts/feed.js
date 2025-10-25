// scripts/feed.js
console.log("-> feed.js starting execution.");

import { auth, db, storage, onAuthStateChange, savePostToFirebase, onPostsChange } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Variáveis do DOM e estado
let liveBtn, photoBtn, feelingBtn, feelingModal, closeModal, emojisGrid, postsFeed, postText, messagesBtn, contactsList, userNameSpan, profileImage, logoutButton, mainContentArea, imageUploadInput;
let currentUserId = null;

// Dados de exemplo para contatos
const exampleContacts = [
    { name: 'João Silva', img: 'https://placehold.co/40x40/007bff/ffffff?text=JS' },
    { name: 'Maria Souza', img: 'https://placehold.co/40x40/28a745/ffffff?text=MS' },
    { name: 'Pedro Santos', img: 'https://placehold.co/40x40/ffc107/333333?text=PS' },
    { name: 'Ana Costa', img: 'https://placehold.co/40x40/dc3545/ffffff?text=AC' },
    { name: 'Lucas Oliveira', img: 'https://placehold.co/40x40/6f42c1/ffffff?text=LO' },
    { name: 'Juliana Lima', img: 'https://placehold.co/40x40/e83e8c/ffffff?text=JL' },
    { name: 'Carlos Ferreira', img: 'https://placehold.co/40x40/17a2b8/ffffff?text=CF' },
    { name: 'Fernanda Rocha', img: 'https://placehold.co/40x40/fd7e14/ffffff?text=FR' },
    { name: 'Rafael Alves', img: 'https://placehold.co/40x40/6c757d/ffffff?text=RA' },
    { name: 'Beatriz Gomes', img: 'https://placehold.co/40x40/00bcd4/ffffff?text=BG' },
    { name: 'Gustavo Martins', img: 'https://placehold.co/40x40/e91e63/ffffff?text=GM' },
    { name: 'Larissa Vieira', img: 'https://placehold.co/40x40/ff9800/ffffff?text=LV' },
    { name: 'Diego Nogueira', img: 'https://placehold.co/40x40/9c27b0/ffffff?text=DN' },
    { name: 'Camila Ribeiro', img: 'https://placehold.co/40x40/4caf50/ffffff?text=CR' },
    { name: 'Eduardo Pires', img: 'https://placehold.co/40x40/795548/ffffff?text=EP' }
];

// Funções auxiliares
function detectLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
}

async function handleMediaUpload(file, type) {
    if (!currentUserId) return { success: false, error: "Usuário não autenticado." };
    if (!storage) return { success: false, error: "Firebase Storage não inicializado." };
    
    const fileName = `${type}/${currentUserId}_${Date.now()}_${file.name}`;
    try {
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { success: true, url };
    } catch (error) {
        console.error("Erro no upload de mídia:", error);
        return { success: false, error: error.message };
    }
}

async function createLinkPreview(url) {
    console.warn("Função createLinkPreview requer implementação de backend.");
    return {
        title: "Link Externo",
        description: url.substring(0, 50) + '...',
        image: 'https://placehold.co/150x100?text=Preview'
    };
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    let timeDisplay = post.time || 'Agora';
    if (post.timestamp instanceof Date) {
        timeDisplay = post.timestamp.toLocaleString('pt-BR');
    } else if (post.timestamp && post.timestamp.toDate) {
        timeDisplay = post.timestamp.toDate().toLocaleString('pt-BR');
    }

    let mediaContent = '';
    if (post.type === 'image' && post.mediaUrl) {
        mediaContent = `<img src="${post.mediaUrl}" alt="Imagem do post" class="post-image" onerror="this.src='https://placehold.co/400x300?text=Image+Error'">`;
    } else if (post.type === 'video' && post.mediaUrl) {
        mediaContent = `
            <div class="post-video">
                <video controls>
                    <source src="${post.mediaUrl}" type="video/mp4" onerror="this.parentElement.innerHTML='<img src=https://placehold.co/400x300?text=Video+Error>'">
                </video>
            </div>
        `;
    } else if (post.type === 'link' && post.preview) {
        mediaContent = `
            <div class="post-link-preview">
                <img src="${post.preview.image || 'https://placehold.co/150x100?text=Link+Preview'}" alt="Link preview" onerror="this.src='https://placehold.co/150x100?text=Preview+Error'">
                <h4>${post.preview.title || 'Link sem título'}</h4>
                <p>${post.preview.description || 'Clique para ver o conteúdo.'}</p>
            </div>
        `;
    }

    const likes = post.likes || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;

    const defaultAvatar = 'https://placehold.co/40x40?text=AV';

    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar || defaultAvatar}" alt="${post.author}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=AV'">
            <div>
                <h4>${post.author || 'Usuário IfSpace'}</h4>
                <span>${timeDisplay}</span>
            </div>
        </div>
        <div class="post-content">
            ${post.content || ''}
            ${mediaContent}
        </div>
        <div class="post-actions">
            <button class="post-action">
                <i class="fas fa-thumbs-up"></i>
                Curtir (${likes})
            </button>
            <button class="post-action">
                <i class="fas fa-comment"></i>
                Comentar (${comments})
            </button>
            <button class="post-action">
                <i class="fas fa-share"></i>
                Compartilhar (${shares})
            </button>
        </div>
    `;
    return postDiv;
}

async function createNewPost(content, type = 'text', mediaUrl = null, preview = null) {
    if (!content && !mediaUrl && !preview) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'Por favor, insira um texto, imagem, vídeo ou link.';
            errorMessage.style.display = 'block';
            setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
        } else {
            alert('Por favor, insira um texto, imagem, vídeo ou link.');
        }
        return;
    }

    const defaultAvatar = 'https://placehold.co/40x40?text=AV';
    
    const newPostData = {
        author: userNameSpan ? userNameSpan.textContent : 'Usuário IfSpace',
        avatar: profileImage ? profileImage.src : defaultAvatar,
        content,
        type,
        mediaUrl,
        preview,
        likes: 0,
        comments: 0,
        shares: 0,
        authorUid: currentUserId,
        timestamp: new Date()
    };

    try {
        await savePostToFirebase(newPostData);
        console.log("Post salvo no Firebase.");
        if (postsFeed) {
            const postElement = createPostElement(newPostData);
            postsFeed.insertBefore(postElement, postsFeed.firstChild);
        }
    } catch (error) {
        console.error("Erro ao salvar post:", error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'Erro ao salvar o post: ' + error.message;
            errorMessage.style.display = 'block';
            setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
        } else {
            alert('Erro ao salvar o post: ' + error.message);
        }
    }
}

function loadContacts() {
    if (contactsList) {
        contactsList.innerHTML = exampleContacts.map(contact => `
            <li class="contact-item">
                <img src="${contact.img}" alt="${contact.name}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=C'">
                <span>${contact.name}</span>
            </li>
        `).join('');
    }
}

function loadPosts() {
    if (!postsFeed) return;

    onPostsChange((posts) => {
        console.log("Posts recebidos do Firestore:", posts.map(p => ({
            content: p.content,
            timestamp: p.timestamp?.toDate ? p.timestamp.toDate().toISOString() : 'Sem timestamp'
        })));
        // Ordenar localmente por timestamp em ordem crescente, se necessário
        posts.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeB - timeA; // Ordem decrescente
        });
        postsFeed.innerHTML = '';
        posts.forEach((post) => {
            const postElement = createPostElement(post);
            postsFeed.appendChild(postElement);
        });
    });
}

function loadStories() {
    if (!db || !document.getElementById('storiesContainer')) return;

    const storiesRef = collection(db, 'stories');
    const storiesQuery = query(storiesRef, orderBy('createdAt', 'desc'));
    onSnapshot(storiesQuery, (snapshot) => {
        const storiesContainer = document.getElementById('storiesContainer');
        storiesContainer.innerHTML = '';
        const userStories = {};
        snapshot.forEach((doc) => {
            const story = doc.data();
            if (!userStories[story.authorId]) {
                userStories[story.authorId] = [];
            }
            if (userStories[story.authorId].length < 3) {
                userStories[story.authorId].push(story);
                const storyElement = document.createElement('div');
                storyElement.className = 'story-item';
                storyElement.innerHTML = `
                    <img src="${story.imageURL || 'https://placehold.co/60x60?text=S'}" alt="Story" onerror="this.src='https://placehold.co/60x60?text=S'">
                    <span>${story.authorName}</span>
                `;
                storiesContainer.appendChild(storyElement);
            }
        });
    });
}

function init() {
    loadContacts();
    loadPosts();
    loadStories();
    if (liveBtn) liveBtn.addEventListener('click', () => {
        alert("Funcionalidade de Live ainda não implementada!");
    });
    setupEventListeners();
}

const mediaModal = document.createElement('div');
mediaModal.className = 'media-modal';

function openMediaSelector() {
    mediaModal.innerHTML = `
        <div class="media-modal-content">
            <div class="media-modal-header">
                <h3>Adicionar Mídia ao Post</h3>
                <span class="close-media-modal">&times;</span>
            </div>
            <div class="media-options">
                <div class="media-option" data-type="image">
                    <i class="fas fa-image"></i>
                    <h4>Imagem</h4>
                    <p>Carregar do seu computador ou link.</p>
                </div>
                <div class="media-option" data-type="video">
                    <i class="fas fa-video"></i>
                    <h4>Vídeo</h4>
                    <p>Carregar arquivo ou URL.</p>
                </div>
                <div class="media-option" data-type="link">
                    <i class="fas fa-link"></i>
                    <h4>Link</h4>
                    <p>Adicionar um link com prévia.</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(mediaModal);
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
                <label for="imageFileInput" class="image-option" data-type="file">
                    <i class="fas fa-upload"></i>
                    <h4>Carregar Arquivo</h4>
                    <input type="file" id="imageFileInput" accept="image/*" style="display: none;">
                </label>
                <div class="image-option" id="imageLinkOption">
                    <i class="fas fa-link"></i>
                    <h4>URL da Imagem</h4>
                </div>
                <div class="image-option" id="googleImagesOption">
                    <i class="fab fa-google"></i>
                    <h4>Pesquisar Google</h4>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(imageModal);
    setupImageModalEvents(imageModal);
}

function setupImageModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-image-modal');
    const fileInput = modal.querySelector('#imageFileInput');
    const imageLink = modal.querySelector('#imageLinkOption');
    const googleImages = modal.querySelector('#googleImagesOption');

    closeBtn.addEventListener('click', () => modal.remove());

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            const uploadResult = await handleMediaUpload(file, 'image');
            if (uploadResult.success) {
                createNewPost('Nova imagem postada.', 'image', uploadResult.url);
            } else {
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = 'Erro no upload: ' + uploadResult.error;
                    errorMessage.style.display = 'block';
                    setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
                } else {
                    alert('Erro no upload: ' + uploadResult.error);
                }
            }
            modal.remove();
        }
    });

    googleImages.addEventListener('click', function() {
        alert('Funcionalidade do Google Imagens será implementada em breve!');
    });

    imageLink.addEventListener('click', function() {
        const url = prompt('Digite a URL da imagem:');
        if (url && url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            createNewPost('Nova imagem postada via link.', 'image', url);
            modal.remove();
        } else {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, insira uma URL válida de imagem (jpg, png, gif, webp)';
                errorMessage.style.display = 'block';
                setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
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
                <label for="videoFileInput" class="video-option" data-type="file">
                    <i class="fas fa-upload"></i>
                    <h4>Carregar Arquivo</h4>
                    <input type="file" id="videoFileInput" accept="video/*" style="display: none;">
                </label>
                <div class="video-option" id="videoLinkOption">
                    <i class="fas fa-link"></i>
                    <h4>URL do Vídeo</h4>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(videoModal);
    setupVideoModalEvents(videoModal);
}

function setupVideoModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-video-modal');
    const fileInput = modal.querySelector('#videoFileInput');
    const videoLink = document.getElementById('videoLinkOption');

    closeBtn.addEventListener('click', () => modal.remove());

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            const uploadResult = await handleMediaUpload(file, 'video');
            if (uploadResult.success) {
                createNewPost('Novo vídeo postado.', 'video', uploadResult.url);
            } else {
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = 'Erro no upload: ' + uploadResult.error;
                    errorMessage.style.display = 'block';
                    setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
                } else {
                    alert('Erro no upload: ' + uploadResult.error);
                }
            }
            modal.remove();
        }
    });

    videoLink.addEventListener('click', function() {
        const url = prompt('Digite a URL do vídeo:');
        if (url && url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
            createNewPost('Novo vídeo postado via link.', 'video', url);
            modal.remove();
        } else {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, insira uma URL válida de vídeo (mp4, webm, ogg, avi, mov)';
                errorMessage.style.display = 'block';
                setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
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

function openLinkSelector() {
    const linkModal = document.createElement('div');
    linkModal.className = 'link-modal';
    linkModal.innerHTML = `
        <div class="link-modal-content">
            <div class="link-modal-header">
                <h3>Adicionar Link</h3>
                <span class="close-link-modal">&times;</span>
            </div>
            <div style="padding: 20px;">
                <input type="text" id="linkInput" class="link-input" placeholder="Digite a URL do link (ex: https://www.google.com)">
                <button id="previewBtn" class="post-btn" style="width: 100%; margin-top: 10px;">Pré-visualizar</button>
                <div id="previewContainer" class="preview-container"></div>
                <button id="postLinkBtn" class="post-btn" style="width: 100%; margin-top: 15px; background-color: #00a400;">Publicar Link</button>
            </div>
        </div>
    `;
    document.body.appendChild(linkModal);
    setupLinkModalEvents(linkModal);
}

function setupLinkModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-link-modal');
    const linkInput = modal.querySelector('#linkInput');
    const previewBtn = modal.querySelector('#previewBtn');
    const postLinkBtn = modal.querySelector('#postLinkBtn');
    const previewContainer = modal.querySelector('#previewContainer');

    closeBtn.addEventListener('click', () => modal.remove());

    previewBtn.addEventListener('click', async function() {
        const url = linkInput.value;
        if (url) {
            const preview = await createLinkPreview(url);
            previewContainer.innerHTML = `
                <p>Pré-visualização:</p>
                <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
                    <h4>${preview.title}</h4>
                    <p>${preview.description}</p>
                    <img src="${preview.image}" alt="Link Preview" onerror="this.src='https://placehold.co/150x100?text=Preview+Error'">
                </div>
            `;
        }
    });

    postLinkBtn.addEventListener('click', async function() {
        const url = linkInput.value;
        if (url) {
            const preview = await createLinkPreview(url);
            createNewPost(`Confira este link: ${url}`, 'link', null, preview);
            modal.remove();
        } else {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, insira uma URL válida.';
                errorMessage.style.display = 'block';
                setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
            } else {
                alert('Por favor, insira uma URL válida.');
            }
        }
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function openFeelingSelector() {
    if (feelingModal) {
        feelingModal.style.display = 'block';
    }
}

function setupEventListeners() {
    if (photoBtn) {
        photoBtn.addEventListener('click', () => {
            imageUploadInput.click(); // Abre o seletor de arquivos
        });
    }

    if (feelingBtn) feelingBtn.addEventListener('click', function() {
        openFeelingSelector();
    });

    if (closeModal) closeModal.addEventListener('click', function() {
        if (feelingModal) feelingModal.style.display = 'none';
    });

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && currentUserId) {
                const uploadResult = await handleMediaUpload(file, 'image');
                if (uploadResult.success) {
                    createNewPost('Nova imagem postada.', 'image', uploadResult.url);
                } else {
                    const errorMessage = document.getElementById('errorMessage');
                    if (errorMessage) {
                        errorMessage.textContent = 'Erro no upload: ' + uploadResult.error;
                        errorMessage.style.display = 'block';
                        setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
                    } else {
                        alert('Erro no upload: ' + uploadResult.error);
                    }
                }
                imageUploadInput.value = ''; // Limpa o input
            }
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === feelingModal) {
            if (feelingModal) feelingModal.style.display = 'none';
        }
    });

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

    if (messagesBtn) messagesBtn.addEventListener('click', function() {
        window.location.href = 'mensagens.html';
    });

    if (postText) postText.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
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

document.addEventListener('DOMContentLoaded', function() {
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
    imageUploadInput = document.getElementById('imageUploadInput');

    onAuthStateChange(async (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("Firebase: Usuário logado:", currentUserId);

            const defaultAvatar = 'https://placehold.co/50x50?text=AV';
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userNameSpan) {
                        userNameSpan.textContent = userData.fullName || userData.email || 'Usuário IfSpace';
                    }
                    if (profileImage && userData.profilePictureUrl) {
                        profileImage.src = userData.profilePictureUrl;
                    } else if (profileImage) {
                        profileImage.src = defaultAvatar;
                    }
                } else {
                    if (userNameSpan) userNameSpan.textContent = 'Usuário sem perfil';
                    if (profileImage) profileImage.src = defaultAvatar;
                }
            } catch (error) {
                console.error("Firebase: Erro ao buscar dados do usuário:", error);
                if (userNameSpan) userNameSpan.textContent = 'Erro de Permissão';
                if (profileImage) profileImage.src = defaultAvatar;
            }

            init();

            if (logoutButton) {
                logoutButton.addEventListener('click', async () => {
                    try {
                        await auth.signOut();
                        console.log("Firebase: Usuário deslogado com sucesso.");
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error("Firebase: Erro ao fazer logout:", error);
                        const errorMessage = document.getElementById('errorMessage');
                        if (errorMessage) {
                            errorMessage.textContent = 'Erro ao fazer logout: ' + error.message;
                            errorMessage.style.display = 'block';
                            setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
                        } else {
                            alert('Erro ao fazer logout: ' + error.message);
                        }
                    }
                });
            }
        } else {
            console.log("Firebase: Nenhum usuário logado. Redirecionando para index.html");
            window.location.href = 'index.html';
        }
    });
});