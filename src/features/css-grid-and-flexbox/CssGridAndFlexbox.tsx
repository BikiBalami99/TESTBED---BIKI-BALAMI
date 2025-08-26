import styles from "./CssGridAndFlexbox.module.css";

export default function CssGridAndFlexbox() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>CSS Grid & Flexbox</h1>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>🎯 CSS Grid Layout</h2>
				<p className={styles.description}>
					Grid layout gives you control over both rows and columns, creating complex
					layouts with ease.
				</p>
				<div className={styles.codeBlock}>
					{`.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}`}
				</div>
			</div>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>🔄 Flexbox Layout</h2>
				<p className={styles.description}>
					Flexbox is perfect for one-dimensional layouts - aligning items in rows or
					columns.
				</p>
				<div className={styles.codeBlock}>
					{`.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}`}
				</div>
			</div>

			<div className={styles.callToAction}>
				<h3 className={styles.callToActionTitle}>🛠️ Layout Masters Unite!</h3>
				<p className={styles.callToActionText}>
					Choose the right tool for the job - Grid for 2D, Flexbox for 1D layouts!
				</p>
			</div>
		</div>
	);
}
