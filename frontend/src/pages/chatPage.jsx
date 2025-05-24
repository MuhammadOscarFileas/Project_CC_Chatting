import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Hapus import date-fns
import '../components/chatPage.css'; // Pastikan path CSS ini benar

// Hapus fungsi formatTimestamp

const ChatPage = () => {
    // --- State Variables ---
    const { contactId } = useParams();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newContactUsername, setNewContactUsername] = useState('');
    const [newContactNickname, setNewContactNickname] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [editingContactId, setEditingContactId] = useState(null);
    const [editingContactNickname, setEditingContactNickname] = useState('');
    const messagesEndRef = useRef(null);

    // --- Hooks & Functions ---

    // 1. Get User Data
    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            navigate('/login?info=belum_login');
            return;
        }
        const user = JSON.parse(userData);
        setCurrentUser(user);
    }, [navigate]);

    // 2. Fetch Contacts
    const fetchContacts = useCallback(async () => {
        if (!currentUser) return;
        try {
            const response = await axios.get(
                `http://localhost:5000/contacts/${currentUser.id_user}`
            );
            setContacts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError('Gagal memuat kontak.');
        }
    }, [currentUser]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // 3. Fetch Messages
    const fetchMessages = useCallback(async () => {
        if (!contactId || contactId === 'undefined' || !currentUser) {
            return;
        }
        try {
            const response = await axios.get(
                `http://localhost:5000/chats/${currentUser.id_user}/${contactId}`
            );
            setMessages(response.data);
            setError(null);
        } catch (err) {
            console.error(`Error fetching messages:`, err);
            setMessages([]);
            setError('Gagal memuat pesan.');
        }
    }, [contactId, currentUser]);

    // 4. useEffect for Fetch Messages & Polling
    useEffect(() => {
        if (!contactId || contactId === 'undefined' || !currentUser) {
            setMessages([]);
            return;
        }
        fetchMessages();
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [contactId, currentUser, fetchMessages]);

    // 5. Auto-Scroll
    useEffect(() => {
        if (!editingMessageId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, editingMessageId]);

    // 6. Handle Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !contactId || contactId === 'undefined' || !currentUser) return;
        try {
            await axios.post('http://localhost:5000/chats/send-message', {
                id_sender: currentUser.id_user,
                id_receiver: contactId,
                message: newMessage
            });
            setNewMessage('');
            await fetchMessages();
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Gagal mengirim pesan.');
            alert(err.response?.data?.msg || 'Gagal mengirim pesan.');
        }
    };

    // 7. Handle Add Contact
    const handleAddContact = async () => {
        if (!newContactUsername.trim()) {
            alert('Username kontak tidak boleh kosong');
            return;
        }
        if (!currentUser?.id_user) {
            alert('User tidak valid, silakan login kembali');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/contacts/add-contact', {
                id_user: currentUser.id_user,
                username: newContactUsername,
                nickname: newContactNickname
            });
            if (response.status === 201 || response.data.msg.includes("berhasil")) {
                setNewContactUsername('');
                setNewContactNickname('');
                alert('Kontak berhasil ditambahkan!');
                await fetchContacts();
            } else {
                alert(response.data.msg || 'Gagal menambahkan kontak');
            }
        } catch (err) {
            console.error('Error adding contact:', err);
            alert(err.response?.data?.msg || 'Terjadi kesalahan server.');
        }
    };

    // 8. Handle Logout
    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        navigate('/');
    };

    // 9. Handle Contact Click
    const handleContactClick = (targetId) => {
        if (targetId === undefined || targetId === null) {
            console.error("GAGAL NAVIGASI: targetId undefined/null.");
            return;
        }
        const currentTargetId = String(targetId);
        if (currentTargetId !== contactId && currentTargetId !== 'undefined') {
            navigate(`/chat/${currentTargetId}`);
        }
    };

    // 10. Get Contact Display Name
    const getContactDisplayName = (contact) => {
        if (!contact || !contact.user) return 'Unknown';
        return contact.nickname || contact.user.username || 'Unknown';
    };

    // 11. Edit/Delete Message Handlers
    const handleEditClick = (message) => {
        setEditingMessageId(message.id_chat);
        setEditingText(message.message);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingText('');
    };

    const handleUpdateMessage = async (messageId) => {
        if (!editingText.trim()) return;
        try {
            await axios.put(`http://localhost:5000/chats/${messageId}`, {
                message: editingText
            });
            setEditingMessageId(null);
            setEditingText('');
            await fetchMessages();
        } catch (err) {
            console.error('Error updating message:', err);
            alert('Gagal mengedit pesan.');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
            try {
                await axios.delete(`http://localhost:5000/chats/${messageId}`);
                await fetchMessages();
            } catch (err) {
                console.error('Error deleting message:', err);
                alert('Gagal menghapus pesan.');
            }
        }
    };

    // 12. Edit/Delete Contact Handlers
    const handleContactEditClick = (contact) => {
        setEditingContactId(contact.id_contact);
        setEditingContactNickname(contact.nickname || contact.user.username);
    };

    const handleContactCancelEdit = () => {
        setEditingContactId(null);
        setEditingContactNickname('');
    };

    const handleUpdateContact = async (id_contact_to_update) => {
        if (!editingContactNickname.trim()) return;
        try {
            await axios.put(`http://localhost:5000/contacts/contact/${id_contact_to_update}`, {
                nickname: editingContactNickname
            });
            setEditingContactId(null);
            setEditingContactNickname('');
            await fetchContacts();
        } catch (err) {
            console.error('Error updating contact:', err);
            alert('Gagal mengupdate nickname kontak.');
        }
    };

    const handleDeleteContact = async (contactToDelete) => {
        const id_contact_to_delete = contactToDelete.id_contact;
        const user_id_to_delete = contactToDelete.user.id_user;

        if (window.confirm(`Apakah Anda yakin ingin menghapus kontak ${getContactDisplayName(contactToDelete)}?`)) {
            try {
                await axios.delete(`http://localhost:5000/contacts/contact/${id_contact_to_delete}`);
                await fetchContacts();
                if (String(user_id_to_delete) === contactId) {
                    navigate('/chat');
                }
            } catch (err) {
                console.error('Error deleting contact:', err);
                alert('Gagal menghapus kontak.');
            }
        }
    };

    // 13. Loading State
    if (!currentUser) return <div>Loading...</div>;

    // --- JSX ---
    return (
        <div className="chat-container">
            <div className="row h-100 m-0">
                {/* Sidebar */}
                <div className="col-3 chat-sidebar p-3 d-flex flex-column">
                    <div className="chat-sidebar-header">
                        <img src="/logoo.png" alt="Logo" />
                        <h5 className="mb-0">Chat Application</h5>
                    </div>
                    <p>{currentUser.username}</p>
                    <h5 className="mb-3 mt-3">Contacts</h5>
                    <div className="list-group flex-grow-1 overflow-auto">
                        {contacts.map((contact) => {
                            const targetId = contact.user?.id_user;
                            if (!targetId) return null;

                            const isActive = contactId === String(targetId);
                            const contactDisplayName = getContactDisplayName(contact);
                            const isEditingContact = editingContactId === contact.id_contact;

                            return (
                                <div key={contact.id_contact} className={`contact-item-wrapper ${isActive ? 'active' : ''}`}>
                                    {isEditingContact ? (
                                        <div className="list-group-item editing-contact">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm mb-1"
                                                value={editingContactNickname}
                                                onChange={(e) => setEditingContactNickname(e.target.value)}
                                            />
                                            <button className="btn btn-sm btn-success me-1" onClick={() => handleUpdateContact(contact.id_contact)}>✓</button>
                                            <button className="btn btn-sm btn-secondary" onClick={handleContactCancelEdit}>X</button>
                                        </div>
                                    ) : (
                                        <div className={`list-group-item list-group-item-action ${isActive ? 'active' : ''}`}>
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <h6 className="mb-1 contact-name" onClick={() => handleContactClick(targetId)}>
                                                    {contactDisplayName}
                                                </h6>
                                                <div className="contact-actions">
                                                    <button title="Edit Nickname" onClick={() => handleContactEditClick(contact)}>✏️</button>
                                                    <button title="Hapus Kontak" onClick={() => handleDeleteContact(contact)}>🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="add-contact mt-3">
                        <div className="input-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter username"
                                value={newContactUsername}
                                onChange={(e) => setNewContactUsername(e.target.value)}
                            />
                        </div>
                        <div className="input-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter nickname (optional)"
                                value={newContactNickname}
                                onChange={(e) => setNewContactNickname(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary w-100"
                            type="button"
                            onClick={handleAddContact}
                        >
                            Add Contact
                        </button>
                    </div>
                    <div className="chat-sidebar-footer mt-3">
                        <a href="/files">📁 Files</a>
                        <a href="/images">🖼️ Images</a>
                    </div>
                    <button className="btn btn-danger mt-3" onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                {/* Chat Content */}
                <div className="col chat-content">
                    <div className="d-flex flex-column h-100">
                        <div className="chat-messages flex-grow-1 overflow-auto p-3">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {contactId && contactId !== 'undefined' ? (
                                messages.length > 0 ? (
                                    messages.map((message) => {
                                        const isMyMessage = message.id_sender === currentUser.id_user;
                                        const isEditing = editingMessageId === message.id_chat;

                                        return (
                                            <div
                                                key={message.id_chat}
                                                className={`chat-message ${isMyMessage ? 'sent' : ''}`}
                                            >
                                                {isEditing ? (
                                                    <div className="message-bubble edit-mode">
                                                        <textarea
                                                            className="form-control mb-1"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-success me-1"
                                                            onClick={() => handleUpdateMessage(message.id_chat)}
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="message-bubble">
                                                        {message.message}
                                                    </div>
                                                )}
                                                <div className="message-footer">
                                                    {isMyMessage && !isEditing && (
                                                        <div className="message-actions-bottom">
                                                            <button onClick={() => handleEditClick(message)}>
                                                                Edit
                                                            </button>
                                                            <span>·</span>
                                                            <button onClick={() => handleDeleteMessage(message.id_chat)}>
                                                                Hapus
                                                            </button>
                                                            <span>·</span>
                                                        </div>
                                                    )}
                                                    {/* Kembalikan ke toLocaleString() */}
                                                    <small>{new Date(message.timestamp).toLocaleString()}</small>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center mt-5">
                                        {!error && "Belum ada pesan."}
                                    </div>
                                )
                            ) : (
                                <div className="text-center mt-5">
                                    Pilih kontak untuk memulai chat.
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        {contactId && contactId !== 'undefined' && (
                            <div className="chat-input mt-auto p-3">
                                <form onSubmit={handleSendMessage} className="d-flex">
                                    <textarea
                                        className="form-control flex-grow-1 me-2"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        required
                                        rows="1"
                                        style={{ resize: 'none' }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        Send
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;