document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    // Chatbot State Machine
    let chatState = "NORMAL";
    // Possible states: "NORMAL", "AWAITING_ID_FOR_BALANCE", "AWAITING_AMOUNT_FOR_TRANSFER"

    // Helper to append a new message
    const addMessage = (content, isUser = false, pill = null) => {
        const msgContainer = document.createElement("div");
        msgContainer.className = `msg-container ${isUser ? "user" : "bot"}`;

        let innerHTML = "";
        if (isUser) {
            innerHTML = `
                <div class="avatar user-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="bubble user-bubble">${content}</div>
            `;
        } else {
            innerHTML = `
                <div class="avatar bot-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="bubble bot-bubble">
                    ${pill ? `<div class="bot-pill">${pill}</div>` : ""}
                    <div>${content}</div>
                </div>
            `;
        }
        msgContainer.innerHTML = innerHTML;
        chatMessages.appendChild(msgContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Helper for typing indicator
    const showTyping = () => {
        const id = "typing-" + Date.now();
        const msgContainer = document.createElement("div");
        msgContainer.className = "msg-container bot";
        msgContainer.id = id;
        msgContainer.innerHTML = `
            <div class="avatar bot-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="bubble bot-bubble">
                <div class="typing"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages.appendChild(msgContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    };

    const removeTyping = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    // Bot Logic (Stateful)
    const generateBotResponse = (userText) => {
        const text = userText.toLowerCase();

        // Check if we are waiting for ID to show balance
        if (chatState === "AWAITING_ID_FOR_BALANCE") {
            chatState = "NORMAL"; // reset state
            if (text.length >= 4) { // mock validation
                return {
                    pill: "Merci <i class='fa-solid fa-check' style='margin-left: 5px;'></i>",
                    text: `Identifiant vérifié. Votre solde actuel est de <strong>3 500,00 MAD</strong>.<br>Souhaitez-vous effectuer une autre opération ?`
                };
            } else {
                return {
                    pill: "Erreur <i class='fa-solid fa-triangle-exclamation' style='margin-left: 5px;'></i>",
                    text: "Identifiant invalide (il faut minimum 4 caractères). Opération annulée."
                };
            }
        }

        // Check if we are waiting for a transfer amount/details
        if (chatState === "AWAITING_AMOUNT_FOR_TRANSFER") {
            chatState = "NORMAL"; // reset state
            return {
                pill: "Virement",
                text: `Votre demande de virement pour "<strong>${userText}</strong>" est prête.<br>Scannez ce QR code sécurisé pour valider votre virement :<br>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=virement-${encodeURIComponent(userText)}" class="qr-code" alt="QR Code Virement">`
            };
        }

        // Intent Recognition for NORMAL state
        if (text.includes("solde") || text.includes("compte") || text.includes("balance") || text.includes("argent")) {
            chatState = "AWAITING_ID_FOR_BALANCE";
            return {
                pill: "Sécurité",
                text: "Pour sécuriser votre accès, veuillez entrer votre identifiant client (numéro) :"
            };
        }

        if (text.includes("virement") || text.includes("transfer") || text.includes("envoyer")) {
            chatState = "AWAITING_AMOUNT_FOR_TRANSFER";
            return {
                pill: "Virement",
                text: "Veuillez entrer le montant et le nom du bénéficiaire (Ex: 500 MAD à Ahmed) :"
            };
        }

        if (text.includes("mot de passe") || text.includes("password") || text.includes("oublié")) {
            return {
                pill: "Sécurité",
                text: `Cliquez sur "Mot de passe oublié".<br>Voici votre lien de réinitialisation sécurisé : <br><a href="#" style="color:var(--user-bubble);font-weight:bold;">https://albaridbank.ma/reset-password</a>`
            };
        }

        if (text.includes("bonjour") || text.includes("salut") || text.includes("hello")) {
            return {
                pill: "Accueil",
                text: "Bonjour ! Comment puis-je vous assister aujourd'hui ? Je peux consulter votre solde ou initier un virement."
            };
        }

        // Fallback response
        return {
            pill: "Assistant",
            text: "Je suis désolé, je ne suis pas certain de comprendre. Essayez de demander 'Quel est mon solde ?' ou bien 'Faire un virement'."
        };
    };

    // User submits a message
    const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Append User Message
        addMessage(text, true);
        chatInput.value = "";

        // 2. Show Bot Typing
        const typingId = showTyping();

        // 3. Process Response
        setTimeout(() => {
            removeTyping(typingId);
            const response = generateBotResponse(text);
            addMessage(response.text, false, response.pill);
        }, 1000 + Math.random() * 800); // realistic delay
    };

    sendBtn.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    // Initial greeting when page loads
    setTimeout(() => {
        addMessage(
            "Bonjour ! Bienvenue sur l'espace d'Amal Assistant, votre agent virtuel bancaire.<br>Comment puis-je vous aider aujourd'hui ?<br>1. <strong>Consulter mon solde</strong><br>2. <strong>Faire un virement</strong><br>3. <strong>Mot de passe oublié</strong>",
            false,
            "Assistant Al Barid"
        );
    }, 600);
});
