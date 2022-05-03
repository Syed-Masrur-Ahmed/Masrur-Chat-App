// YouTube Tutorial - https://www.youtube.com/watch?v=zQyrwxMPm88
// Website: jamchat.netlify.app

import './App.css';
import { initializeApp } from '@firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState, useEffect } from "react";

// Initializes the app
firebase.initializeApp({
  apiKey: "AIzaSyBp2VT_zCshp62pR0Q9SkyLMV8bzDCDIM0",
  authDomain: "chat-app-e8138.firebaseapp.com",
  projectId: "chat-app-e8138",
  storageBucket: "chat-app-e8138.appspot.com",
  messagingSenderId: "456350967302",
  appId: "1:456350967302:web:1d4387c983b4e7264e4587",
  measurementId: "G-PQJ5BN74JQ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

// Main App component
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

// The component for sign in page
function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <>
      <div class="title" id="signInTitle">
        <h1>Welcome to JamChat</h1>
        <h4>A global chatroom</h4>
      </div>
      <div class="signIn">
        <button class="signInButton" onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    </>  
  )
}

// The component for sign out button
function SignOut(){
  return auth.currentUser && (
    <button class="signout" onClick = {() => auth.signOut()}>Sign out</button>
  )
}

// The component for the chatroom
function ChatRoom(){
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(100);
  const [messages] = useCollectionData(query, {idField:"id"});
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName} = auth.currentUser;
    console.dir(auth.currentUser)
    // Adds the data to the firestore database
    formValue != "" && await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName 
    })
    setFormValue("")
  }
  
  // Scrolls all the way to the bottom whenever there's a new message
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages])

  return(
    <main>
      <SignOut/>
      <div class="title">
        <h2>JamChat</h2>
      </div>
      <div class="messages">
        <div style={{
          width:"100vw"
        }}>
          {messages && messages.map(msg => <ChatMessage key = {msg.id} message = {msg}/>)}
        </div>
        <form class="send" onSubmit={sendMessage}>
          <input value = {formValue} onChange={(e) => setFormValue(e.target.value)}/>
          <button type="submit" class="sendButton">SEND</button>
        </form>
      </div>
    </main>
  )
}

// The component for each individual message
function ChatMessage(props){
  const {text,uid,photoURL,displayName} = props.message;
  // Determines if message was sent by user or received
  const messageClass = uid === auth.currentUser.uid ? "Sent" : "Received";

  return(
    <div class={`message${messageClass}`}>
      <div class="row"> 
        <div style={{padding:'5px'}}>
          <p class="name" style={{color:'#a1ffba'}}>{displayName}</p>
          <h3 style={{color:'white', maxWidth:'260px', wordBreak:'break-word'}}>{text}</h3>
        </div>
        <img style={{padding:'5px', borderRadius: "50%"}} src={photoURL} width="80vw" height="80vw"/>
      </div>
    </div>  
      )

}

export default App;
