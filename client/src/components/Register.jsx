import { useState, useContext } from "react"
import axios from 'axios'
import { UserContext } from "../UserContext"

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginOrRegister, setisLoginOrRegister] = useState('register')

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext)

    async function handleSubmit(e) {
        e.preventDefault()
        const url = isLoginOrRegister === 'register' ? '/register' : '/login'
        const res = await axios.post(url, { username, password })
        setLoggedInUsername(username)
        setId(res.data.id)

    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input type="text" placeholder="Username.."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-sm p-2 mb-2" />
                <input type="password" placeholder="Password.."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-sm p-2 mb-2" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className=" text-center mt-2 font-bold">
                    {
                        isLoginOrRegister === 'register' ? (
                            <div>
                                Already a member? {' '}
                                <button type="button" className="underline" onClick={() => setisLoginOrRegister('login')}> Login</button>
                            </div>
                        ) : (
                            <div>
                                Dont have an account? {' '}
                                <button type="button" className="underline" onClick={() => setisLoginOrRegister('register')}> SignUp</button>
                            </div>
                        )

                    }
                </div>
            </form>

        </div>


    )
}