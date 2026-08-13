import { notFound } from 'next/navigation';
import NeuronSwitchDebugPage from '@/components/debug/NeuronSwitchDebugPage';
import { isNeuronSwitchDebugEnabled } from '@/lib/neuronSwitchDebug';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!isNeuronSwitchDebugEnabled()) {
    notFound();
  }

  return <NeuronSwitchDebugPage />;
}
