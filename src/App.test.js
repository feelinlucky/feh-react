import React from 'react';
import { render, screen } from '@testing-library/react';
import SingleCharacterStatUI from './components/SingleCharacterStatUI';

test('renders learn react link', () => {
  render(<SingleCharacterStatUI characterStatType="Attack"/>);
});