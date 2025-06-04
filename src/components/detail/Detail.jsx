import { useState } from "react";
import { toast } from "react-toastify";
import { arrayRemove, arrayUnion, doc, updateDoc, setDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import upload from "../../lib/upload";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat()
  };

  const handleChangeAvatar = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      if (e.target.files[0]) {
        const newFile = e.target.files[0];
        setAvatar({
          file: newFile,
          url: URL.createObjectURL(newFile),
        });

        try {
          const user = auth.currentUser;
          if (user) {
            const imgUrl = await upload(newFile);
            await setDoc(doc(db, "users", user.uid), {
              avatar: imgUrl,
            }, { merge: true });
            toast.success("Avatar updated successfully!");
          } else {
            toast.warn("User not logged in.");
          }
        } catch (err) {
          console.log(err);
          toast.error("Error updating avatar: " + err.message);
        }
      }
    };
    fileInput.click();
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
      </div>
      <div className="info">
  
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <button className="change-avatar" onClick={handleChangeAvatar}>
        Change Avatar
      </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;