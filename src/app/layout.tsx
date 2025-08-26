import "./reset.css";
import "./globals.css";
import styles from "./layout.module.css";
import WindowManager from "@/features/OS/WindowManager";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={styles.body}>
				<main className={styles.main}>
					<WindowManager>{children}</WindowManager>
				</main>
			</body>
		</html>
	);
}
