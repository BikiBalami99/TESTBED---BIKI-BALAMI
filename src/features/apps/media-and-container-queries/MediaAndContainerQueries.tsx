import styles from "./MediaAndContainerQueries.module.css";

export default function MediaAndContainerQueries() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Media and Container Queries</h1>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>📱 Responsive Design</h2>
				<p className={styles.description}>
					Media queries allow you to apply different styles based on device
					characteristics like screen size, orientation, and resolution.
				</p>

				<div className={styles.codeBlock}>
					{`/* Mobile First */
@media (min-width: 768px) {
  .container { max-width: 1200px; }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .sidebar { display: block; }
}`}
				</div>
			</div>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>📦 Container Queries</h2>
				<p className={styles.description}>
					Container queries let components adapt based on their container&apos;s size, not
					just the viewport.
				</p>

				<div className={styles.codeBlock}>
					{`.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { display: flex; }
}`}
				</div>
			</div>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>🎨 Modern Techniques</h2>
				<ul className={styles.featureList}>
					<li>
						<strong>Fluid Typography:</strong> Using clamp() for responsive text sizes
					</li>
					<li>
						<strong>Logical Properties:</strong> margin-inline vs margin-left/right
					</li>
					<li>
						<strong>Container Units:</strong> cqi, cqw for container-relative sizing
					</li>
					<li>
						<strong>Grid & Flexbox:</strong> Modern layout techniques
					</li>
				</ul>
			</div>

			<div className={styles.callToAction}>
				<h3 className={styles.callToActionTitle}>
					🚀 Ready to build responsive designs?
				</h3>
				<p className={styles.callToActionText}>
					Master these techniques to create websites that work beautifully on any device!
				</p>
			</div>
		</div>
	);
}
