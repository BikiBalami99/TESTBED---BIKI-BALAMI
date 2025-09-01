import "./reset.css";
import "./globals.css";
import styles from "./layout.module.css";
import OS from "@/features/OS";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={styles.body}>
				<OS>{children}</OS>
			</body>
		</html>
	);
}
