import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../utils"; // Pastikan BASE_URL diimpor dengan benar
import '../components/chatPage.css'; // Pastikan CSS diimpor dengan benar
import useAuth from '../auth/useAuth'; // Pastikan hook useAuth diimpor dengan benar

const ChatPage = () => {
    const { accessToken } = useAuth(); // Ambil accessToken dari context
    const { contactId } = useParams();
    const navigate = useNavigate();

    // --- State Variables ---
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

    // State untuk Edit Profil
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editNickname, setEditNickname] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(null);

    // 1. Get User Data from Session Storage
    useEffect(() => {
        const rawData = sessionStorage.getItem('userData');
        if (!rawData || rawData === 'undefined') {
            console.log("Tidak ada data user, navigasi ke login.");
            navigate('/login?info=belum_login');
            return;
        }
        try {
            const user = JSON.parse(rawData);
            setCurrentUser(user);
            // Inisialisasi state edit profil saat user data dimuat
            setEditUsername(user.username);
            setEditEmail(user.email || '');
            setEditNickname(user.nickname || '');
        } catch (e) {
            console.error('Data user corrupt:', e);
            navigate('/login?info=invalid_user');
        }
    }, [navigate]);

    // 2. Fetch Contacts Function
    const fetchContacts = useCallback(async () => {
        if (!currentUser || !accessToken) return;
        try {
            const response = await axios.get(
                `${BASE_URL}/contacts/${currentUser.id_user}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setContacts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError('Gagal memuat kontak.');
            // TODO: Handle token refresh if error is 401/Unauthorized
        }
    }, [currentUser, accessToken]);

    // useEffect to run fetchContacts when currentUser or accessToken changes
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // 3. Fetch Messages Function (with 403/404 handling)
    const fetchMessages = useCallback(async () => {
        if (!contactId || contactId === 'undefined' || !currentUser || !accessToken) {
            setMessages([]); // Clear messages if no contact selected
            return;
        }
        try {
            const response = await axios.get(
                `${BASE_URL}/chats/${currentUser.id_user}/${contactId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setMessages(response.data);
            setError(null);
        } catch (err) {
            console.error(`Error fetching messages:`, err);
            if (err.response && (err.response.status === 403 || err.response.status === 404)) {
                alert("Kontak ini tidak lagi tersedia atau telah menghapus Anda.");
                navigate('/chat');
            } else {
                setMessages([]);
                setError('Gagal memuat pesan.');
                 // TODO: Handle token refresh if error is 401/Unauthorized
            }
        }
    }, [contactId, currentUser, accessToken, navigate]);

    // 4. useEffect for Fetch Messages & Polling
    useEffect(() => {
        if (!contactId || contactId === 'undefined' || !currentUser) {
            setMessages([]);
            return;
        }
        fetchMessages(); // Fetch immediately
        const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount/change
    }, [contactId, currentUser, fetchMessages]);

    // 5. useEffect to Check Contact Validity (Frontend Check)
    useEffect(() => {
        if (contactId && contactId !== 'undefined' && contacts.length > 0) {
            const isContactStillValid = contacts.some(
                contact => contact.user && String(contact.user.id_user) === contactId
            );
            if (!isContactStillValid) {
                console.warn(`Kontak ${contactId} tidak lagi valid di frontend. Navigasi kembali.`);
                alert("Kontak yang Anda pilih tidak lagi tersedia.");
                navigate('/chat');
            }
        }
    }, [contactId, contacts, navigate]);

    // 6. Auto-Scroll to Bottom
    useEffect(() => {
        if (!editingMessageId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, editingMessageId]);

    // --- Handler Functions ---

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !contactId || contactId === 'undefined' || !currentUser || !accessToken) return;
        try {
            await axios.post(`${BASE_URL}/chats/send-message`, {
                id_sender: currentUser.id_user,
                id_receiver: contactId,
                message: newMessage
            }, { headers: { Authorization: `Bearer ${accessToken}` } });
            setNewMessage('');
            await fetchMessages(); // Fetch immediately after sending
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Gagal mengirim pesan.');
            alert(err.response?.data?.msg || 'Gagal mengirim pesan.');
        }
    };

    const handleAddContact = async () => {
        if (!newContactUsername.trim() || !currentUser?.id_user || !accessToken) {
            alert('Username kontak tidak boleh kosong');
            return;
        }
        try {
            await axios.post(`${BASE_URL}/contacts/add-contact`, {
                id_user: currentUser.id_user,
                username: newContactUsername,
                nickname: newContactNickname
            }, { headers: { Authorization: `Bearer ${accessToken}` } });
            setNewContactUsername('');
            setNewContactNickname('');
            alert('Kontak berhasil ditambahkan!');
            await fetchContacts(); // Refresh contact list
        } catch (err) {
            console.error('Error adding contact:', err);
            alert(err.response?.data?.msg || 'Gagal menambahkan kontak (mungkin sudah ada atau username salah).');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token'); // Hapus juga token dari local storage jika ada
        // Panggil fungsi logout dari useAuth jika ada
        navigate('/');
    };

    const handleContactClick = (targetId) => {
        if (targetId === undefined || targetId === null) return;
        const currentTargetId = String(targetId);
        if (currentTargetId !== contactId && currentTargetId !== 'undefined') {
            navigate(`/chat/${currentTargetId}`);
        }
    };

    const getContactDisplayName = (contact) => {
        if (!contact || !contact.user) return 'Unknown';
        return contact.nickname || contact.user.username || 'Unknown';
    };

    // Message Edit/Delete
    const handleEditClick = (message) => setEditingMessageId(message.id_chat);
    const handleCancelEdit = () => setEditingMessageId(null);

    const handleUpdateMessage = async (messageId) => {
        if (!editingText.trim() || !accessToken) return;
        try {
            await axios.put(`${BASE_URL}/chats/${messageId}`, { message: editingText },
                { headers: { Authorization: `Bearer ${accessToken}` } });
            setEditingMessageId(null);
            setEditingText('');
            await fetchMessages();
        } catch (err) {
            console.error('Error updating message:', err);
            alert('Gagal mengedit pesan.');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pesan ini?") && accessToken) {
            try {
                await axios.delete(`${BASE_URL}/chats/${messageId}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } });
                await fetchMessages();
            } catch (err) {
                console.error('Error deleting message:', err);
                alert('Gagal menghapus pesan.');
            }
        }
    };

    // Contact Edit/Delete
    const handleContactEditClick = (contact) => {
        setEditingContactId(contact.id_contact);
        setEditingContactNickname(contact.nickname || contact.user.username);
    };

    const handleContactCancelEdit = () => setEditingContactId(null);

    const handleUpdateContact = async (id_contact_to_update) => {
        if (!editingContactNickname.trim() || !accessToken) return;
        try {
            await axios.put(`${BASE_URL}/contacts/contact/${id_contact_to_update}`, { nickname: editingContactNickname },
                { headers: { Authorization: `Bearer ${accessToken}` } });
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
        const user_id_to_delete = contactToDelete.user?.id_user;
        if (!user_id_to_delete || !accessToken) return;

        if (window.confirm(`Apakah Anda yakin ingin menghapus kontak ${getContactDisplayName(contactToDelete)}?`)) {
            try {
                await axios.delete(`${BASE_URL}/contacts/contact/${id_contact_to_delete}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } });
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

    // Profile Edit Modal Handlers
    const handleOpenEditModal = () => {
        setEditError(null);
        setEditSuccess(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (currentUser) {
             setEditUsername(currentUser.username);
             setEditEmail(currentUser.email || '');
             setEditNickname(currentUser.nickname || '');
        }
        setShowEditProfileModal(true);
    };

    const handleCloseEditModal = () => setShowEditProfileModal(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setEditError(null);
        setEditSuccess(null);
        if (!accessToken || !currentUser) return;

        const updatedData = {
            username: editUsername,
            email: editEmail,
            nickname: editNickname,
        };

        try {
            await axios.put(`${BASE_URL}/users/user/${currentUser.id_user}`, updatedData,
                { headers: { Authorization: `Bearer ${accessToken}` } });
            const updatedUser = { ...currentUser, ...updatedData };
            setCurrentUser(updatedUser);
            sessionStorage.setItem('userData', JSON.stringify(updatedUser));
            setEditSuccess("Profil berhasil diperbarui!");
        } catch (err) {
            console.error('Error updating profile:', err);
            setEditError(err.response?.data?.msg || 'Gagal memperbarui profil.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setEditError(null);
        setEditSuccess(null);
        if (!accessToken || !currentUser) return;

        if (newPassword !== confirmPassword) {
            setEditError("Password baru dan konfirmasi password tidak cocok.");
            return;
        }
        if (!newPassword) {
            setEditError("Password baru tidak boleh kosong.");
            return;
        }

        try {
            await axios.put(`${BASE_URL}/users/user/${currentUser.id_user}`, { password: newPassword },
                { headers: { Authorization: `Bearer ${accessToken}` } });
            setEditSuccess("Password berhasil diubah!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error changing password:', err);
            setEditError(err.response?.data?.msg || 'Gagal mengubah password.');
        }
    };

    // User Deletion
    const handleDeleteUser = async () => {
        setEditError(null);
        if (!accessToken || !currentUser) return;
        const confirmDelete = window.confirm(
            "APAKAH ANDA YAKIN INGIN MENGHAPUS AKUN ANDA? \n\nTindakan ini tidak dapat dibatalkan dan semua data Anda akan hilang."
        );

        if (confirmDelete) {
            try {
                await axios.delete(`${BASE_URL}/users/user/${currentUser.id_user}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } });
                alert("Akun Anda telah berhasil dihapus.");
                handleLogout();
            } catch (err) {
                console.error('Error deleting user:', err);
                setEditError(err.response?.data?.msg || 'Gagal menghapus akun.');
                alert('Gagal menghapus akun. Silakan coba lagi.');
            }
        }
    };

    // Loading State
    if (!currentUser) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.5em' }}>Loading...</div>;

    // --- JSX ---
    return (
        <div className="chat-container">
            <div className="row h-100 m-0">
                {/* Sidebar */}
                <div className="col-3 chat-sidebar p-3 d-flex flex-column">
                    <div className="chat-sidebar-header">
                        <img src="/logoo.png" alt="Logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                        <h5 className="mb-0">Chit Chat</h5>
                    </div>

                    <div className="user-profile my-3 text-center">
                        <h6>Welcome, {currentUser.username}!</h6>
                        <button className="btn btn-sm btn-outline-light" onClick={handleOpenEditModal}>
                            ⚙️ Edit Profile
                        </button>
                    </div>

                    <h5 className="mb-3 mt-3">Contacts</h5>
                    <div className="list-group flex-grow-1 overflow-auto">
                        {contacts.map((contact) => {
                            const targetId = contact.user?.id_user;
                            if (!targetId) return null; // Skip if user data is missing
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
                                            <button className="btn btn-sm btn-secondary" onClick={handleContactCancelEdit}>✗</button>
                                        </div>
                                    ) : (
                                        <div className={`list-group-item list-group-item-action ${isActive ? 'active' : ''}`}>
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <h6 className="mb-1 contact-name" onClick={() => handleContactClick(targetId)}>
                                                    {contactDisplayName}
                                                </h6>
                                                <div className="contact-actions">
                                                    <button title="Edit Nickname" onClick={() => handleContactEditClick(contact)}>✏️</button>
                                                    <button title="Delete Contact" onClick={() => handleDeleteContact(contact)}>🗑️</button>
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
                        <button className="btn btn-primary w-100" type="button" onClick={handleAddContact}>
                            Add Contact
                        </button>
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
                                            <div key={message.id_chat} className={`chat-message ${isMyMessage ? 'sent' : 'received'}`}>
                                                {isEditing ? (
                                                    <div className="message-bubble edit-mode">
                                                        <textarea
                                                            className="form-control mb-2"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                        />
                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateMessage(message.id_chat)}>Save</button>
                                                            <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="message-bubble">{message.message}</div>
                                                )}
                                                <div className="message-footer">
                                                    {isMyMessage && !isEditing && (
                                                        <div className="message-actions-bottom">
                                                            <button onClick={() => handleEditClick(message)}>Edit</button>
                                                            <span>·</span>
                                                            <button onClick={() => handleDeleteMessage(message.id_chat)}>Delete</button>
                                                            <span>·</span>
                                                        </div>
                                                    )}
                                                    <small>{new Date(message.timestamp).toLocaleString()}</small>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center mt-5">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>💬</div>
                                            <p className="text-muted">No messages yet. Start a conversation!</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center mt-5">
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>👋</div>
                                        <p className="text-muted">Select a contact to start chatting</p>
                                    </div>
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
                                        style={{ resize: 'none', height: 'auto' }} // Auto-height basic
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button type="submit" className="btn btn-primary">Send</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Edit Profile */}
            {showEditProfileModal && (
                <>
                    <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered"> {/* Added centering */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Profile</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
                                </div>
                                <div className="modal-body">
                                    {editError && <div className="alert alert-danger">{editError}</div>}
                                    {editSuccess && <div className="alert alert-success">{editSuccess}</div>}

                                    {/* Form Edit User Info */}
                                    <form onSubmit={handleUpdateProfile}>
                                        <h6 className="mb-3">Update Info</h6>
                                        <div className="mb-3">
                                            <label htmlFor="editUsername" className="form-label">Username</label>
                                            <input type="text" className="form-control" id="editUsername" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editEmail" className="form-label">Email</label>
                                            <input type="email" className="form-control" id="editEmail" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editNickname" className="form-label">Nickname</label>
                                            <input type="text" className="form-control" id="editNickname" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} />
                                        </div>
                                        <button type="submit" className="btn btn-primary mb-3">Save Profile Changes</button>
                                    </form>

                                    <hr />

                                    {/* Form Edit Password */}
                                    <form onSubmit={handleChangePassword}>
                                        <h6 className="mb-3">Change Password</h6>
                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label">New Password</label>
                                            <input type="password" className="form-control" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                            <input type="password" className="form-control" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                                        </div>
                                        <button type="submit" className="btn btn-warning" disabled={!newPassword}>Change Password</button>
                                    </form>

                                    <hr />

                                    {/* Danger Zone */}
                                    <div className="danger-zone mt-4 p-3 border border-danger rounded">
                                        <h6 className="text-danger">Danger Zone</h6>
                                        <p className="small text-muted">Deleting your account is permanent and cannot be undone.</p>
                                        <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>Delete My Account</button>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div> {/* Backdrop */}
                </>
            )}
        </div>
    );
};

export default ChatPage;