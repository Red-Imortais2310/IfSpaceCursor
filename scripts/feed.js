document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const liveBtn = document.getElementById('liveBtn');
    const photoBtn = document.getElementById('photoBtn');
    const feelingBtn = document.getElementById('feelingBtn');
    const feelingModal = document.getElementById('feelingModal');
    const closeModal = document.querySelector('.close');
    const emojisGrid = document.querySelector('.emojis-grid');
    const postsFeed = document.getElementById('postsFeed');
    const postText = document.getElementById('postText');
    const messagesBtn = document.getElementById('messagesBtn');
    const contactsList = document.getElementById('contactsList');

    // Datos de ejemplo para contactos (15 nombres)
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
        { name: 'Diego Martins', status: 'Há 20 min', avatar: 'https://via.placeholder.com/35' },
        { name: 'Patricia Gomes', status: 'Online', avatar: 'https://via.placeholder.com/35' },
        { name: 'Marcos Silva', status: 'Há 30 min', avatar: 'https://via.placeholder.com/35' },
        { name: 'Camila Dias', status: 'Online', avatar: 'https://via.placeholder.com/35' },
        { name: 'Thiago Costa', status: 'Há 1 hora', avatar: 'https://via.placeholder.com/35' },
        { name: 'Larissa Santos', status: 'Online', avatar: 'https://via.placeholder.com/35' }
    ];

    // Posts de ejemplo
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

    // Inicializar la página
    init();

    function init() {
        loadContacts();
        loadPosts();
        setupEventListeners();
    }

    function loadContacts() {
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
    }

    function loadPosts() {
        postsFeed.innerHTML = '';
        samplePosts.forEach(post => {
            const postElement = createPostElement(post);
            postsFeed.appendChild(postElement);
        });
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
        // Botón Live
        liveBtn.addEventListener('click', function() {
            alert('Funcionalidad de Live en desarrollo. Pronto estará disponible!');
        });

        // Botón Foto/Imagen
        photoBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    alert(`Imagen seleccionada: ${file.name}`);
                    // Aquí se implementaría la lógica para subir la imagen
                }
            };
            input.click();
        });

        // Botón Sentimento
        feelingBtn.addEventListener('click', function() {
            feelingModal.style.display = 'block';
        });

        // Cerrar modal
        closeModal.addEventListener('click', function() {
            feelingModal.style.display = 'none';
        });

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', function(e) {
            if (e.target === feelingModal) {
                feelingModal.style.display = 'none';
            }
        });

        // Seleccionar emoji
        emojisGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('emoji-item')) {
                const emoji = e.target.dataset.emoji;
                const text = postText.value;
                postText.value = text + ` ${emoji}`;
                feelingModal.style.display = 'none';
            }
        });

        // Botón de mensajes
        messagesBtn.addEventListener('click', function() {
            window.location.href = 'mensagens.html';
        });

        // Crear nuevo post
        postText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                createNewPost(this.value);
                this.value = '';
            }
        });
    }

    function createNewPost(content) {
        const newPost = {
            author: 'João Silva',
            avatar: 'https://via.placeholder.com/40',
            content: content,
            time: 'Agora',
            likes: 0,
            comments: 0,
            shares: 0
        };

        const postElement = createPostElement(newPost);
        postsFeed.insertBefore(postElement, postsFeed.firstChild);
    }

    // Funcionalidade de Stories
    const storyItems = document.querySelectorAll('.story-item');
    storyItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('create-story')) {
                openStoryCreator();
            } else {
                alert('Ver Story em desenvolvimento!');
            }
        });
    });

    // Função para abrir o criador de stories
    function openStoryCreator() {
        // Criar modal para criar story
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

        // Adicionar estilos para o modal
        const style = document.createElement('style');
        style.textContent = `
            .story-modal {
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
            .story-modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .story-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e1e1e1;
            }
            .story-modal-header h3 {
                color: #00a400;
                margin: 0;
            }
            .close-story-modal {
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .story-creation-area {
                padding: 20px;
            }
            .story-preview {
                width: 100%;
                height: 300px;
                border: 2px dashed #00a400;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                overflow: hidden;
                position: relative;
            }
            .story-placeholder {
                text-align: center;
                color: #666;
            }
            .story-placeholder i {
                font-size: 3rem;
                color: #00a400;
                margin-bottom: 10px;
            }
            .story-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .story-controls {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .story-inputs {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .story-input-btn {
                flex: 1;
                min-width: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 15px;
                border: 2px solid #e1e1e1;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: #f8f9fa;
            }
            .story-input-btn:hover {
                border-color: #00a400;
                background: #f0f2f5;
            }
            .story-input-btn i {
                font-size: 1.5rem;
                color: #00a400;
            }
            .story-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .story-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .cancel-btn {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #e1e1e1;
            }
            .cancel-btn:hover {
                background: #e9ecef;
            }
            .publish-btn {
                background: #00a400;
                color: white;
            }
            .publish-btn:hover:not(:disabled) {
                background: #008a00;
            }
            .publish-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .audio-player {
                width: 100%;
                margin-top: 10px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .audio-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                padding: 8px;
                background: #f0f2f5;
                border-radius: 4px;
            }
            .audio-info {
                flex: 1;
                font-size: 12px;
                color: #666;
                font-weight: 500;
            }
            .remove-audio {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.3s ease;
            }
            .remove-audio:hover {
                background: #c82333;
            }
            @media (max-width: 480px) {
                .story-modal-content {
                    width: 95%;
                    margin: 10px;
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

        // Event listeners para o modal de story
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

        // Fechar modal
        closeBtn.addEventListener('click', () => modal.remove());
        cancelBtn.addEventListener('click', () => modal.remove());

        // Selecionar foto
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

        // Selecionar áudio
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
                    audioElement.style.width = '100%';
                    audioElement.style.marginTop = '10px';
                    
                    const audioControls = document.createElement('div');
                    audioControls.className = 'audio-controls';
                    audioControls.innerHTML = `
                        <div class="audio-info">Áudio: ${file.name}</div>
                        <button class="remove-audio" onclick="removeAudio()">Remover</button>
                    `;
                    
                    preview.appendChild(audioElement);
                    preview.appendChild(audioControls);
                    updatePublishButton();
                };
                reader.readAsDataURL(file);
            }
        });

        // Função para remover áudio
        window.removeAudio = function() {
            selectedAudio = null;
            const audioElement = preview.querySelector('.audio-player');
            const audioControls = preview.querySelector('.audio-controls');
            if (audioElement) audioElement.remove();
            if (audioControls) audioControls.remove();
            updatePublishButton();
        };

        // Atualizar botão de publicar
        function updatePublishButton() {
            publishBtn.disabled = !selectedPhoto;
        }

        // Publicar story
        publishBtn.addEventListener('click', function() {
            if (!selectedPhoto) {
                alert('Por favor, selecione uma foto para seu story');
                return;
            }

            // Simular publicação
            publishBtn.textContent = 'Publicando...';
            publishBtn.disabled = true;

            setTimeout(() => {
                alert('Story publicado com sucesso!');
                modal.remove();
                
                // Aqui você pode adicionar a lógica para salvar no Firebase
                console.log('Story publicado:', {
                    photo: selectedPhoto,
                    audio: selectedAudio
                });
            }, 1500);
        });

        // Fechar ao clicar fora do modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
});
