
import { useState, useRef } from "react"
export const LoginForm = ({ onFormSubmit }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const formRef = useRef(null);

    const onChange = ((e) => {
        setUserName(e.target.value);
    })
    const onPasswordChange = ((e) => {
        setPassword(e.target.value);
    })

    const onSubmit = ((e => {
        e.preventDefault();
        console.log("form submitted with username:", userName);
        onFormSubmit(userName, password);
        setUserName('');
        setPassword('');
        formRef.current.reset();
    }))

    return (
        <div>
            <form onSubmit={onSubmit} ref={formRef}>
                <label htmlFor="userName">Enter a username: </label><input type="text" id="userName" placeholder="Enter a username..." onChange={onChange} />
                <label htmlFor="password">Enter a password: </label><input type="password" id="password" placeholder="Enter password..." onChange={onPasswordChange} />
                <button type="submit">Submit</button>
            </form>
        </div>)

}