// @flow
import React from 'react';
import styled, { keyframes } from 'react-emotion';

const colors = ['#4489F1', '#E6463C', '#F9BB2E', '#41A656'];

const zoomIn = keyframes`
    0% {
        transform: scale(2);
    }
    60% {
        transform: scale(2);
    }
    100% {
        transform: scale(1);
    }
`;

const bounce = keyframes`
    0% {
        transform: translateY(0%);
    }
    20% {
        transform: translateY(50%);
    }
    80% {
        transform: translateY(-50%);
    }
    100% {
        transform: translateY(0%);
    }
`;

const Container = styled('div')`
  display: flex;
  justify-content: space-between;
  width: 4em;
  animation: ${zoomIn} 1s ease-in forwards;
`;

const Dot = styled('div')`
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background-color: ${props => props.color};
  transform-origin: center;
  animation: ${bounce} 1s linear infinite 1.25s;
  animation-delay: ${props => `${props.delay + 1.25}s`};
`;

export default function Wave() {
  return (
    <Container>
      {colors.map((color, index) => (
        <Dot key={index} color={color} delay={index * 0.1} />
      ))}
    </Container>
  );
}
