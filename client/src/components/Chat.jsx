import React, { useContext, useRef } from 'react'
import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from '../UserContext';
import { uniqBy } from 'lodash'
import axios from 'axios'

export default function Chat() {

    const { username, id } = useContext(UserContext)

    const divUnderMessages = useRef(null)

    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setnewMessageText] = useState('')
    const [messages, setMessages] = useState([])


    useEffect(() => {
        connectToWs();
    }, []);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', ()=> {
            setTimeout(()=> {
                console.log('Disconnected, Trying To Reconnect')
                connectToWs()
            }, 1000)    
        })
    }

    function showOnlinePeople(peopleArray) {
        const people = {}

        //exclude the user from the online people list
        const excludeOurUser = peopleArray.filter(people => people.userId !== id)
        excludeOurUser.forEach(({ userId, username }) => {
            people[userId] = username;
        })
        //console.log(people)
        setOnlinePeople(people)
    }

    function handleMessage(event) {
        console.log('new message', event.data)
        const messageData = JSON.parse(event.data)
        //console.log(messageData)
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        }
        else if ('text' in messageData) {

            setMessages(prev => ([...prev, { ...messageData }]))

        }
    }

    //alternate way of excluding the user
    // const onlinePeopleExclOurUser = {...onlinePeople}
    // delete onlinePeopleExclOurUser[id]

    const sendMessage = (e) => {
        e.preventDefault()
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText
        }))
        setnewMessageText('')
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]))
        //console.log("messages set::", messages)

    }

    useEffect(() => {
        const div = divUnderMessages.current
        if (div) {

            div.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }, [messages])

    useEffect(() => {
        
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then((messages) => {
                setMessages(messages.data) 
            })
        }
    }, [selectedUserId])

    
    //console.log(messages)
    const messagesWODupes = uniqBy(messages, '_id')
    //console.log(messages, messagesWODupes)


    return (
        <div className='flex h-screen'>
            <div className='bg-white w-1/4'>
                <div className='text-blue-600 font-bold flex gap-2 p-4'>
                    <Logo />
                    <span>MernChat</span>
                </div>

                {Object.keys(onlinePeople).map((userId) => (
                    <div onClick={() => { setSelectedUserId(userId) }}
                        key={userId} className={`border-b border-gray-100 cursor-pointer flex gap-2 items-center ${userId == selectedUserId ? 'bg-blue-100' : 'hover:bg-blue-50'} `}>
                        {userId === selectedUserId && (
                            <div className='w-1 bg-blue-500 h-12 rounded-r-md'></div>
                        )}
                        <div className='flex items-center gap-2 pl-4 py-2'>
                            <Avatar username={onlinePeople[userId]} userId={userId} />
                            <span className='text-gray-800 font-semibold'> {onlinePeople[userId]} </span>
                        </div>
                    </div>

                )
                )}</div>
            <div className='bg-blue-50 w-3/4 p-2 flex flex-col'>
                <div className='flex-grow'>
                    {!selectedUserId && (
                        <div className='flex flex-col justify-center items-center h-full'>
                            <div className='text-gray-400'>No Chats available. </div>
                            <div className='text-gray-400'>&larr; Select3 from the left panel to Start Chat Now! </div>
                        </div>)
                    }
                    {!!selectedUserId && (

                        <div className='relative h-full'>
                            <div className='absolute top-0 left-0 right-0 bottom-2 overflow-y-scroll '>
                                {messagesWODupes.map((message, index) => (
                                    <div key={message._id} className={message.sender === id ? 'text-right' : 'text-left'}>
                                        <div
                                            className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                                {message.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>

                    )}
                </div>
                {!!selectedUserId && (
                    <form className='flex items-center gap-2 mx-2' onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessageText}
                            onChange={(e) => setnewMessageText(e.target.value)}
                            className='border border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition duration-300 p-2 rounded flex-grow'
                            placeholder='Type your message here..' />
                        <button type="submit" className='bg-blue-900 p-2 text-white rounded-sm'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}

            </div>
        </div>
    )
}


