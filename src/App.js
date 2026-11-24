import { useState, useEffect } from "react"


function App() {

  const [value,setValue]=useState("")
  const [message,setMessage]=useState(null);
  const [prevChats,setPrevChats]=useState([]);
  const [currentTitle,setCurrentTitle]=useState(null);

  // Messages that belong to the chat that is currently open 
  const currentChat=prevChats.filter(prevChat => prevChat.title === currentTitle )

  const uniqueTitles=Array.from(new Set(prevChats.map(prevChat =>prevChat.title)))

  const createNewChat=()=>{
    setMessage(null)
    setValue("")
    setCurrentTitle(null)
  }

  const handleClick= (uniqueTitle)=>{
    setCurrentTitle(uniqueTitle);
    setMessage(null)
    setValue("")
  }

  const getMessages=async()=>{

    if(!value.trim()) return;

    // MEMORY: send the earlier messages of this chat plus the new user message
    const history = currentChat.map(({role, content}) => ({role, content}));
    const messagesToSend = [...history, { role:"user", content:value }];

    const options={
      method:"POST",
      body:JSON.stringify({
          messages: messagesToSend
      }),
      headers:{
        "Content-Type":"application/json"
      }
    }

    try{
      const response=await fetch(`${process.env.REACT_APP_API_URL}/completions`,options)
      const data=await response.json()

      if (!response.ok) {
         console.log(data.error || "Unknown error occurred");
         return;
      }
      setMessage(data.choices[0].message)
    }catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    if(!currentTitle && value && message){
      setCurrentTitle(value)
    }
    if(currentTitle && value && message){
      setPrevChats(prevChats =>(
        [
          ...prevChats,{
            title:currentTitle,
            role:"user",
            content:value
          },
          {
            title:currentTitle,
            role:message.role,
            content:message.content
          }
        ]
      ))
      setValue("")
    }
  },[message,currentTitle])

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle,index) =><li key={index} onClick={()=>handleClick(uniqueTitle)}>{uniqueTitle}</li>)}
        </ul>
          <nav>
            <p>Made by Sehaj</p>
          </nav>
      </section>
      <section className="main">
        {!currentTitle && <h1>MyGPT</h1>}
        <ul className="feed">
          {currentChat?.map((chatMessage,index)=> <li key={index}>
            <p className="role">{chatMessage.role}</p>
            <p>{chatMessage.content}</p>
          </li>)}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input value={value} onChange={(e)=> setValue(e.target.value)}/>
            <div id="submit" onClick={getMessages}>➤</div>
          </div>
          <p className="info">
            Chat GPT 14 version. Free Research Preview. Our Goal is to make AI systems more natural and safe to interact with.Your feedback will help us improve.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
