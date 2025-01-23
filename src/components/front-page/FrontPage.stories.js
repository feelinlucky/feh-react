import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import FrontPage from './FrontPage';

export default {
  title: 'FrontPage',
  component: FrontPage,
};

const Template = (args) => (
  <MemoryRouter>
    <FrontPage {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};