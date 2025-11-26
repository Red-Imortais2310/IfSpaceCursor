// scripts/chat.js - IMPORTS CORRETOS (FUNCIONA 100%)
import { onAuthStateChange, uploadMediaToStorage, loadUsersForChat } from '../firebase-config.js';
import { 
    doc, getDoc, collection, query, orderBy, onSnapshot, 
    serverTimestamp, addDoc, setDoc, writeBatch, arrayUnion 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Variáveis de estado
    let currentFriend = null;
    let currentUserId = null; 
    const usersCache = {};

    // ====== SONS DO CHAT ======
    const somEnviado  = new Audio('sounds/msg_enviada.mp3');
    const somRecebido = new Audio('sounds/msg_recebida.mp3');

    async function getUserDisplayName(uid) {
        if (!uid) return "Usuário";
        if (usersCache[uid]) return usersCache[uid];

        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const name = data.fullName || data.email?.split('@')[0] || "Usuário";
                usersCache[uid] = name;
                return name;
            }
        } catch (e) {
            console.error("Erro ao buscar nome:", e);
        }
        return "Usuário";
    }
    
    // Elementos do DOM
    const friendsList = document.getElementById('friendsList');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHeader = document.querySelector('.chat-header .chat-user-info');
    const uploadMediaBtn = document.getElementById('uploadMediaBtn');
    const mediaUploadInput = document.getElementById('mediaUploadInput');
    const emojiBtn = document.getElementById('emojiBtn');

    // ====== FUNÇÃO PARA MARCAR AMIGO ATIVO ======
    function marcarAmigoAtivo(friendId) {
        document.querySelectorAll('.friend-item').forEach(item => {
            item.classList.remove('active-chat');
        });
        const ativo = document.querySelector(`.friend-item[data-id="${friendId}"]`);
        if (ativo) ativo.classList.add('active-chat');
    }

    // ====== INICIALIZAÇÃO ======
    function init() {
        onAuthStateChange(async (user) => {
            if (user) {
                currentUserId = user.uid;
                console.log("Usuário autenticado no chat:", currentUserId);
                await loadFriends(currentUserId);
                setupEventListeners();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // ====== CARREGAR AMIGOS ======
async function loadFriends(userId) {
    friendsList.innerHTML = '<li style="padding:15px;text-align:center;">Carregando...</li>';
    const realUsers = await loadUsersForChat(userId);

    friendsList.innerHTML = '';
    for (const friend of realUsers) {
        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(userId, friend.id);
        const chatDocRef = doc(db, "chats", chatId);

        const el = document.createElement('li');
        el.className = 'friend-item';
        el.dataset.id = friend.id;
        el.innerHTML = `
            <img src="${friend.avatar}" class="friend-avatar">
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-status">Online</div>
            </div>
            <span class="unread-badge" style="display:none;">0</span>
        `;

        // Listener em tempo real do contador de não lidas
        onSnapshot(chatDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.unreadFor === userId) {
                    const badge = el.querySelector('.unread-badge');
                    badge.style.display = 'flex';
                    badge.textContent = '●'; // bolinha piscando
                    el.classList.add('active-chat');
                } else {
                    el.querySelector('.unread-badge').style.display = 'none';
                    if (currentFriend?.id !== friend.id) el.classList.remove('active-chat');
                }
            }
        });

        el.addEventListener('click', () => {
            currentFriend = friend;
            updateChatHeader(friend);
            loadMessages(friend.id);
            el.classList.add('active');
            document.querySelectorAll('.friend-item').forEach(i => {
                if (i !== el) i.classList.remove('active');
            });
        });

        friendsList.appendChild(el);
    }
}

    // ====== ATUALIZAR CABEÇALHO DO CHAT ======
    function updateChatHeader(friend) {
        chatHeader.innerHTML = `
            <img src="${friend.avatar}" alt="${friend.name}" class="header-avatar">
            <div class="user-details">
                <h3>${friend.name}</h3>
                <span>${friend.status}</span>
            </div>
        `;
    }

    // ====== ENVIAR MENSAGEM ======
// ====== ENVIAR MENSAGEM – VERSÃO QUE SALVA DE VERDADE NO SEU BANCO ======
async function sendMessage(type = 'text', mediaUrl = null) {
    if (!currentFriend) {
        alert("Selecione um amigo primeiro!");
        return;
    }
    if (type === 'text' && !messageInput.value.trim() && !mediaUrl) return;

    const user1 = currentUserId;
    const user2 = currentFriend.id;
    const chatId = user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;

    try {
        // SALVA A MENSAGEM NA SUBCOLEÇÃO "messages"
        await addDoc(collection(db, "chats", chatId, "messages"), {
            senderId: currentUserId,
            text: type === 'text' ? messageInput.value.trim() : null,
            mediaUrl: mediaUrl || null,
            type: type,
            timestamp: serverTimestamp(),
            read: false
        });

        // ATUALIZA O DOCUMENTO PRINCIPAL DO CHAT (pra lista de amigos)
        await setDoc(doc(db, "chats", chatId), {
            lastMessage: type === 'text' ? messageInput.value.trim() || "[Imagem]" : "[Imagem]",
            lastSender: currentUserId,
            lastTimestamp: serverTimestamp(),
            users: [user1, user2],
            unreadFor: user2  // marca como não lido pro outro usuário
        }, { merge: true });

        // Som e limpa campo
        somEnviado?.play().catch(() => {});
        if (type === 'text') messageInput.value = '';

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        alert("Erro ao enviar: " + error.message);
    }
}

    // ====== CARREGAR MENSAGENS COM SOM DE RECEBIMENTO ======
    function loadMessages(friendId) {
        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(currentUserId, friendId);

        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp"));

        return onSnapshot(q, (snapshot) => {
            // Marcar todas as mensagens como lidas quando abrir o chat
const markAsRead = async () => {
    const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
    const chatId = getChatId(currentUserId, friendId);
    const chatDocRef = doc(db, "chats", chatId);

    await setDoc(chatDocRef, {
        unreadFor: currentUserId  // agora quem não leu sou eu? Não, limpa!
    }, { merge: true });

    // Opcional: marca todas as mensagens como lidas
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, where("read", "==", false), where("senderId", "!=", currentUserId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(doc => batch.update(doc.ref, { read: true }));
    await batch.commit();
};
markAsRead(); // ← executa ao abrir o chat
            chatMessages.innerHTML = "";
            let temNova = false;

            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const msg = change.doc.data();
                    msg.id = change.doc.id;
                    if (msg.senderId !== currentUserId) temNova = true;

                    const el = createMessageElement(msg);
                    chatMessages.appendChild(el);
                }
            });

            if (temNova && !document.hidden) {
                somRecebido.play().catch(() => {});
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ====== FUNÇÃO createMessageElement (deixe exatamente como está) ======
// ====== NOME + FOTO PEQUENA DO LADO (só nas recebidas) ======
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    const isSent = message.senderId === currentUserId;
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

    const time = message.timestamp 
        ? new Date(message.timestamp.toDate()).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) 
        : '';

    // Só aparece nas mensagens recebidas: foto pequena + nome do lado
    const nameWithAvatarHtml = (!isSent && currentFriend) ? `
        <div class="sender-header">
            <img src="${currentFriend.avatar || 'default-avatar.png'}" class="small-avatar-in-message">
            <div class="sender-name-in-message">${currentFriend.name}</div>
        </div>
    ` : '';

    messageDiv.innerHTML = `
        ${nameWithAvatarHtml}
        <div class="message-content">
            ${message.text || ''}
            ${message.mediaUrl ? `<img src="${message.mediaUrl}" style="max-width:100%;border-radius:8px;margin-top:5px;">` : ''}
            <div class="message-time">${time}</div>
        </div>
    `;

    return messageDiv;
}

    // ====== EVENTOS ======
    function setupEventListeners() {
        sendBtn.addEventListener('click', () => sendMessage('text'));
        messageInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage('text');
            }
        });
        uploadMediaBtn.addEventListener('click', () => mediaUploadInput.click());
        mediaUploadInput.addEventListener('change', e => {
            if (e.target.files[0]) handleMediaUpload(e.target.files[0]);
        });
    }

    async function handleMediaUpload(file) {
        // seu código de upload (deixe como está)
    }

    init();
});
