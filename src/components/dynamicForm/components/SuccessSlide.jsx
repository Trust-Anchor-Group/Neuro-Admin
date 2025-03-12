import { useLottie } from 'lottie-react';
import successAnimation from './../assets/animation_success_icon.json';
import Link from 'next/link';

export default function SuccessSlide() {
  const options = {
    animationData: successAnimation,
    loop: false,
    style: { width: 200, height: 200 },
  };

  const { View } = useLottie(options);

  return (
    <div className="border p-10 rounded shadow-sm max-w-sm flex flex-col items-center">
      <div>{View}</div>
      <div className="text-center flex flex-col gap-5">
        <p>Your form has been sent successfully and will be reviewed soon.</p>
        <Link href="/" className="border p-3 rounded shadow-sm">
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
