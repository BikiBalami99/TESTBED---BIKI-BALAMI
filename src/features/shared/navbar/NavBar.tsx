import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<Link href="/" className={styles.navbarBrand}>
					Dev Collection
				</Link>
			</div>
		</nav>
	);
}
