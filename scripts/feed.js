// scripts/feed.js

console.log("-> feed.js starting execution.");

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

// Posts de exemplo
const samplePosts = [
    {
        author: 'Maria Silva',
        avatar: 'https://via.placeholder.com/40',
        content: 'Acabei de assistir um filme incrível! Recomendo muito! 🎬',
        time: '2 horas atrás',
        likes: 15,
        comments: 3,
        shares: 1
    },
    {
        author: 'João Santos',
        avatar: 'https://via.placeholder.com/40',
        content: 'Dia lindo para um passeio no parque! 🌳',
        time: '4 horas atrás',
        likes: 8,
        comments: 2,
        shares: 0
    },
    {
        author: 'Ana Costa',
        avatar: 'https://via.placeholder.com/40',
        content: 'Nova receita de bolo de chocolate ficou perfeita! 🍰',
        time: '6 horas atrás',
        likes: 22,
        comments: 7,
        shares: 3
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired in feed.js.");

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
    profileImage = document.getElementById('profileImage'); // Elemento para Firebase
    logoutButton = document.getElementById('logoutButton');
    mainContentArea = document.querySelector('.main-content'); // Obtém a referência aqui


    // --- INÍCIO DA LÓGICA DO FIREBASE ---
    window.firebaseOnAuthStateChanged(window.firebaseAuth, async (user) => {
        if (user) {
            // Usuário está logado!
            console.log("Firebase: Usuário logado:", user.uid);
            
            // Buscar dados do usuário no Firestore
            try {
                const userDocRef = window.firebaseFirestoreDoc(window.firebaseFirestore, "users", user.uid);
                const userDocSnap = await window.firebaseFirestoreGetDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log("Firebase: Dados do usuário no Firestore:", userData);
                    if (userNameSpan) {
                        userNameSpan.textContent = `${userData.firstName} ${userData.lastName}`;
                    } else {
                        console.warn("Firebase: Elemento 'userNameSpan' não encontrado para exibir o nome.");
                    }
                    // Lógica para exibir a foto de perfil
                    if (profileImage && userData.profilePictureUrl) {
                        profileImage.src = userData.profilePictureUrl;
                        console.log("Firebase: Foto de perfil carregada:", userData.profilePictureUrl);
                    } else if (profileImage) {
                        profileImage.src = "https://via.placeholder.com/50"; // Fallback se não tiver URL
                        console.warn("Firebase: Nenhuma URL de foto de perfil encontrada para o usuário.");
                    }
                    
                } else {
                    console.warn("Firebase: Nenhum documento encontrado no Firestore para o UID:", user.uid);
                    if (userNameSpan) userNameSpan.textContent = "Usuário sem perfil"; // Placeholder se não encontrar dados
                }
            } catch (error) {
                console.error("Firebase: Erro ao buscar dados do usuário no Firestore:", error);
                if (userNameSpan) userNameSpan.textContent = "Erro ao carregar nome";
            }

            // --- Inicializa o resto da UI do seu aplicativo APÓS o usuário ser confirmado como logado ---
            init(); // Chama a função init() que você já tinha

            // --- Adiciona os botões Admin AQUI, após o usuário estar logado e a UI inicializada ---
            // IMPORTANTE: Esta chamada está AQUI para garantir que os botões só apareçam para usuários logados
            // e que os elementos da UI já estejam prontos.
            addAdminTestButtons(); 

            // Configurar o botão de logout
            if (logoutButton) {
                logoutButton.addEventListener('click', async () => {
                    try {
                        await window.firebaseSignOut(window.firebaseAuth);
                        console.log("Firebase: Usuário deslogado com sucesso.");
                        // O onAuthStateChanged vai detectar a mudança e redirecionar para index.html
                    } catch (error) {
                        console.error("Firebase: Erro ao fazer logout:", error);
                        alert("Erro ao fazer logout. Por favor, tente novamente.");
                    }
                });
            }
            
        } else {
            // Usuário NÃO está logado, redirecionar para a página de login
            console.log("Firebase: Nenhum usuário logado. Redirecionando para index.html");
            window.location.href = 'index.html';
        }
    });
    // --- FIM DA LÓGICA DO FIREBASE ---

}); // Fim do DOMContentLoaded


// --- FUNÇÕES DE SEU APLICATIVO EXISTENTES (fora do DOMContentLoaded para melhor organização) ---

function init() {
    console.log("IfSpace UI: Inicializando componentes...");
    loadContacts();
    loadPosts();
    setupEventListeners();
}

function loadContacts() {
    if (contactsList) {
        contactsList.innerHTML = '';
        contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item'; // Assumindo que você tem CSS para isso
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
        samplePosts.forEach(post => {
            const postElement = createPostElement(post);
            postsFeed.appendChild(postElement);
        });
    } else {
        console.warn("IfSpace UI: Elemento 'postsFeed' não encontrado.");
    }
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
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

function setupEventListeners() {
    // Botão Live
    if (liveBtn) liveBtn.addEventListener('click', function() {
        alert('Funcionalidade de Live em desenvolvimento. Logo estará disponível!');
    });

    // Botão Foto/Imagem
    if (photoBtn) photoBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                alert(`Imagem selecionada: ${file.name}`);
                // Aqui se implementaria a lógica para subir a imagem
            }
        };
        input.click();
    });

    // Botão Sentimento
    if (feelingBtn) feelingBtn.addEventListener('click', function() {
        if (feelingModal) feelingModal.style.display = 'block';
    });

    // Cerrar modal de Sentimento
    if (closeModal) closeModal.addEventListener('click', function() {
        if (feelingModal) feelingModal.style.display = 'none';
    });

    // Cerrar modal de Sentimento ao fazer click fora
    window.addEventListener('click', function(e) {
        if (e.target === feelingModal) {
            if (feelingModal) feelingModal.style.display = 'none';
        }
    });

    // Selecionar emoji
    if (emojisGrid) emojisGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('emoji-item')) { // Use classList.contains para verificar a classe
            const emoji = e.target.dataset.emoji; // Assumindo que você tem um data-emoji nos seus emojis
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

    // Criar novo post (com keypress)
    if (postText) postText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            createNewPost(this.value);
            this.value = '';
        }
    });

    // Funcionalidade de Stories
    const storyItems = document.querySelectorAll('.story-item'); // Garanta que 'story-item' existe no HTML
    storyItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('create-story')) {
                openStoryCreator();
            } else {
                alert('Ver Story em desenvolvimento!');
            }
        });
    });
}

function createNewPost(content) {
    const newPost = {
        author: userNameSpan ? userNameSpan.textContent : 'Usuário IfSpace', // Usa o nome carregado do Firebase
        avatar: 'https://via.placeholder.com/40', // Placeholder, idealmente viria do Firebase
        content: content,
        time: 'Agora',
        likes: 0,
        comments: 0,
        shares: 0
    };

    if (postsFeed) {
        const postElement = createPostElement(newPost);
        postsFeed.insertBefore(postElement, postsFeed.firstChild);
    }
}

// Função para abrir o criador de stories (e suas funções auxiliares)
function openStoryCreator() {
    const storyModal = document.createElement('div');
    storyModal.className = 'story-modal';
    storyModal.innerHTML = `
        <div class="story-modal-content">
            <div class="story-modal-header">
                <h3>Criar Story</h3>
                <span class="close-story-modal">&times;</span>
            </div>
            <div class="story-creation-area">
                <div class="story-preview" id="storyPreview">
                    <div class="story-placeholder">
                        <i class="fas fa-camera"></i>
                        <p>Adicione uma foto para seu story</p>
                    </div>
                </div>
                <div class="story-controls">
                    <div class="story-inputs">
                        <label class="story-input-btn">
                            <i class="fas fa-image"></i>
                            Adicionar Foto
                            <input type="file" id="storyPhoto" accept="image/*" style="display: none;">
                        </label>
                        <label class="story-input-btn">
                            <i class="fas fa-microphone"></i>
                            Adicionar Áudio
                            <input type="file" id="storyAudio" accept="audio/*" style="display: none;">
                        </label>
                    </div>
                    <div class="story-actions">
                        <button class="story-btn cancel-btn" id="cancelStory">Cancelar</button>
                        <button class="story-btn publish-btn" id="publishStory" disabled>Publicar Story</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Adicionar estilos para o modal (incluído no JS para simplificar)
    const style = document.createElement('style');
    style.textContent = `
        .story-modal {
            display: flex; position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); align-items: center; justify-content: center;
        }
        .story-modal-content {
            background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto;
        }
        .story-modal-header {
            display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e1e1e1;
        }
        .story-modal-header h3 {
            color: #00a400; margin: 0;
        }
        .close-story-modal {
            font-size: 24px; cursor: pointer; color: #666;
        }
        .story-creation-area {
            padding: 20px;
        }
        .story-preview {
            width: 100%; height: 300px; border: 2px dashed #00a400; border-radius: 8px; display: flex;
            align-items: center; justify-content: center; margin-bottom: 20px; overflow: hidden; position: relative;
        }
        .story-placeholder {
            text-align: center; color: #666;
        }
        .story-placeholder i {
            font-size: 3rem; color: #00a400; margin-bottom: 10px;
        }
        .story-preview img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .story-controls {
            display: flex; flex-direction: column; gap: 15px;
        }
        .story-inputs {
            display: flex; gap: 10px; flex-wrap: wrap;
        }
        .story-input-btn {
            flex: 1; min-width: 120px; display: flex; flex-direction: column; align-items: center;
            gap: 8px; padding: 15px; border: 2px solid #e1e1e1; border-radius: 8px; cursor: pointer;
            transition: all 0.3s ease; background: #f8f9fa;
        }
        .story-input-btn:hover {
            border-color: #00a400; background: #f0f2f5;
        }
        .story-input-btn i {
            font-size: 1.5rem; color: #00a400;
        }
        .story-actions {
            display: flex; gap: 10px; justify-content: flex-end;
        }
        .story-btn {
            padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;
            font-weight: bold; transition: all 0.3s ease;
        }
        .cancel-btn {
            background: #f8f9fa; color: #666; border: 1px solid #e1e1e1;
        }
        .cancel-btn:hover {
            background: #e9ecef;
        }
        .publish-btn {
            background: #00a400; color: white;
        }
        .publish-btn:hover:not(:disabled) {
            background: #008a00;
        }
        .publish-btn:disabled {
            background: #ccc; cursor: not-allowed;
        }
        .audio-player {
            width: 100%; margin-top: 10px; background: #f8f9fa; border-radius: 4px;
        }
        .audio-controls {
            display: flex; align-items: center; gap: 10px; margin-top: 10px;
            padding: 8px; background: #f0f2f5; border-radius: 4px;
        }
        .audio-info {
            flex: 1; font-size: 12px; color: #666; font-weight: 500;
        }
        .remove-audio {
            background: #dc3545; color: white; border: none; border-radius: 4px;
            padding: 5px 10px; cursor: pointer; font-size: 12px; transition: background-color 0.3s ease;
        }
        .remove-audio:hover {
            background: #c82333;
        }
        @media (max-width: 480px) {
            .story-modal-content {
                width: 95%; margin: 10px;
            }
            .story-inputs {
                flex-direction: column;
            }
            .story-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(storyModal);

    setupStoryModalEvents(storyModal);
}

function setupStoryModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-story-modal');
    const cancelBtn = modal.querySelector('#cancelStory');
    const publishBtn = modal.querySelector('#publishStory');
    const photoInput = modal.querySelector('#storyPhoto');
    const audioInput = modal.querySelector('#storyAudio');
    const preview = modal.querySelector('#storyPreview');

    let selectedPhoto = null;
    let selectedAudio = null;

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedPhoto = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Story Preview">`;
                updatePublishButton();
            };
            reader.readAsDataURL(file);
        }
    });

    audioInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedAudio = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                const audioUrl = e.target.result;
                const audioElement = document.createElement('audio');
                audioElement.src = audioUrl;
                audioElement.controls = true;
                audioElement.className = 'audio-player';
                
                const audioControls = document.createElement('div');
                audioControls.className = 'audio-controls';
                audioControls.innerHTML = `
                    <div class="audio-info">Áudio: ${file.name}</div>
                    <button class="remove-audio" type="button">Remover</button>
                `;
                
                preview.querySelectorAll('.audio-player, .audio-controls').forEach(el => el.remove());
                preview.appendChild(audioElement);
                preview.appendChild(audioControls);

                audioControls.querySelector('.remove-audio').addEventListener('click', () => {
                    selectedAudio = null;
                    audioElement.remove();
                    audioControls.remove();
                    // Mostra o placeholder se não houver foto também
                    if (!selectedPhoto) {
                        preview.innerHTML = `<div class="story-placeholder"><i class="fas fa-camera"></i><p>Adicione uma foto para seu story</p></div>`;
                    }
                    updatePublishButton();
                });

                // Esconde placeholder se houver foto ou áudio
                const placeholder = preview.querySelector('.story-placeholder');
                if (placeholder) placeholder.style.display = 'none';
                updatePublishButton();
            };
            reader.readAsDataURL(file);
        }
    });

    function updatePublishButton() {
        publishBtn.disabled = !(selectedPhoto || selectedAudio); // Pode publicar com foto ou áudio
    }

    publishBtn.addEventListener('click', function() {
        if (!selectedPhoto && !selectedAudio) {
            alert('Por favor, selecione uma foto ou áudio para seu story');
            return;
        }

        publishBtn.textContent = 'Publicando...';
        publishBtn.disabled = true;

        setTimeout(() => {
            alert('Story publicado com sucesso!');
            modal.remove();
            
            console.log('Story publicado:', {
                photo: selectedPhoto ? selectedPhoto.name : 'N/A',
                audio: selectedAudio ? selectedAudio.name : 'N/A'
            });
        }, 1500);
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


// --- FUNÇÃO PARA ADICIONAR OS BOTÕES ADMIN DE TESTE ---
function addAdminTestButtons() {
    console.log("IfSpace UI: Adicionando botões admin de teste...");
    const adminButtonsContainer = document.createElement('div');
    adminButtonsContainer.style.marginTop = '20px';
    adminButtonsContainer.style.borderTop = '1px solid #eee';
    adminButtonsContainer.style.paddingTop = '15px';
    adminButtonsContainer.style.textAlign = 'center';
    adminButtonsContainer.innerHTML = '<h3>Ferramentas Admin (Teste)</h3>';
    
    // Adiciona o container de botões no mainContentArea (ou no body como fallback)
    // Assegura que mainContentArea foi inicializado antes
    if (mainContentArea) { 
        mainContentArea.appendChild(adminButtonsContainer);
    } else {
        document.body.appendChild(adminButtonsContainer); 
    }


    // --- Botão para Listar Usuários ---
    const listUsersButton = document.createElement('button');
    listUsersButton.textContent = 'Listar Todos os Usuários';
    listUsersButton.style.padding = '10px 15px';
    listUsersButton.style.margin = '5px';
    listUsersButton.style.backgroundColor = '#4CAF50';
    listUsersButton.style.color = 'white';
    listUsersButton.style.border = 'none';
    listUsersButton.style.borderRadius = '5px';
    listUsersButton.style.cursor = 'pointer';
    adminButtonsContainer.appendChild(listUsersButton);

 listUsersButton.addEventListener('click', async () => {
    alert('Buscando usuários... Verifique o console para a lista completa.');
    const listUsersCallable = window.firebaseHttpsCallable(window.firebaseFunctions, 'listUsers');
    try {
        const result = await listUsersCallable();
        
        // --- NOVA LINHA DE DEBUG NO FRONTEND ---
        console.log('Resposta completa da Cloud Function:', result.data);
        // ---------------------------------------

        if (result.data.status === 'error') {
            console.error('Erro retornado pela Cloud Function:', result.data.message);
            console.error('Detalhes de debug do Auth:', result.data.debugContextAuth); // ISSO VAI NOS DIZER O VALOR DE CONTEXT.AUTH!
            alert(`Erro ao listar usuários: ${result.data.message}. Detalhes no console.`);
        } else {
            console.log('--- LISTA DE USUÁRIOS ---');
            console.log('Total:', result.data.count);
            result.data.users.forEach(user => {
                console.log(`UID: ${user.uid}, Email: ${user.email}, Nome: ${user.displayName || 'N/A'}, Foto: ${user.photoURL || 'N/A'}`);
            });
            alert(`Total de ${result.data.count} usuários encontrados. Veja no console para detalhes.`);
        }
    } catch (error) {
        console.error('Erro inesperado ao chamar Cloud Function listUsers:', error);
        alert(`Erro inesperado ao listar usuários: ${error.message}. Verifique o console.`);
    }
});


    // --- Botão para Excluir Usuário (USE COM CAUTELA!) ---
    const deleteUserButton = document.createElement('button');
    deleteUserButton.textContent = 'Excluir Usuário por UID (Admin)';
    deleteUserButton.style.padding = '10px 15px';
    deleteUserButton.style.margin = '5px';
    deleteUserButton.style.backgroundColor = '#f44336';
    deleteUserButton.style.color = 'white';
    deleteUserButton.style.border = 'none';
    deleteUserButton.style.borderRadius = '5px';
    deleteUserButton.style.cursor = 'pointer';
    adminButtonsContainer.appendChild(deleteUserButton);

    deleteUserButton.addEventListener('click', async () => {
        const confirmationPrompt = prompt("Digite 'admin' para confirmar que você entende os riscos da exclusão de usuários:");

        if (confirmationPrompt && confirmationPrompt.toLowerCase() === 'admin') {
            const uidParaExcluir = prompt("OK. Agora, digite o UID REAL do usuário que você deseja excluir:");
            if (!uidParaExcluir) {
                alert("Exclusão cancelada. Nenhum UID fornecido.");
                return;
            }
            if (!confirm(`TEM CERTEZA ABSOLUTA que deseja excluir o usuário com UID: ${uidParaExcluir}? ESTA AÇÃO É IRREVERSÍVEL e removerá o usuário do Auth e do Firestore!`)) {
                alert("Exclusão cancelada.");
                return;
            }

            const deleteSingleUserCallable = window.firebaseHttpsCallable(window.firebaseFunctions, 'deleteSingleUser');
            try {
                const result = await deleteSingleUserCallable({ uid: uidParaExcluir });
                console.log('Resultado da exclusão:', result.data);
                alert(`Exclusão: ${result.data.message}`);
                window.location.reload();
            } catch (error) {
                console.error('Erro ao chamar Cloud Function deleteSingleUser:', error);
                alert(`Erro ao excluir usuário: ${error.message}. Verifique o console.`);
            }
        } else if (confirmationPrompt) {
            alert("A confirmação 'admin' não foi digitada corretamente. Exclusão cancelada por segurança.");
        } else {
            alert("Exclusão cancelada.");
        }
    });
}

