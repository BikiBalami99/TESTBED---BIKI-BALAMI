import "./reset.css";
import "./globals.css";
import styles from "./layout.module.css";
import NavBar from "@/features/shared/navbar/NavBar";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={styles.body}>
				<NavBar />
				<main className={styles.main}>{children}</main>
			</body>
		</html>
	);
}
