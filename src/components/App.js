// @flow
import React from 'react';
import styled from 'react-emotion';
import Wave from './Wave';
const { ipcRenderer } = window.require('electron');

const Container = styled('main')`
  display: flex;
  flex: 1;
  background-color: #1d1f23;
  color: pink;
  justify-content: center;
  align-items: center;
`;

export default function App() {
  console.log(ipcRenderer);
  console.log('speak!');
  ipcRenderer.send('speak', 1);
  ipcRenderer.on('speaking', () => console.log('speaking'));
  ipcRenderer.on('spoken', () => console.log('spoken'));
  return (
    <Container>
      <Wave />
    </Container>
  );
}
