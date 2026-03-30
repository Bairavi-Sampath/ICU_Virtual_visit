export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .swagger-ui .topbar {
          background-color: #1f2937;
        }
        .swagger-ui .info .title {
          color: #1f2937;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      {children}
    </>
  );
}
