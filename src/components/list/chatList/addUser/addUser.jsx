import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [isUserAdded, setIsUserAdded] = useState(false);
  const [notification, setNotification] = useState("");

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0].data();
        setUser(foundUser);

        const userChatsRef = collection(db, "userchats");
        const userChatsDoc = await getDoc(doc(userChatsRef, currentUser.id));
        const userChats = userChatsDoc.exists() ? userChatsDoc.data().chats : [];

        const isAlreadyAdded = userChats.some(chat => chat.receiverId === foundUser.id);
        setIsUserAdded(isAlreadyAdded);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    if (isUserAdded) {
      setNotification("User is already added.");
      return;
    }

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      setIsUserAdded(true);
      setNotification("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
      {notification && <div className="notification">{notification}</div>}
    </div>
  );
};

export default AddUser;