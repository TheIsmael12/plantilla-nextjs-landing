import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SpainMap from '@/components/ui/home/SpainMap';

import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/expansionMapSection.scss';

const meta = {
  title: 'Components/UI/Home/SpainMap',
  component: SpainMap,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="home__spain-map-frame" style={{ background: '#0f2f3a', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpainMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
