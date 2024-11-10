import { SessionProvider, useSession } from "next-auth/react";
 
function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;

// Create a wrapper for protected pages
export function ProtectedRoute(Component) {
  return function ProtectedPage(props) {
    const { data: session, status } = useSession({ required: true });

    if (status === "loading") {
      return <p>Loading...</p>;
    }

    if (!session) {
      return <p>Access Denied</p>;
    }

    return <Component {...props} />;
  };
}
