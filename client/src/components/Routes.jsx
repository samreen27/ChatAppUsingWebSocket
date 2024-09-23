import RegisterAndLoginForm from './Register'
import { UserContext  } from '../UserContext'
import { useContext, useEffect } from 'react'
import Chat from './Chat'

export default function Routes(){

    const {username, id} = useContext(UserContext)
    
    if(username) {
        return <Chat/>
    }
    return (
        <RegisterAndLoginForm/>
    )
}