import React from 'react';

import { Button, Flex, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { getRouter } from 'navigo-react';

import {
  addRecord,
  useFirestoreCollection,
  updateRecord,
  setQuery
} from './firebase';



function SetItem({id, set}) {
  function nav() {
    getRouter().navigate(`/sets/${id}`)
  }

  function deleteItem() {
    updateRecord(`sets/${id}`, {deletedAt: new Date().valueOf()});
  }

  return <Flex>
    <Flex onClick={nav}>{set.name || '[No name]'}</Flex>
    <IconButton onClick={deleteItem} icon={<DeleteIcon/>}/>
  </Flex>;
}

export default function({user}) {
  org = user.email.split('@')[1];

  const { data, loaded } = useFirestoreCollection(setQuery(user));

  function createSet() {
    addRecord('sets', {
      name: new Date().valueOf().toString(),
      createdAt: new Date().valueOf(),
      creator: user.uid,
      items: [],
      deletedAt: null,
      org: org,
      shared: false,
      defaultValue: '[missing]'
    });
  }

  return <Flex direction="column">
    <Button onClick={createSet}>Create Set</Button>
    { loaded && Object.entries(data).map(([id, set]) => (
      <SetItem key={id} id={id} set={set}/>
    )) }
  </Flex>;
}
