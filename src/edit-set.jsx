import React, { useEffect, useState } from 'react';
import { getRouter, useNavigo } from 'navigo-react';
import {
  Flex,
  Input,
  Link,
  Button,
  IconButton,
  Switch,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';


import { useFirestoreDocument, updateRecord } from './firebase';


export default function ({user}) {
  const { match } = useNavigo();
  const { id } = match.data;
  const [newName, setNewName] = useState("");
  const [newItems, setNewItems] = useState([]);
  const [newShared, setNewShared] = useState(false);

  const { data, loaded } = useFirestoreDocument(`/sets/${id}`)

  function updateName(event) {
    setNewName(event.target.value)
  }

  function updateField(event, index, field) {
    newItems[index][field] = event.target.value;
    setNewItems([...newItems]);
  }

  function updateShared(event) {
    setNewShared(event.target.checked)
  }

  function addRow() {
    setNewItems([...newItems, {key: "", value: "", id: new Date().valueOf()}])
  }

  function deleteRow(index) {
    newItems.splice(index, 1)
    setNewItems([...newItems]);
  }

  useEffect(() => {
    if (loaded) updateRecord(`sets/${id}`, {...data, name: newName, items: newItems, shared: newShared})
  }, [newName, newItems, newShared]);

  useEffect(() => {
    if (loaded) {
      setNewName(data.name);
      setNewItems(data.items);
      setNewShared(data.shared);
    }
  }, [loaded]);

  if (!loaded) return 'loading...'

  return <Flex direction="column">
    <Flex align="center" width="100%">
      <Flex mr={2}><Link onClick={() => getRouter().navigate('/')}>Sets</Link> &gt;&gt;</Flex>
      <Flex>
        <Input placeholder="name" value={newName} onChange={updateName}/>
      </Flex>
      { data.creator == user.uid && (
        <Flex ml={2}>
          Shared?
          <Switch isChecked={newShared} onChange={updateShared}/>
          (with <Text as='i' ml={1}>{data.org}</Text>)
        </Flex>
      )}
    </Flex>
    <Flex direction="column">
      { newItems.map((item, index) => (
        <Flex key={item.id}>
          <Input
            placeholder="key"
            value={item.key}
            onChange={e => updateField(e, index, 'key')}
          />
          <Input
            placeholder="value"
            value={item.value}
            onChange={e => updateField(e, index, 'value')}
          />
          <IconButton onClick={() => deleteRow(index)} icon={<DeleteIcon/>}/>
        </Flex>
      ))}
    </Flex>
    <Flex>
      <Button onClick={addRow}>Add Row</Button>
    </Flex>
  </Flex>
}
