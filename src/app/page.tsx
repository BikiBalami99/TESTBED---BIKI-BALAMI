import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
	return (
		<ul className={styles.cardList}>
			<li className={styles.cardItem}>
				<Link href="/media-and-container-queries">Media and Container Queries</Link>
			</li>
		</ul>
	);
}
