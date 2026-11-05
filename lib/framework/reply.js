// lib/framework/reply.js
// Generic Telegram reply payload builder helpers
export function buildReplyRequest(update, chatMessage, text, replyToMessage) {
const chatId = chatMessage.chat.id;
const messageId = replyToMessage === null ? null : (replyToMessage || chatMessage).message_id;
const guestQueryId = chatMessage.guest_query_id || update.guest_message?.guest_query_id;
const businessConnectionId = update.business_message?.business_connection_id;

if (guestQueryId) {
return { method: 'answerGuestQuery', payload: { guest_query_id: guestQueryId, result: { type: 'article', id: `reply_${messageId}_${Date.now()}`, title: 'Response', input_message_content: { message_text: text, parse_mode: 'MarkdownV2', disable_web_page_preview: true } } } };
}

// --- ИЗМЕНЕНИЕ: Перенаправляем ответ владельцу, если это бизнес-сообщение ---
let finalChatId = chatId;
let finalBusinessConnectionId = businessConnectionId;

if (businessConnectionId && chatMessage.business_owner_id) {
    // Вместо чата с клиентом отправляем в личный чат владельца
    finalChatId = chatMessage.business_owner_id;
    // Убираем business_connection_id, чтобы сообщение пришло от имени бота, а не от вашего имени
    finalBusinessConnectionId = undefined; 
    // Также сбрасываем reply_to_message_id, так как исходного сообщения в этом чате нет
    replyToMessage = null; 
}
// -------------------------------------------------------------------------

const payload = { chat_id: finalChatId, text, parse_mode: 'MarkdownV2', disable_web_page_preview: true };
if (replyToMessage !== null) { payload.reply_to_message_id = (replyToMessage || chatMessage).message_id; }
if (finalBusinessConnectionId) { payload.business_connection_id = finalBusinessConnectionId; }
return { method: 'sendMessage', payload };
}
