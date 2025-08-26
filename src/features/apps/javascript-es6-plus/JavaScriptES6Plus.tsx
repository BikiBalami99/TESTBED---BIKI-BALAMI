import styles from "./JavaScriptES6Plus.module.css";

export default function JavaScriptES6Plus() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>JavaScript ES6+</h1>

			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>⚡ Modern JavaScript Features</h2>
				<ul className={styles.featureList}>
					<li>
						<strong>Arrow Functions:</strong> Concise function syntax
					</li>
					<li>
						<strong>Template Literals:</strong> Enhanced string interpolation
					</li>
					<li>
						<strong>Destructuring:</strong> Easy object/array unpacking
					</li>
					<li>
						<strong>Promises & Async/Await:</strong> Asynchronous programming
					</li>
					<li>
						<strong>Modules:</strong> Import/export functionality
					</li>
				</ul>
			</div>

			<div className={styles.codeBlock}>
				{`// Arrow Functions
const greet = (name) => \`Hello, \${name}!\`;

// Destructuring
const { name, age } = user;

// Async/Await
async function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}

// Template Literals
const message = \`Welcome \${user.name}!
You are \${user.age} years old.\`;`}
			</div>

			<div className={styles.callToAction}>
				<h3 className={styles.callToActionTitle}>🚀 Level Up Your JavaScript!</h3>
				<p className={styles.callToActionText}>
					Master modern JavaScript features to write cleaner, more efficient code!
				</p>
			</div>
		</div>
	);
}
