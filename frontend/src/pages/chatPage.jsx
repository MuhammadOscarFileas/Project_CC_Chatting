import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/chatPage.css';

const ChatPage = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newContactUsername, setNewContactUsername] = useState('');
    const [newContactNickname, setNewContactNickname] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            navigate('/login?info=belum_login');
            return;
        }
        const user = JSON.parse(userData);
        setCurrentUser(user);
    }, [navigate]);

    useEffect(() => {
        if (!currentUser) return;

        console.log("Current user:", currentUser);
        fetchContacts();
    }, [currentUser]);

    const fetchContacts = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/contacts/${currentUser.id_user}`
            );
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        if (!contactId || !currentUser) return;
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/chats/${currentUser.id_user}/${contactId}`
                );
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchMessages();
    }, [contactId, currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !contactId || !currentUser) return;

        try {
            const response = await axios.post('/api/chats/send-message', {
                id_sender: currentUser.id_user,
                id_receiver: contactId,
                message: newMessage
            });

            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

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

            if (response.data.msg === 'Kontak berhasil ditambahkan') {
                const addedContact = {
                    ...response.data.contact,
                    Receiver: {
                        id_user: response.data.contact.id_userreceiver,
                        username: newContactUsername,
                        nickname: newContactNickname || newContactUsername
                    }
                };

                setContacts(prev => [...prev, addedContact]);
                setNewContactUsername('');
                setNewContactNickname('');
                alert('Kontak berhasil ditambahkan!');
                fetchContacts();
            } else {
                alert(response.data.msg || 'Gagal menambahkan kontak');
            }
        } catch (error) {
            console.error('Detail error:', error.response?.data);
            alert(error.response?.data?.msg || 'Terjadi kesalahan server. Silakan coba lagi.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleContactClick = (targetId) => {
        if (targetId !== contactId) {
            navigate(`/chat/${targetId}`);
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="chat-container">
            <div className="row h-100 m-0">
                {/* Sidebar */}
                <div className="col-3 chat-sidebar p-3">
                    <div className="chat-sidebar-header">
                        <img src="/logoo.png" alt="Logo" />
                        <h5 className="mb-0">Chat Application</h5>
                    </div>
                    <p>{currentUser.username}</p>
                    <h5 className="mb-3 mt-3">Contacts</h5>

                    <div className="list-group">
                        {contacts.map((contact) => {
                            const targetId = contact.id_userreceiver === currentUser.id_user
                                ? contact.id_useradder
                                : contact.id_userreceiver;
                            const isActive = contactId === targetId.toString();
                            const contactUsername = contact.nickname ||
                                (contact.id_userreceiver === currentUser.id_user
                                    ? contact.Adder?.username
                                    : contact.Receiver?.username);

                            return (
                                <button
                                    key={contact.id_contact}
                                    className={`list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                                    onClick={() => handleContactClick(targetId)}
                                >
                                    <div className="d-flex w-100 justify-content-between">
                                        <h6 className="mb-1">{contactUsername || 'Unknown'}</h6>
                                        <small>2m</small>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Add Contact Form */}
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

                    {/* Footer Links */}
                    <div className="chat-sidebar-footer">
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
                        {/* Messages */}
                        <div className="chat-messages flex-grow-1 overflow-auto">
                            {messages.length > 0 ? (
                                messages.map((message) => (
                                    <div
                                        key={message.id_chat}
                                        className={`chat-message ${message.id_sender === currentUser.id_user ? 'sent' : ''}`}
                                    >
                                        <div className="message-bubble">
                                            {message.message}
                                        </div>
                                        <small>{new Date(message.timestamp).toLocaleString()}</small>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center mt-5">No messages yet</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        {contactId && (
                            <div className="chat-input mt-3">
                                <form onSubmit={handleSendMessage}>
                                    <textarea
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
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
