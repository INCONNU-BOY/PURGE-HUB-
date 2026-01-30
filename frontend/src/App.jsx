import React, { useEffect } from "react";
import Scrolltop from "./components/Scrolltop";
import { Navigate, Route, Routes } from "react-router-dom";
import Signup from "./Pages/Signup";
import Signin from "./Pages/Signin";
import Home from "./Pages/Home";
import Forgotpassword from "./Pages/Forgotpassword";
import { useDispatch, useSelector } from "react-redux";
import Getcurrentuser from "./Hooks/Getcurrentuser";
import Getsuggesteduser from "./Hooks/Getsuggesteduser";
import Profile from "./Pages/Profile";
import Editprofile from "./Pages/Editprofile";
import Upload from "./Pages/Upload";
import Getallpost from "./Hooks/Getallpost";
import Getallloops from "./Hooks/Getallloops";
import Loops from "./Pages/Loops";
import Story from "./Pages/Story";
import Getallstories from "./Hooks/Getallstories";
import Search from "./Pages/Search";
import Message from "./Pages/Message";
import Textarea from "./Pages/Textarea";
import { io } from "socket.io-client";
import { setonlineuser, setsocket } from "./redux/SocketSlice";
import Getallfollowing from "./Hooks/Getallfollowing";
import Getallpreviouschatuser from "./Hooks/Getallpreviouschatuser";
import Getallnotification from "./Hooks/Getallnotification";
import Notification from "./Pages/Notification";
import { setnotificationdata } from "./redux/UserSlice";

/* ✅ SERVER URL (via .env recommandé) */
export const serverUrl = import.meta.env.VITE_SERVER_URL;
// ex: https://purge-hub-backend.onrender.com

function App() {
  Getcurrentuser();
  Getsuggesteduser();
  Getallpost();
  Getallloops();
  Getallstories();
  Getallfollowing();
  Getallpreviouschatuser();
  Getallnotification();

  const { userData, notificationdata } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  /* 🔌 SOCKET CONNECTION */
  useEffect(() => {
    if (!userData) return;

    const socketIo = io(serverUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    dispatch(setsocket(socketIo));

    socketIo.on("getOnlineUsers", (users) => {
      dispatch(setonlineuser(users));
    });

    socketIo.on("newnotification", (noti) => {
      dispatch(setnotificationdata((prev) => [...prev, noti]));
    });

    return () => {
      socketIo.off("getOnlineUsers");
      socketIo.off("newnotification");
      socketIo.disconnect();
      dispatch(setsocket(null));
    };
  }, [userData, dispatch]);

  return (
    <>
      <Scrolltop />
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!userData ? <Signin /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signin" />}
        />
        <Route
          path="/forgotpassword"
          element={!userData ? <Forgotpassword /> : <Navigate to="/" />}
        />
        <Route
          path="/profile/:username"
          element={userData ? <Profile /> : <Navigate to="/signin" />}
        />
        <Route
          path="/editprofile"
          element={userData ? <Editprofile /> : <Navigate to="/signin" />}
        />
        <Route
          path="/upload"
          element={userData ? <Upload /> : <Navigate to="/signin" />}
        />
        <Route
          path="/loop"
          element={userData ? <Loops /> : <Navigate to="/signin" />}
        />
        <Route
          path="/story/:username"
          element={userData ? <Story /> : <Navigate to="/signin" />}
        />
        <Route
          path="/search"
          element={userData ? <Search /> : <Navigate to="/signin" />}
        />
        <Route
          path="/message"
          element={userData ? <Message /> : <Navigate to="/signin" />}
        />
        <Route
          path="/textarea"
          element={userData ? <Textarea /> : <Navigate to="/signin" />}
        />
        <Route
          path="/notification"
          element={userData ? <Notification /> : <Navigate to="/signin" />}
        />
      </Routes>
    </>
  );
}

export default App;
