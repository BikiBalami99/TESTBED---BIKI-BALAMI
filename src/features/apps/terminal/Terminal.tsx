import styles from "./Terminal.module.css";

export default function Terminal() {
	return (
		<div className={styles.terminal}>
			<div className={styles.header}>
				<div className={styles.headerControls}>
					<div className={styles.control} style={{ backgroundColor: "#ff5f57" }}></div>
					<div className={styles.control} style={{ backgroundColor: "#ffbd2e" }}></div>
					<div className={styles.control} style={{ backgroundColor: "#28ca42" }}></div>
				</div>
				<div className={styles.title}>Terminal - zsh</div>
			</div>
			<div className={styles.content}>
				<div className={styles.output}>
					<div className={styles.line}>
						<span className={styles.prompt}>user@macbook ~ % </span>
						<span className={styles.command}>ls -la</span>
					</div>
					<div className={styles.line}>
						<span className={styles.outputText}>total 48</span>
					</div>
					<div className={styles.line}>
						<span className={styles.outputText}>
							drwxr-xr-x 25 user staff 800 Dec 10 10:30 .
						</span>
					</div>
					<div className={styles.line}>
						<span className={styles.outputText}>
							drwxr-xr-x 5 user staff 160 Dec 10 10:30 ..
						</span>
					</div>
					<div className={styles.line}>
						<span className={styles.outputText}>
							-rw-r--r-- 1 user staff 2200 Dec 10 10:30 .zshrc
						</span>
					</div>
					<div className={styles.line}>
						<span className={styles.prompt}>user@macbook ~ % </span>
						<span className={styles.cursor}>█</span>
					</div>
				</div>
			</div>
		</div>
	);
}
