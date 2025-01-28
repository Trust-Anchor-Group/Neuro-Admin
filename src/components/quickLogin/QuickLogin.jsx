import config from '@/config/config';
import { v4 as uuidv4 } from 'uuid';
import { fetchServiceId } from '@/utils/quickLogin';
import { fetchQrCode } from '@/utils/quickLogin';
import QrCode from '@/components/quickLogin/QrCode';

export default async function QuickLogin() {

  const service = config.quickLogin.callBackUrl;

  if(!service.startsWith('https://')){
    console.error('Misconfigured callback URL: The URL must use HTTPS.');
  }

  const tabId = uuidv4().replaceAll('-', '');
  const sessionId = uuidv4().replaceAll('-', '');
  let serviceId, qrCodeUrl;

  try {
    serviceId = await fetchServiceId({ service, sessionId });
    qrCodeUrl = await fetchQrCode({ serviceId, tabId });
  } catch(error) {
    console.error('Error fetching QR code data', error);
    return null;
  }

  return (
    <QrCode
      initialQrCodeUrl={qrCodeUrl}
      serviceId={serviceId}
      sessionId={sessionId}
      tabId={tabId}
    />
  );
}
