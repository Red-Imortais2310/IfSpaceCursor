// scripts/feed.js
console.log("-> feed.js starting execution.");

import { auth, db, storage, onAuthStateChange, savePostToFirebase, onPostsChange } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
// CORREÇÃO CRÍTICA 1: Adicionar getDocs para buscar a lista de usuários no Firestore.
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, arrayUnion, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Variáveis do DOM e estado
let liveBtn, photoBtn, feelingBtn, feelingModal, closeModal, emojisGrid, postsFeed, postText, messagesBtn, contactsList, userNameSpan, profileImage, logoutButton, mainContentArea, imageUploadInput;
let currentUserId = null;

// REMOÇÃO 1: O array 'exampleContacts' foi removido para usar os dados do Firestore.

// Funções auxiliares (mantidas)
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
    if (!url) return {
        title: "Link Inválido",
        description: "Por favor, insira uma URL válida.",
        image: 'https://placehold.co/150x100?text=Preview+Error'
    };

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[4]) {
        const videoId = match[4];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return {
            title: "Vídeo do YouTube",
            description: `Assista ao vídeo: ${url.substring(0, 50)}...`,
            image: thumbnailUrl
        };
    }

    console.warn("Link não reconhecido como YouTube. Implementação de backend necessária para outros casos.");
    return {
        title: "Link Externo",
        description: url.substring(0, 50) + '...',
        image: 'https://placehold.co/150x100?text=Preview'
    };
}

// Função createPostElement (Mantida)
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;

    let timeDisplay = post.time || 'Agora';
    if (post.timestamp instanceof Date) {
        timeDisplay = post.timestamp.toLocaleString('pt-BR');
    } else if (post.timestamp && post.timestamp.toDate) {
        timeDisplay = post.timestamp.toDate().toLocaleString('pt-BR');
    }

    const likes = post.likes || 0;
    const comments = post.comments?.length || 0;
    const shares = post.shares || 0; 
    const defaultAvatar = 'https://placehold.co/40x40?text=AV';
    
    // --- LÓGICA DE EXIBIÇÃO DE MÍDIA ORIGINAL ---
    const renderMedia = (p) => {
        if (p.type === 'image' && p.mediaUrl) {
            return `<img src="${p.mediaUrl}" alt="Imagem do post" class="post-image" onerror="this.src='https://placehold.co/400x300?text=Image+Error'">`;
        }
        if (p.type === 'video' && p.mediaUrl) {
             return `
                <div class="post-video">
                    <video controls>
                        <source src="${p.mediaUrl}" type="video/mp4" onerror="this.parentElement.innerHTML='<img src=https://placehold.co/400x300?text=Video+Error>'">
                    </video>
                </div>
            `;
        }
        if (p.type === 'link' && p.preview) {
            return `
                <div class="post-link-preview" onclick="window.open('${p.content}', '_blank')">
                    <img src="${p.preview.image || 'https://placehold.co/150x100?text=Link+Preview'}" alt="Link preview" onerror="this.src='https://placehold.co/150x100?text=Preview+Error'">
                    <h4>${p.preview.title || 'Link sem título'}</h4>
                    <p>${p.preview.description || 'Clique para ver o conteúdo.'}</p>
                </div>
            `;
        }
        return '';
    };

    // Se for um post do tipo 'repost', cria uma estrutura diferente
    if (post.type === 'repost' && post.originalPostContent) {
        
        // Conteúdo do post original aninhado
        const originalContentHtml = `
            <div class="reposted-post-container" data-original-id="${post.originalPostId}">
                <div class="post-header repost-header">
                    <img src="${post.originalPostAvatar || defaultAvatar}" alt="${post.originalPostAuthor}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=A'">
                    <div>
                        <h4>${post.originalPostAuthor || 'Usuário'}</h4>
                        <span>Post Original</span>
                    </div>
                </div>
                <div class="post-content repost-content">
                    <p>${post.originalPostContent || ''}</p>
                    ${renderMedia({ 
                        type: post.originalPostType,
                        mediaUrl: post.originalPostMediaUrl,
                        preview: post.originalPostPreview,
                        content: post.originalPostContent 
                    })}
                </div>
            </div>
        `;
        
        // Estrutura do Repost
        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar || defaultAvatar}" alt="${post.author}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=AV'">
                <div>
                    <h4>${post.author || 'Usuário IfSpace'}</h4>
                    <span class="repost-indicator">Compartilhou o post de ${post.originalPostAuthor || 'Usuário'}</span>
                    <span>${timeDisplay}</span>
                </div>
            </div>
            <div class="post-content">
                ${post.content || ''}
            </div>
            ${originalContentHtml} 
            <div class="post-actions">
                <button class="post-action like-btn" data-post-id="${post.id}">
                    <i class="fas fa-thumbs-up"></i>
                    Curtir (${likes})
                </button>
                <button class="post-action comment-btn" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    Comentar (${comments})
                </button>
                <button class="post-action share-btn" data-post-id="${post.id}">
                    <i class="fas fa-share"></i>
                    Compartilhar (${shares})
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <textarea class="comment-input" placeholder="Digite um comentário..." data-post-id="${post.id}"></textarea>
                <div class="comments-list"></div>
            </div>
        `;
        return postDiv;

    } else {
        // Lógica para posts normais (mantida)
        let mediaContent = renderMedia(post);

        // A CORREÇÃO DE LÓGICA foi feita no event listener, garantindo que post.content seja "" ou o texto digitado.
        // A tag <p> só aparece se post.content tiver valor.
        let textContentHtml = '';
        if (post.content && post.content.trim() !== '') {
             textContentHtml = `<p>${post.content}</p>`;
        }

        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar || defaultAvatar}" alt="${post.author}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=AV'">
                <div>
                    <h4>${post.author || 'Usuário IfSpace'}</h4>
                    <span>${timeDisplay}</span>
                </div>
            </div>
            <div class="post-content">
                ${textContentHtml}
                ${mediaContent}
            </div>
            <div class="post-actions">
                <button class="post-action like-btn" data-post-id="${post.id}">
                    <i class="fas fa-thumbs-up"></i>
                    Curtir (${likes})
                </button>
                <button class="post-action comment-btn" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    Comentar (${comments})
                </button>
                <button class="post-action share-btn" data-post-id="${post.id}">
                    <i class="fas fa-share"></i>
                    Compartilhar (${shares})
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <textarea class="comment-input" placeholder="Digite um comentário..." data-post-id="${post.id}"></textarea>
                <div class="comments-list"></div>
            </div>
        `;
        return postDiv;
    }
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
        content, // AQUI RECEBEMOS O "" ou o texto digitado.
        type,
        mediaUrl,
        preview,
        likes: 0,
        comments: [],
        authorUid: currentUserId,
        timestamp: serverTimestamp()
    };

    try {
        const docRef = await savePostToFirebase(newPostData);
        console.log("Post salvo no Firebase com ID:", docRef.id);
        newPostData.id = docRef.id;
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

// Função addComment (Mantida)
async function addComment(postId, commentText) {
    if (!currentUserId || !commentText.trim()) return;

    const postRef = doc(db, 'posts', postId);
    const userDocRef = doc(db, 'users', currentUserId);
    const userDocSnap = await getDoc(userDocRef);
    const userName = userDocSnap.exists() ? userDocSnap.data().fullName || userDocSnap.data().email || 'Anônimo' : 'Anônimo';

    const commentData = {
        text: commentText,
        authorUid: currentUserId,
        authorName: userName,
        // CORREÇÃO: Substituir serverTimestamp() por new Date()
        timestamp: new Date() 
    };

    await updateDoc(postRef, {
        comments: arrayUnion(commentData)
    });
}

async function toggleLike(postId) {
    if (!currentUserId) return;

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) return;

    const currentLikes = postDoc.data().likes || 0;
    await updateDoc(postRef, {
        likes: currentLikes + 1
    });

    const postElement = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (postElement) {
        postElement.textContent = `Curtir (${currentLikes + 1})`;
    }
}

// Função handleSharePost (Mantida)
async function handleSharePost(postId) {
    if (!currentUserId) return alert('Você precisa estar logado para compartilhar.');

    // 1. Pede o texto e verifica cancelamento
    const shareText = prompt("Adicione um texto para o seu compartilhamento (opcional):");
    if (shareText === null) return; 

    try {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            return alert("Post original não encontrado.");
        }

        const originalPostData = postDoc.data();
        const defaultAvatar = 'https://placehold.co/40x40?text=AV';

        // 2. Incrementa o contador de compartilhamentos no post ORIGINAL
        const currentShares = originalPostData.shares || 0;
        await updateDoc(postRef, {
            shares: currentShares + 1 
        });
        
        // 3. Prepara os dados do NOVO REPOST
        const repostOfId = originalPostData.repostOf || postId; 
        
        const newRepostData = {
            author: userNameSpan ? userNameSpan.textContent : 'Usuário IfSpace',
            avatar: profileImage ? profileImage.src : defaultAvatar,
            content: shareText || '', // Texto adicionado pelo usuário
            type: 'repost', 
            
            // Metadados do Repost
            repostOf: repostOfId,
            originalPostId: postId,
            originalPostAuthor: originalPostData.author,
            originalPostAvatar: originalPostData.avatar, 
            originalPostContent: originalPostData.content, 
            originalPostType: originalPostData.type, 
            originalPostMediaUrl: originalPostData.mediaUrl, 
            originalPostPreview: originalPostData.preview, 

            likes: 0,
            comments: [],
            shares: 0, 
            authorUid: currentUserId,
            timestamp: serverTimestamp()
        };

        // 4. Salva o novo post de Repost
        const docRef = await savePostToFirebase(newRepostData);
        alert("Post compartilhado com sucesso!");

    } catch (error) {
        console.error("Erro ao compartilhar post:", error);
        alert("Erro ao compartilhar o post: " + error.message);
    }
}

// NOVO: Adiciona o listener para cliques nos contatos reais
function setupContactClickListener() {
    if (!contactsList) return;

    contactsList.querySelectorAll('.contact-item-real').forEach(item => {
        item.addEventListener('click', function() {
            const userId = this.dataset.userId;
            const userName = this.dataset.userName;
            
            // REMOVEMOS O ALERT e ADICIONAMOS A LÓGICA REAL:

            // Redireciona para a página de chat, passando o ID do usuário como parâmetro
            window.location.href = `chat.html?friendId=${userId}`; 
            
            // O código anterior FUTURO: window.location.href = `chat.html?user=${userId}`;
            // está agora ativo e corrigido para usar a variável 'userId'
        });
    });
}

// CORREÇÃO 2: loadContacts agora é assíncrona e busca usuários no Firestore
async function loadContacts() {
    // Retorna imediatamente se as dependências não estiverem prontas.
    if (!contactsList || !db || !currentUserId) {
        console.warn("loadContacts: Firestore (db) ou ID do usuário não estão prontos.");
        contactsList.innerHTML = '<li class="contact-item">Aguardando login para carregar contatos...</li>';
        return; 
    }

    try {
        const usersCol = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCol); 
        
        let usersHtml = '';
        let foundUsers = 0;

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            
            // Ignorar o próprio usuário logado
            if (userId === currentUserId) return; 

            const userName = user.fullName || user.email || 'Usuário Desconhecido';
            const userAvatar = user.profilePictureUrl || `https://placehold.co/40x40?text=${userName[0].toUpperCase()}`;
            
            usersHtml += `
                <li class="contact-item contact-item-real" data-user-id="${userId}" data-user-name="${userName}">
                    <img src="${userAvatar}" alt="${userName}" class="profile-img" onerror="this.src='https://placehold.co/40x40?text=C'">
                    <span>${userName}</span>
                </li>
            `;
            foundUsers++;
        });
        
        if (foundUsers > 0) {
            contactsList.innerHTML = usersHtml;
        } else {
            contactsList.innerHTML = '<li class="contact-item">Nenhum outro usuário cadastrado.</li>';
        }

        setupContactClickListener(); // Chama o listener após carregar os contatos
        
    } catch (error) {
        // Loga o erro, mas não trava o restante do script (como loadPosts)
        console.error("Erro ao carregar contatos do Firestore. Verifique suas regras de segurança e a coleção 'users'.", error);
        contactsList.innerHTML = '<li class="contact-item" style="color: red;">Erro ao carregar contatos.</li>';
    }
}

function loadPosts() {
    if (!postsFeed) return;
// ... (restante da função loadPosts mantido)
// ... (omito o restante da função loadPosts para brevidade, mas você deve mantê-la)
    onPostsChange((posts) => {
        console.log("Posts recebidos do Firestore:", posts.map(p => ({
            content: p.content,
            timestamp: p.timestamp?.toDate ? p.timestamp.toDate().toISOString() : 'Sem timestamp'
        })));
        postsFeed.innerHTML = '';
        
        // Se a ordenação não estiver no firebase-config.js, este sort garante a decrescente:
        const sortedPosts = posts.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeB - timeA;
        });

        sortedPosts.forEach((post) => {
            const postElement = createPostElement(post);
            postsFeed.appendChild(postElement);

            const commentsSection = postElement.querySelector(`#comments-${post.id}`);
            if (commentsSection) {
                const commentsList = commentsSection.querySelector('.comments-list');
                const commentInput = commentsSection.querySelector('.comment-input');
                onSnapshot(doc(db, 'posts', post.id), (docSnap) => {
                    const postData = docSnap.data();
                    commentsList.innerHTML = (postData.comments || []).map(comment => `
                        <div class="comment">
                            <strong>${comment.authorName}</strong>: ${comment.text}
                            <span>${comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleString('pt-BR') : 'Agora'}</span>
                        </div>
                    `).join('');

                    if (commentInput) {
                        commentInput.addEventListener('keypress', async (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const commentText = commentInput.value.trim();
                                if (commentText) {
                                    await addComment(post.id, commentText);
                                    commentInput.value = '';
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}

function loadUrgentNotices() {
    const urgentNotices = document.getElementById('urgentNotices');
    if (urgentNotices) {
        urgentNotices.innerHTML = `
            <h2>Avisos Urgentes do Campus</h2>
            <p>Exemplo: Reunião de emergência hoje às 14h no auditório.</p>
        `;
    }
}

function loadAdvertisements() {
    const advertisementSection = document.getElementById('advertisementSection');
    if (advertisementSection) {
        advertisementSection.innerHTML = `
            <h2>Publicidade</h2>
            <p>Exemplo: Anúncio de evento local - clique para mais detalhes.</p>
        `;
    }
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
    // CORREÇÃO: loadContacts é assíncrona, mas não precisa de 'await' aqui.
    // Ela deve ser chamada para iniciar o carregamento.
    loadContacts(); 
    loadPosts();
    loadStories();
    loadUrgentNotices();
    loadAdvertisements();
    if (liveBtn) liveBtn.addEventListener('click', () => {
        alert("Funcionalidade de Live ainda não implementada!");
    });
    setupEventListeners();
}

const mediaModal = document.createElement('div');
mediaModal.className = 'media-modal';

function setupEventListeners() {
    if (photoBtn) {
        photoBtn.addEventListener('click', () => {
            imageUploadInput.click();
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
            
            // 1. CAPTURA O TEXTO ATUAL DO INPUT PRINCIPAL (postText)
            // Se o postText existir, pega seu valor. Se não existir, usa string vazia.
            const postTextContent = postText ? postText.value.trim() : ''; // AQUI CAPTURAMOS O TEXTO ANTES DO UPLOAD

            if (file && currentUserId) {
                const uploadResult = await handleMediaUpload(file, 'image');
                
                if (uploadResult.success) {
                    // 2. Passa o conteúdo de texto capturado
                    createNewPost(postTextContent, 'image', uploadResult.url);
                    
                    // 3. AGORA, SÓ LIMPA O CAMPO DE TEXTO APÓS A POSTAGEM BEM-SUCEDIDA
                    if (postText) {
                        postText.value = '';
                    }
                    
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
                
                // Limpa o input de arquivo (sempre)
                imageUploadInput.value = '';
            }
        });
    }

    // CORREÇÃO: Bloco de escuta para as interações dos posts, incluindo o botão Compartilhar.
    if (postsFeed) {
        postsFeed.addEventListener('click', async (e) => {
            const likeBtn = e.target.closest('.like-btn');
            const commentBtn = e.target.closest('.comment-btn');
            const submitCommentBtn = e.target.closest('.submit-comment');
            const shareBtn = e.target.closest('.share-btn'); 

            if (likeBtn) {
                const postId = likeBtn.dataset.postId;
                await toggleLike(postId);
            }

            if (commentBtn) {
                const postId = commentBtn.dataset.postId;
                const commentsSection = document.getElementById(`comments-${postId}`);
                if (commentsSection) {
                    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                }
            }

            // LÓGICA DE COMPARTILHAMENTO ADICIONADA:
            if (shareBtn) {
                const postId = shareBtn.dataset.postId;
                if (postId) {
                    await handleSharePost(postId);
                }
            }

            if (submitCommentBtn) {
                const postId = submitCommentBtn.dataset.postId;
                const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
                if (commentInput) {
                    const commentText = commentInput.value.trim();
                    if (commentText) {
                        await addComment(postId, commentText);
                        commentInput.value = '';
                    }
                }
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

            // === FUNÇÃO QUE ATUALIZA O FEED E CONTATOS ===
            const atualizarFeed = () => {
                console.log("Atualizando feed automaticamente...");
                loadPosts();        // ← sua função que já recarrega os posts
                loadContacts?.();   // ← atualiza a lista de contatos (se existir)
            };

            // Primeira carga ao entrar na página
            init();
            atualizarFeed();

            // Atualiza automaticamente a cada 2 minutos (120000 ms)
            const intervalo = setInterval(atualizarFeed, 120000);

            // Atualiza quando o usuário volta para a aba (muito útil!)
            document.addEventListener("visibilitychange", () => {
                if (!document.hidden) {
                    console.log("Usuário voltou para a aba → atualizando feed");
                    atualizarFeed();
                }
            });

            // === BOTÃO DE LOGOUT ===
            if (logoutButton) {
                logoutButton.addEventListener('click', async () => {
                    clearInterval(intervalo); // para o temporizador ao sair
                    try {
                        await auth.signOut();
                        console.log("Firebase: Usuário deslogado com sucesso.");
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error("Firebase: Erro ao fazer logout:", error);
                        alert('Erro ao fazer logout: ' + error.message);
                    }
                });
            }

        } else {
            console.log("Firebase: Nenhum usuário logado. Redirecionando para index.html");
            window.location.href = 'index.html';
        }
    });
});