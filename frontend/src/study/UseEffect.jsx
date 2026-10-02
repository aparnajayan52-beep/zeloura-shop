import React, { useState } from "react";
import axios from "axios";

function AxiosPost() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        axios
            .post("https://jsonplaceholder.typicode.com/users", {
                name: name,
                email: email,
            })
            .then((response) => {
                console.log(response.data);
                alert("User added successfully!");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <h1>Add User</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br /><br />

                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br /><br />

                <button type="submit">Add User</button>
            </form>
        </div>
    );
}

export default AxiosPost;