import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey) {
      setLoadError(
        'Cloudflare Turnstile site key (VITE_TURNSTILE_SITE_KEY) is missing. Human verification cannot be loaded.'
      );
      if (onError) {
        onError('VITE_TURNSTILE_SITE_KEY is missing');
      }
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors
        }
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token: string) => {
            if (isMounted) {
              setVerified(true);
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setVerified(false);
              if (onExpire) onExpire();
            }
          },
          'error-callback': (code: string) => {
            if (isMounted) {
              setVerified(false);
              const errMsg = `Turnstile verification failed (code: ${code})`;
              setLoadError(errMsg);
              if (onError) onError(errMsg);
            }
          },
        });
        widgetIdRef.current = id;
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err.message || 'Failed to render Turnstile widget');
        }
      }
    };

    // Check if script is already present
    const existingScript = document.getElementById('cf-turnstile-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          renderWidget();
        }
      };
      script.onerror = () => {
        if (isMounted) {
          setLoadError('Failed to load Cloudflare Turnstile script.');
        }
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      existingScript.addEventListener('load', renderWidget);
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore
        }
      }
    };
  }, [siteKey]);

  if (!siteKey || loadError) {
    return (
      <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Security Verification Configuration Required:</span>
          <p className="mt-0.5">
            {loadError || 'VITE_TURNSTILE_SITE_KEY is not configured in the environment.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-3 min-h-[65px]">
      <div ref={containerRef} className="turnstile-container" />
      {verified && (
        <div className="flex items-center gap-1.5 text-xs text-forest-700 mt-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security check verified</span>
        </div>
      )}
    </div>
  );
};
