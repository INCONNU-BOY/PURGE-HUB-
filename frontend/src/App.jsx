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
export const serverUrl = "https://purge-hub-backend.onrender.com";
import { io, Socket } from "socket.io-client";
import { setonlineuser, setsocket } from "./redux/SocketSlice";
import Getallfollowing from "./Hooks/Getallfollowing";
import Getallpreviouschatuser from "./Hooks/Getallpreviouschatuser";
import Getallnotification from "./Hooks/Getallnotification";
import Notification from "./Pages/Notification";
import Feed from "./components/Feed";
import { setnotificationdata } from "./redux/UserSlice";

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

  useEffect(() => {
    if (userData) {
      const socketIo = io(`${serverUrl}`, {
        query: { userId: userData._id },
      });

      dispatch(setsocket(socketIo));

      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setonlineuser(users));
      });

      return () => socketIo.close();
    } else {
      if (socket) {
        socket.close();
        dispatch(setsocket(null));
      }
    }
  }, [userData]);

  socket?.on("newnotification", (noti) => {
    dispatch(setnotificationdata([...notificationdata, noti]));
  });

  return (
    <>
      <Scrolltop />
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to={"/"} />}
        />
        <Route
          path="/Signin"
          element={!userData ? <Signin /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/forgotpassword"
          element={!userData ? <Forgotpassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/profile/:username"
          element={userData ? <Profile /> : <Navigate to={"/"} />}
        />
        <Route
          path="/editprofile"
          element={userData ? <Editprofile /> : <Navigate to={"/"} />}
        />
        <Route
          path="/upload"
          element={userData ? <Upload /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/loop"
          element={userData ? <Loops /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/story/:username"
          element={userData ? <Story /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/search"
          element={userData ? <Search /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/message"
          element={userData ? <Message /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/textarea"
          element={userData ? <Textarea /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/notification"
          element={userData ? <Notification /> : <Navigate to={"/signin"} />}
        />
      </Routes>
    </>
  );
}

export default App;
