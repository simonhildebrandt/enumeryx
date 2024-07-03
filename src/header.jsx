import React, { useState } from 'react'

import {
  Box,
  Heading,
  Flex,
  Button,
  Input,
  FormControl,
} from '@chakra-ui/react'

import { sendSignInLink, logout } from './firebase';


function Login() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  function updateEmailValue(e) {
    setEmailValue(e.target.value);
  }

  if (submitted === true) return <Box>Login submitted - check your email.</Box>
  if (open === false) return <Button onClick={() => setOpen(true)}>Login</Button>

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    sendSignInLink(emailValue);
  }

  return <form
      style={{display: "flex", flexGrow: 1, maxWidth: "400px"}}
      onSubmit={handleSubmit}
    >
    <FormControl>
      <Input
        placeholder="email"
        type="email"
        required={true}
        value={emailValue}
        onChange={updateEmailValue}
        onBlur={() => setOpen(false)}
      />
    </FormControl>
  </form>
}

function Logout({user}) {
  if (user == null) return '';

  return <Flex>
    { user.email }
    <Button onClick={logout}>Logout</Button>
  </Flex>
}

export default function ({user}) {
  return <Flex align="center" justify="space-between" width="100%">
    <Heading>Enumeryx</Heading>
    { user === false ? <Login/> : <Logout user={user}/> }
  </Flex>
}
