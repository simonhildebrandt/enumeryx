import React from 'react';

import { ChakraProvider, Flex, Heading } from '@chakra-ui/react'

import { Switch, Route } from "navigo-react";

import { withUser } from './firebase';
import Header from './header';
import SetList from './set-list';
import EditSet from './edit-set';


function Authenticated({user}) {
  return <Switch>
    <Route path="/"><SetList user={user}/></Route>
    <Route path="/sets/:id"><EditSet user={user}/></Route>
  </Switch>
}

function Anon() {
  return <>
    Enumeryx is a simple web tool for tracking data that changes.
  </>
}

function UserOrAnon({user}) {
  return user == false ? <Anon/> : <Authenticated user={user}/>
}

export default function() {
  const {user} = withUser();

  return <ChakraProvider>
    <Flex direction="column" width="100%" align="stretch">
      <Flex width="100%"><Header user={user}/></Flex>
      <Flex>
      { user == null ? <div>checking auth...</div> : <UserOrAnon user={user}/> }
      </Flex>
    </Flex>
  </ChakraProvider>
}
