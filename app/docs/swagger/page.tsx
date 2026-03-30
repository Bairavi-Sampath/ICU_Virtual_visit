'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
  useEffect(() => {
    // Suppress UNSAFE_componentWillReceiveProps warning from swagger-ui-react
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('UNSAFE_componentWillReceiveProps')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <SwaggerUI url="/api/docs/swagger.json" />
    </div>
  );
}
