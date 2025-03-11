
import { RequestDebugger } from './RequestDebugger';

export const RequestsWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {process.env.NODE_ENV !== 'production' && <RequestDebugger />}
      {children}
    </>
  );
};
