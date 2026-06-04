import "../styles.css";

export const metadata = {
  title: {
    default: "Bukuri - Rezervo termine bukurie ne Kosove",
    template: "%s - Bukuri"
  },
  description: "Rezervo termine bukurie dhe mireqenieje ne Kosove."
};

export default function RootLayout({ children }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
