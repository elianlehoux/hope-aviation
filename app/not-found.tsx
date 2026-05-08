'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Title } from '@/components/ui/title';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  const handleReturn = () => {
    // Navigate back if there's history from our own origin, otherwise go to home
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.origin)) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-20 lg:py-32 bg-white text-center">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-6">
          <Title level="display1" className="text-accent text-[120px] md:text-[180px] font-bold leading-none">404</Title>
          <Title level="h2" as="h1" className="text-primary mt-4">
            Nothing to see here...
          </Title>
          <p className="text-[18px] text-muted-foreground leading-[1.44] max-w-lg mx-auto mt-2">
            The page you are looking for has been moved, renamed, or is temporarily unavailable. Go back to the previous page or consider supporting us with a donation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleReturn} variant="default" size="lg">
            Return
          </Button>
          <Button asChild variant="link" size="lg">
            <Link href="/donate">
              Donate
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
