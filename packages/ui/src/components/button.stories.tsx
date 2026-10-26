import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';

const meta: Meta<typeof Button> = {
  title: 'GymOS/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Book Class / احجز الحصة',
  },
};

export const SecondaryAmber: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Renew Membership / تجديد الاشتراك',
  },
};
